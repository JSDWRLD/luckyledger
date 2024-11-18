import { raffleContract } from './web3Init.js';

export async function getRaffleCount() {
    try {
        const count = await raffleContract.methods.raffleCount().call();
        console.log("Total Raffles:", count);
        return count;
    } catch (error) {
        console.error("Error fetching raffle count:", error);
        throw new Error("Unable to fetch raffle count");
    }
}

