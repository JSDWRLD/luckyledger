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

        // Extract the WinnerDrawn event from the transaction receipt
        const winnerEvent = receipt.events.WinnerDrawn;
        const winner = winnerEvent.returnValues.winner;
        const prize = winnerEvent.returnValues.prize;

        alert(`Winner: ${winner}, Prize: ${prize}`);

        return receipt;
    } catch (error) {
        console.error("Error ending raffle:", error);
        throw error;
    }
}

// Not used at the moment. 
function broadcastWinnerToModal(raffleId, winner, prize) {
    const winnerModal = document.getElementById('winnerModal');
    const modalContent = winnerModal.querySelector('.modal-content');

    modalContent.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">🎉 Raffle Winner 🎉</h2>
        <p class="mb-2">Raffle ID: <span class="text-gold">${raffleId}</span></p>
        <p class="mb-2">Winner: <span class="text-gold">${winner}</span></p>
        <p class="mb-4">Prize Amount: <span class="text-gold">${web3.utils.fromWei(prize, 'ether')} ETH</span></p>
        <button class="close-winner-modal-btn bg-red-500 text-white py-2 px-4 rounded">Close</button>
    `;

    // Show the modal
    winnerModal.classList.remove('hidden');

    // Add event listener for closing the modal
    const closeBtn = winnerModal.querySelector('.close-winner-modal-btn');
    closeBtn.addEventListener('click', () => {
        winnerModal.classList.add('hidden');
    });
}
