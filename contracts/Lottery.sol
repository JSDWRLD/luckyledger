// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

contract Lottery {

    struct Raffle {
        address host;
        uint256 entryFee; // Entry fee in wei
        uint256 prizePool; // Prize pool in wei
        uint256 ticketCount; // Count of tickets sold
        uint256 deadline; // Timestamp for raffle expiry
        address[] participants; // List of participants
        bool isActive; // Status of the raffle
    }

    mapping(uint256 => Raffle) public raffles; // Mapping of raffle ID to Raffle struct
    uint256 public raffleCount; // Counter for raffle IDs

    // Maximum amount a user can spend on tickets (0.1 ETH)
    uint256 constant MAX_TICKET_PURCHASE = 10 ether;

    // A fee percentage the host takes as profit (e.g., 5%)
    uint256 constant HOST_FEE_PERCENTAGE = 5;

    // Event declarations
    event RaffleCreated(uint256 raffleId, address host, uint256 entryFee, uint256 deadline);
    event TicketPurchased(uint256 raffleId, address participant);
    event WinnerDrawn(uint256 raffleId, address winner, uint256 prize);

    modifier onlyHost(uint256 _raffleId) {
        require(msg.sender == raffles[_raffleId].host, "Not the raffle host");
        _;
    }

    modifier raffleActive(uint256 _raffleId) {
        require(raffles[_raffleId].isActive, "Raffle is not active");
        _;
    }

    modifier raffleNotExpired(uint256 _raffleId) {
        require(block.timestamp < raffles[_raffleId].deadline, "Raffle has expired");
        _;
    }

    modifier raffleExpired(uint256 _raffleId) {
        require(block.timestamp >= raffles[_raffleId].deadline, "Raffle is still active");
        _;
    }

    modifier underMaxTicketPurchase() {
        require(msg.value <= MAX_TICKET_PURCHASE, "Ticket purchase exceeds max limit (0.1 ETH)");
        _;
    }

    // Create a new raffle
    function createRaffle(uint256 _entryFee, uint256 _duration) external {
        require(_entryFee > 0, "Entry fee must be greater than 0");

        raffleCount++;
        uint256 raffleId = raffleCount;

        Raffle storage newRaffle = raffles[raffleId];
        newRaffle.host = msg.sender;
        newRaffle.entryFee = _entryFee; // Entry fee is in wei
        newRaffle.prizePool = 0;
        newRaffle.ticketCount = 0;
        newRaffle.deadline = block.timestamp + _duration;
        newRaffle.isActive = true;

        emit RaffleCreated(raffleId, msg.sender, _entryFee, newRaffle.deadline);
    }


    // Buy a ticket for a raffle
    function buyTicket(uint256 _raffleId) external payable raffleActive(_raffleId) raffleNotExpired(_raffleId) underMaxTicketPurchase {
        Raffle storage raffle = raffles[_raffleId];
        require(msg.value == raffle.entryFee, "Incorrect ETH sent");

        // Calculate host's profit
        uint256 hostFee = (msg.value * HOST_FEE_PERCENTAGE) / 100;
        uint256 prizeAmount = msg.value - hostFee;

        // Add participant
        raffle.participants.push(msg.sender);
        raffle.ticketCount++;
        raffle.prizePool += prizeAmount;

        // Transfer the host fee to the host
        (bool success, ) = raffle.host.call{value: hostFee}("");
        require(success, "Host fee transfer failed");

        emit TicketPurchased(_raffleId, msg.sender);
    }

    // Draw a random winner for the raffle once it has expired
    // Modified drawWinner with host's 20% cut for winningss
    function drawWinner(uint256 _raffleId) external raffleActive(_raffleId) raffleExpired(_raffleId) onlyHost(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.participants.length > 0, "No participants in the raffle");

        // Pick a random winner
        uint256 winnerIndex = random(raffle.participants.length);
        address winner = raffle.participants[winnerIndex];

        // Calculate prize distribution
        uint256 hostShare = (raffle.prizePool * 20) / 100;
        uint256 winnerPrize = raffle.prizePool - hostShare;

        // Transfer prize to winner and fee to host
        (bool winnerPaid, ) = payable(winner).call{value: winnerPrize}("");
        require(winnerPaid, "Winner payment failed");

        (bool hostPaid, ) = payable(raffle.host).call{value: hostShare}("");
        require(hostPaid, "Host fee payment failed");

        emit WinnerDrawn(_raffleId, winner, winnerPrize);

        // Close raffle
        raffle.isActive = false;
        delete raffle.participants;
    }


    // Get details of a raffle
    function getRaffleDetails(uint256 _raffleId) external view returns (address host, uint256 entryFee, uint256 prizePool, uint256 ticketCount, uint256 deadline, bool isActive) {
        Raffle storage raffle = raffles[_raffleId];
        return (raffle.host, raffle.entryFee, raffle.prizePool, raffle.ticketCount, raffle.deadline, raffle.isActive);
    }

    // View the owner's details for a specific raffle
    function ownerRaffleView(uint256 _raffleId) external view onlyHost(_raffleId) returns (uint256 prizePool, uint256 ticketCount, uint256 deadline) {
        Raffle storage raffle = raffles[_raffleId];
        return (raffle.prizePool, raffle.ticketCount, raffle.deadline);
    }

    // Pseudo-random number generator (for simplicity, use blockhash and timestamp)
    function random(uint256 _limit) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, _limit))) % _limit;
    }
}
