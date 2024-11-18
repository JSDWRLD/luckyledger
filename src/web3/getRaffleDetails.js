import { raffleContract } from './web3Init.js';

export async function getRaffleDetails(raffleId) {
    try {
        const details = await raffleContract.methods.getRaffleDetails(raffleId).call();
        console.log(`Details of Raffle #${raffleId}:`, details);
        return details;
    } catch (error) {
        console.error("Error fetching raffle details:", error);
        throw new Error("Unable to fetch raffle details");
    }
}