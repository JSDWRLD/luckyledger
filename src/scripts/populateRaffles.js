const Web3 = require('web3').default;

// Web3 and Contract Setup
const web3 = new Web3("http://127.0.0.1:8545");
const contractABI = require('../../build/contracts/Lottery.json').abi;
const contractAddress = "0x8c7bfd1f3b424db6a4e7dc7ca70daf7898279fbd";
const raffleContract = new web3.eth.Contract(contractABI, contractAddress);

async function createRaffle(entryFee, duration, account) {
    try {
        if (entryFee <= 0 || duration <= 0) {
            throw new Error("Entry fee and duration must be greater than zero");
        }

        const receipt = await raffleContract.methods
            .createRaffle(entryFee, duration)
            .send({ from: account, gas: 500000 });

        console.log("Raffle created successfully:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error creating raffle:", error);
        throw new Error("Failed to create raffle");
    }
}

async function populateRaffles() {
    try {
        const accounts = await web3.eth.getAccounts();
        const hostAccount = accounts[0]; // Host account for creating raffles

        console.log("Populating Raffles...");

        const entryFee = web3.utils.toWei("1", "ether"); 
        const duration = 60 * 5 * 1; 
        
        // Loop to create 3 raffles
        for (let i = 1; i <= 3; i++) {
            console.log(`Creating raffle ${i}...`);
            await createRaffle(entryFee, duration, hostAccount);
            console.log(`Raffle ${i} created with entry fee: ${web3.utils.fromWei(entryFee, "ether")} ETH and duration: 1 day.`);
        }

        console.log("3 Raffles populated successfully.");
    } catch (error) {
        console.error("Error during raffle creation:", error);
    }
}

// Call the function
populateRaffles();
