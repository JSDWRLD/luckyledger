const Web3 = require('web3').default;

// Web3 and Contract Setup
const web3 = new Web3("http://127.0.0.1:8545");
const contractABI = require('../../build/contracts/Lottery.json').abi;
const contractAddress = "0x8c7bfd1f3b424db6a4e7dc7ca70daf7898279fbd";
const raffleContract = new web3.eth.Contract(contractABI, contractAddress);

// Utility function to generate a random number between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to buy tickets
async function buyRandomTicketsForRaffle(raffleId, entryFee, accounts) {
    for (let i = 5; i <= 10; i++) {
        const account = accounts[i];
        const ticketCount = getRandomInt(1, 5); // Each account buys 1 to 5 tickets randomly
        for (let j = 0; j < ticketCount; j++) {
            try {
                console.log(`Account ${account} purchasing ticket ${j + 1} of ${ticketCount} for Raffle ID ${raffleId}...`);
                const receipt = await raffleContract.methods
                    .buyTicket(raffleId)
                    .send({ from: account, value: entryFee, gas: 500000 });
                console.log(`Ticket ${j + 1} purchased by Account ${account} for Raffle ID ${raffleId}:`, receipt.transactionHash);
            } catch (error) {
                console.error(`Error purchasing ticket ${j + 1} for Raffle ID ${raffleId} by Account ${account}:`, error);
            }
        }
    }
}

// Main function to populate tickets
async function populateTickets() {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log("Populating tickets for raffles...");

        // Get total number of raffles
        const raffleCount = await raffleContract.methods.raffleCount().call();
        console.log(`Total raffles: ${raffleCount}`);

        for (let raffleId = 1; raffleId <= raffleCount; raffleId++) {
            console.log(`Fetching details for Raffle ID ${raffleId}...`);
            const raffleDetails = await raffleContract.methods.getRaffleDetails(raffleId).call();

            // Only purchase tickets for active raffles
            if (raffleDetails.isActive) {
                const entryFee = raffleDetails.entryFee;
                console.log(`Raffle ID ${raffleId} is active. Entry Fee: ${web3.utils.fromWei(entryFee, "ether")} ETH`);
                await buyRandomTicketsForRaffle(raffleId, entryFee, accounts);
            } else {
                console.log(`Raffle ID ${raffleId} is not active. Skipping...`);
            }
        }

        console.log("Tickets populated successfully for all active raffles.");
    } catch (error) {
        console.error("Error populating tickets:", error);
    }
}

// Call the function
populateTickets();
