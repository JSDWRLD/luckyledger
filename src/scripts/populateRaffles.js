const Web3 = require('web3').default;

// Web3 and Contract Setup
const web3 = new Web3("http://127.0.0.1:8545"); 
const contractABI = require('../../build/contracts/Lottery.json').abi;
const contractAddress = "0x86dce17e8cf6e3af80d622753cfbdea7886e18b1";
const raffleContract = new web3.eth.Contract(contractABI, contractAddress);

async function populateBids() {
    try {
        const accounts = await web3.eth.getAccounts();
        const hostAccount = accounts[0]; // Host is acc 1

        console.log("Testing Raffle System...");

        const raffles = [];
        for (let i = 1; i <= 5; i++) {
            const entryFee = web3.utils.toWei((1 * i).toString(), "ether"); // Entry fee here
            const duration = 60 * 60 * 24 * i; // Duration: in days
            const receipt = await raffleContract.methods.createRaffle(entryFee, duration).send({ 
                from: hostAccount, 
                gas: 500000 
            });
            console.log(`Raffle ${i} created with entry fee: ${web3.utils.fromWei(entryFee, "ether")} ETH and duration: ${i} day(s).`);
            raffles.push({ id: i, entryFee });
        }

        console.log("\nTest completed: Raffles created successfully.");
    } catch (error) {
        console.error("Error during raffle test:", error);
    }
}

populateBids();
