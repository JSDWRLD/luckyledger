import '../src/style.css';
import { setupDropdown } from './dropdown.js';
import { web3, initWeb3 } from './web3/web3Init.js';
import { getRaffleCount } from './web3/getRaffleCount.js';
import { getRaffleDetails } from './web3/getRaffleDetails.js';
import { createRaffle } from './web3/createRaffle.js';
import { buyTicket, endRaffle } from './web3/ticketActions.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initWeb3();

  const toggleButton = document.getElementById("hamButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  setupDropdown(toggleButton, dropdownMenu);

  const createRaffleModal = document.querySelector("#createRaffleModal");
  const createRaffleButton = document.querySelector("#createRaffleButton");
  const openCreateModalButton = document.querySelector("#openCreateRaffleModalButton");
  const closeCreateModalButton = document.querySelector("#closeCreateRaffleModalButton");

  openCreateModalButton.addEventListener("click", () => {
    createRaffleModal.classList.remove("hidden");
  });

  closeCreateModalButton.addEventListener("click", () => {
    createRaffleModal.classList.add("hidden");
  });

  createRaffleButton.addEventListener("click", async () => {
    const entryFee = document.querySelector('#entryFeeInput').value;
    const duration = document.querySelector('#durationInput').value;
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    try {
      await createRaffle(web3.utils.toWei(entryFee, 'ether'), duration, account);
      await loadRaffles();
      refreshRaffleState();
      createRaffleModal.classList.add("hidden");
    } catch (error) {
      console.error('Error creating raffle:', error);
    }
  });

  await loadRaffles();
  setUpBuyTicketListener(); //loads the buy ticket button functionality
  setInterval(() => {
    updateTimeRemaining();
    refreshRaffleState();  // Refresh raffle state on countdown update
  }, 1000);
  setUpEndRaffleListener();
});

