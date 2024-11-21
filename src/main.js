import '../src/style.css';
import { setupDropdown } from './dropdown.js';
import { web3, initWeb3 } from './web3/web3Init.js';
import { getRaffleCount } from './web3/getRaffleCount.js';
import { getRaffleDetails } from './web3/getRaffleDetails.js';
import { createRaffle } from './web3/createRaffle.js';

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
      createRaffleModal.classList.add("hidden");
    } catch (error) {
      console.error('Error creating raffle:', error);
    }
  });

  await loadRaffles();
  setInterval(updateTimeRemaining, 1000); // Update countdowns every second
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
      <button class="buy-ticket-btn bg-gold text-darkGreen w-full py-4 text-xl rounded-full font-extrabold shadow-lg" data-raffle-id="${biggestRaffle.id}">
        Buy Ticket
      </button>
    `;
  }
}

function displayRaffle(raffleId, raffle) {
  const now = Date.now();
  const endTimeMs = raffle.deadline * 1000; // Convert seconds to milliseconds

  // Check if the raffle has expired
  if (endTimeMs <= now) {
    return; // Stop displaying expired raffles
  }

  const rafflesContainer = document.querySelector(".other-raffles");
  const raffleCard = document.createElement("div");
  raffleCard.className = "raffle-card bg-darkGreen p-6 rounded-lg shadow-lg text-white text-center border-4 border-gold";
  raffleCard.innerHTML = `
    <h3 class="text-xl font-semibold text-gold mb-2">Prize: ${raffle.prizePool} ETH</h3>
    <div class="text-sm mb-2">Time Remaining: <span class="time-remaining" data-deadline="${raffle.deadline}">${calculateTimeRemaining(raffle.deadline)}</span></div>
    <button class="buy-ticket-btn bg-gold text-darkGreen w-full py-2 rounded-lg font-semibold shadow-md" data-raffle-id="${raffleId}">
      Buy Ticket
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

function updateTimeRemaining() {
  document.querySelectorAll('.time-remaining').forEach(span => {
    const deadline = span.dataset.deadline;
    span.textContent = calculateTimeRemaining(deadline);
  });
}
