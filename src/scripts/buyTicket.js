const Web3 = require('web3').default;

// Web3 and Contract Setup
const web3 = new Web3("http://127.0.0.1:8545"); 
const contractABI = require('../../build/contracts/Lottery.json').abi;
const contractAddress = "0x86dce17e8cf6e3af80d622753cfbdea7886e18b1";
const raffleContract = new web3.eth.Contract(contractABI, contractAddress);

async function populateBids() {
    try {
        const accounts = await web3.eth.getAccounts();
        const hostAccount = accounts[0]; // Host address here if needed
        const participants = accounts.slice(1, 6); // Next 5 accounts for ticket purchases

        console.log("Testing Raffle System...");

        // Buy tickets for each raffle with varying participants
        for (const raffle of raffles) {
            console.log(`\nPurchasing tickets for Raffle ${raffle.id}...`);

            for (let j = 0; j < participants.length; j++) {
                const participant = participants[j];
                const ticketPrice = raffle.entryFee;
                try {
                    const receipt = await raffleContract.methods.buyTicket(raffle.id).send({
                        from: participant,
                        value: ticketPrice,
                        gas: 500000,
                    });
                    console.log(`Participant ${participant} bought a ticket for Raffle ${raffle.id} with ${web3.utils.fromWei(ticketPrice, "ether")} ETH.`);
                } catch (error) {
                    console.error(`Error for Participant ${participant} on Raffle ${raffle.id}:`, error.message);
                }
            }
        }

        console.log("\nTest completed: Raffles created and tickets purchased successfully.");
    } catch (error) {
        console.error("Error during raffle test:", error);
    }
}

populateBids();
