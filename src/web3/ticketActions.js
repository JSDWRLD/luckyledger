import { raffleContract } from './web3Init.js';

export async function buyTicket(raffleId, entryFee, account) {
    try {
        const receipt = await raffleContract.methods
            .buyTicket(raffleId)
            .send({ from: account, value: entryFee });
        console.log("Ticket purchased successfully:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error purchasing ticket:", error);
        throw new Error("Failed to purchase ticket");
    }
}

export async function endRaffle(raffleId, account) {
    try {
        const receipt = await raffleContract.methods
            .drawWinner(raffleId)
            .send({ from: account });
        console.log(`Raffle ${raffleId} ended successfully. Winner drawn.`);
        return receipt;
    } catch (error) {
        console.error("Error ending raffle:", error);
        throw error;
    }
}