document.querySelectorAll('.end-raffle-btn').forEach(button => {
  button.addEventListener('click', async (event) => {
      const raffleId = event.target.dataset.raffleId;
      const account = await getUserAccount(); // Implement this to get the user's connected wallet address

      try {
          const receipt = await endRaffle(raffleId, account);

          // Extract winner data from the receipt
          const winnerEvent = receipt.events.WinnerDrawn;
          const winner = winnerEvent.returnValues.winner;
          const prize = winnerEvent.returnValues.prize;

          // Add the winner to the winners section
          addWinnerToSection(raffleId, winner, prize);
      } catch (error) {
          console.error("Failed to end raffle:", error);
      }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const viewRafflesButton = document.getElementById("viewRafflesButton");
  
  if (viewRafflesButton) {
    viewRafflesButton.addEventListener("click", () => {
      window.location.href = "/"; // Redirect to the main page
    });
  }
});


async function loadRaffles() {
  const raffleCount = await getRaffleCount();
  const rafflesContainer = document.querySelector(".other-raffles");
  rafflesContainer.innerHTML = "";

  if (raffleCount === 0) {
    document.querySelector('.biggest-raffle-card').innerHTML = `
      <h2 class="text-4xl font-extrabold mb-6">💸 Current Jackpot 💸</h2>
      <div class="text-2xl font-extrabold mb-3">Prize: <span class="text-white">None</span></div>
      <div class="text-lg font-medium mb-4">Time Remaining: N/A</div>
      <button class="bg-gray-500 text-white w-full py-4 text-xl rounded-full font-extrabold shadow-lg cursor-not-allowed" disabled>Buy Ticket</button>
    `;
    rafflesContainer.innerHTML = "<p class='text-white'>No raffles available at the moment.</p>";
    return;
  }

  let biggestPrize = 0;
  let biggestRaffle = null;

  for (let i = 1; i <= raffleCount; i++) {
    const raffle = await getRaffleDetails(i);

    // Skip inactive raffles
    if (!raffle.isActive) {
      continue;
  }
    // Convert BigInt values to JS numbers for safe usage
    raffle.deadline = Number(raffle.deadline); // Convert deadline
    raffle.prizePool = web3.utils.fromWei(raffle.prizePool, 'ether'); // Convert prize pool to Ether

    const prizePool = parseFloat(raffle.prizePool);

    if (prizePool > biggestPrize) {
      biggestPrize = prizePool;
      biggestRaffle = { id: i, ...raffle };
    }
    displayRaffle(i, raffle);
  }

  if (biggestRaffle) {
    document.querySelector('.biggest-raffle-card').innerHTML = `
      <h2 class="text-4xl font-extrabold mb-6">💸 Current Jackpot 💸</h2>
      <div class="text-2xl font-extrabold mb-3">Prize: <span class="text-white">${biggestRaffle.prizePool} ETH</span></div>
      <div class="text-lg font-medium mb-4">Time Remaining: <span class="time-remaining" data-deadline="${biggestRaffle.deadline}">${calculateTimeRemaining(biggestRaffle.deadline)}</span></div>
      <div class="text-lg font-medium mb-6">Host: ${biggestRaffle.host || "N/A"}</div>
      <button class="buy-ticket-btn bg-gold text-darkGreen w-full py-4 text-xl rounded-full font-extrabold shadow-lg" data-raffle-id="${biggestRaffle.id}">
        Buy Ticket
      </button>
      <div class="text-lg mt-4 font-semibold">Price per Ticket: ${web3.utils.fromWei(biggestRaffle.entryFee, 'ether') + " ETH" || "N/A"}</div>
      <div class="text-lg font-semibold">Tickets Bought: ${biggestRaffle.ticketCount || 0}</div>
      <button class="end-raffle-btn bg-red-800 text-white w-full py-2 rounded-lg font-semibold shadow-md mt-2" data-raffle-id="${biggestRaffle.id}">
        End Raffle
      </button>
    `;
  }
}

function displayRaffle(raffleId, raffle) {
  const now = Date.now();
  const endTimeMs = raffle.deadline * 1000; // Convert seconds to milliseconds

  const isExpired = endTimeMs <= now;

  const rafflesContainer = document.querySelector(".other-raffles");
  const raffleCard = document.createElement("div");
  raffleCard.className = "raffle-card bg-darkGreen p-10 rounded-lg shadow-lg text-white text-center border-4 border-gold";
  
  raffleCard.innerHTML = `
        <h3 class="text-2xl font-semibold text-gold mb-4">Prize: ${raffle.prizePool} ETH</h3>
        
        <div class="text-lg mb-4">Time Remaining: <span class="time-remaining" data-deadline="${raffle.deadline}">${calculateTimeRemaining(raffle.deadline)}</span></div>
        
        <div class="text-lg mb-4">Tickets Bought: ${raffle.ticketCount || 0}</div>
        <div class="text-lg mb-4">Price per Ticket: ${web3.utils.fromWei(raffle.entryFee, 'ether')} ETH</div>

        <button class="buy-ticket-btn bg-gold text-darkGreen w-full py-3 rounded-lg font-semibold shadow-md" 
                data-raffle-id="${raffleId}" ${isExpired ? 'disabled' : ''}>
            Buy Ticket
        </button>
        <button class="end-raffle-btn bg-red-800 text-white w-full py-3 rounded-lg font-semibold shadow-md mt-4" 
                data-raffle-id="${raffleId}" ${!isExpired ? 'disabled' : ''}>
            End Raffle
        </button>
    `;
  rafflesContainer.appendChild(raffleCard);
}


function calculateTimeRemaining(endTime) {
  const currentTime = Date.now(); // Current time in milliseconds
  const timeRemaining = endTime * 1000 - currentTime; // Convert deadline to milliseconds

  if (timeRemaining > 0) {
    const seconds = Math.floor(timeRemaining / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }

  return "Expired";
}

async function setUpEndRaffleListener() {
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('end-raffle-btn')) {
      const raffleId = event.target.dataset.raffleId;
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      try {
        // Fetch raffle details
        const raffleDetails = await getRaffleDetails(raffleId);
        
        // Check if the raffle is expired before allowing to end it
        if (raffleDetails.deadline > Math.floor(Date.now() / 1000)) {
          alert('You can only end a raffle that has expired!');
          return; // Exit early if raffle hasn't expired
        }

        console.log(`Ending raffle ID: ${raffleId}`);
        const receipt = await endRaffle(raffleId, account);

        alert('Raffle ended successfully!');
        console.log('End Raffle Transaction Receipt:', receipt);
        await loadRaffles(); // Refresh the raffles display
      } catch (error) {
        console.error('Error ending raffle:', error);
        alert('Failed to end raffle.');
      }
    }
  });
}

