import { raffleContract } from './web3Init.js';

export async function createRaffle(entryFee, duration, account) {
    console.log(entryFee)
    try {
        if (entryFee <= 0 || duration <= 0) {
            throw new Error("Entry fee and duration must be greater than zero");
        }
        const receipt = await raffleContract.methods
            .createRaffle(entryFee, duration)
            .send({ from: account });
        console.log("Raffle created successfully:", receipt);
        return receipt;
    } catch (error) {
        console.error("Error creating raffle:", error);
        throw new Error("Failed to create raffle");
    }
}