function updateTimeRemaining() {
  document.querySelectorAll('.time-remaining').forEach(span => {
    const deadline = span.dataset.deadline;
    span.textContent = calculateTimeRemaining(deadline);
  });
}

function setUpBuyTicketListener(){
  //loads the interactivity of the buy ticket button
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('buy-ticket-btn')) {
        const raffleId = event.target.dataset.raffleId; // accepts input from data-raffle-id="${raffleId}" above
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        try {
            // get raffle details
            const raffleDetails = await getRaffleDetails(raffleId);
            const entryFee = raffleDetails.entryFee;
            console.log(`Buying ticket for Raffle ID: ${raffleId}, Entry Fee: ${entryFee}`);
            // Use the buyTicket function from ticketActions.js
            const receipt = await buyTicket(raffleId, entryFee, account);

            alert('Ticket purchased successfully!'); //pops out alert box on page
            console.log('Transaction Receipt:', receipt);
            await loadRaffles();
        } catch (error) {
            console.error('Error purchasing ticket:', error);
            alert('Failed to purchase ticket.');
        }
    }
  });
}

function refreshRaffleState() {
  const raffles = document.querySelectorAll('.raffle-card');
  raffles.forEach((raffleCard) => {
    const raffleId = raffleCard.querySelector('.buy-ticket-btn')?.dataset.raffleId;
    if (!raffleId) return;

    const timeRemainingSpan = raffleCard.querySelector('.time-remaining');
    const deadline = parseInt(timeRemainingSpan?.dataset.deadline, 10);
    const isExpired = Date.now() > deadline * 1000;

    const buyButton = raffleCard.querySelector('.buy-ticket-btn');
    const endButton = raffleCard.querySelector('.end-raffle-btn');

    if (isExpired) {
      buyButton.disabled = true;
      endButton.disabled = false;
    } else {
      buyButton.disabled = false;
      endButton.disabled = true;
    }
  });
}

function addWinnerToSection(raffleId, winner, prize) {
  const winnersSection = document.getElementById('winnersSection');
  const winnersList = document.getElementById('winnersList');

  // Create a new card for the winner
  const winnerCard = document.createElement('div');
  winnerCard.className = "winner-card bg-gradient-to-r from-gold to-yellow-500 p-4 rounded-lg shadow-md text-darkGray";

  winnerCard.innerHTML = `
      <h3 class="text-2xl font-bold mb-2">🎊 Winner Drawn 🎊</h3>
      <p class="mb-1"><strong>Raffle ID:</strong> ${raffleId}</p>
      <p class="mb-1"><strong>Winner:</strong> <span class="text-gold">${winner}</span></p>
      <p class="mb-2"><strong>Prize:</strong> <span class="text-gold">${web3.utils.fromWei(prize, 'ether')} ETH</span></p>
  `;

  // Add the new card to the winners list
  winnersList.prepend(winnerCard); // Add to the top of the list

  // Show the winners section if it's hidden
  if (winnersSection.classList.contains('hidden')) {
      winnersSection.classList.remove('hidden');
  }
}
