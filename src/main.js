import '../src/style.css';
import { setupDropdown } from './dropdown.js';
import { web3, initWeb3, getRaffleCount, getRaffleDetails, createRaffle, buyTicket } from './luckyledger_web3.js';

document.addEventListener("DOMContentLoaded", async () => {
  await initWeb3();

  const toggleButton = document.getElementById("hamButton");
  const dropdownMenu = document.getElementById("dropdownMenu");

  // call the dropdown function
  setupDropdown(toggleButton, dropdownMenu);

  await loadRaffles();

  // Handle raffle creation
  document.querySelector('#createRaffleButton').addEventListener('click', async () => {
    const entryFee = document.querySelector('#entryFeeInput').value;
    const duration = document.querySelector('#durationInput').value;
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const account = accounts[0];

    try {
      // Creating the raffle
      await createRaffle(web3.utils.toWei(entryFee, 'ether'), duration, account);

      // the raffles list to reflect the new raffle
      await loadRaffles();
    } catch (error) {
      console.error('Error creating raffle:', error);
    }
  });

  // BROKEN, Fail to purchase using meta mask Handle ticket purchase
  document.querySelectorAll('.buy-ticket-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
      const raffleId = event.target.dataset.raffleId;
      const entryFee = event.target.dataset.entryFee;
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const account = accounts[0];
      await buyTicket(raffleId, entryFee, account);
    });
  });
});

async function loadRaffles() {
  const raffleCount = await getRaffleCount();

  // refresh
  const rafflesContainer = document.querySelector(".other-raffles");
  rafflesContainer.innerHTML = ""; 

  // If no raffles display empty card
  if (raffleCount === 0) {
    document.querySelector('.biggest-raffle-card').innerHTML = `
      <h2 class="text-4xl font-extrabold mb-6">💸 Current Jackpot 💸</h2>
      <div class="text-2xl font-extrabold mb-3">Prize: <span class="text-white">None</span></div>
      <div class="text-lg font-medium mb-4">Time Remaining: N/A</div>
      <div class="text-lg font-medium mb-6">Max Tickets: N/A</div>
      <button class="bg-gray-500 text-white w-full py-4 text-xl rounded-full font-extrabold shadow-lg cursor-not-allowed" disabled>Buy Ticket</button>
      <div class="text-lg mt-4 font-semibold">Price per Ticket: N/A</div>
      <div class="text-lg font-semibold">Tickets Bought: 0</div>
    `;
    rafflesContainer.innerHTML = "<p class='text-white'>No raffles available at the moment.</p>";
    return;
  }

  let biggestPrize = 0;
  let biggestRaffle = null;

  for (let i = 1; i <= raffleCount; i++) {
    const raffle = await getRaffleDetails(i);

    // Track the raffle with the biggest prize
    const prizePool = parseFloat(web3.utils.fromWei(raffle.prizePool, 'ether'));
    if (prizePool > biggestPrize) {
      biggestPrize = prizePool;
      biggestRaffle = { id: i, ...raffle };
    }

    // Display each raffle in "Other Raffles"
    displayRaffle(i, raffle);
  }

  // NEED TO FIX, DOESNT UPDATE PROPERLY Update "Biggest Reward" section with the biggest raffle 
  if (biggestRaffle) {
    document.querySelector('.biggest-raffle-card').innerHTML = `
      <h2 class="text-4xl font-extrabold mb-6">💸 Current Jackpot 💸</h2>
      <div class="text-2xl font-extrabold mb-3">Prize: <span class="text-white">${web3.utils.fromWei(biggestRaffle.prizePool, 'ether')} ETH</span></div>
      <div class="text-lg font-medium mb-4">Time Remaining: ${calculateTimeRemaining(biggestRaffle.deadline)}</div>
      <div class="text-lg font-medium mb-6">Max Tickets: ${biggestRaffle.maxTickets} per user</div>
      <button class="buy-ticket-btn bg-darkGreen text-gold w-full py-4 text-xl rounded-full font-extrabold shadow-lg" data-raffle-id="${biggestRaffle.id}" data-entry-fee="${biggestRaffle.entryFee}">
        Buy Ticket
      </button>
      <div class="text-lg mt-4 font-semibold">Price per Ticket: ${web3.utils.fromWei(biggestRaffle.entryFee, 'ether')} ETH</div>
      <div class="text-lg font-semibold">Tickets Bought: ${biggestRaffle.ticketCount}</div>
    `;
  }
}

// Display raffle details in UI Dynamic
function displayRaffle(raffleId, raffleData) {
  const rafflesContainer = document.querySelector(".other-raffles");
  const raffleCard = document.createElement("div");
  raffleCard.className = "raffle-card bg-darkGreen p-6 rounded-lg shadow-lg text-white text-center border-4 border-gold";
  raffleCard.innerHTML = `
    <h3 class="text-xl font-semibold text-gold mb-2">Prize: ${web3.utils.fromWei(raffleData.prizePool, 'ether')} ETH</h3>
    <div class="text-sm mb-2">Time Remaining: ${calculateTimeRemaining(raffleData.deadline)}</div>
    <button class="buy-ticket-btn bg-gold text-darkGreen w-full py-2 rounded-lg font-semibold shadow-md" data-raffle-id="${raffleId}" data-entry-fee="${raffleData.entryFee}">
      Buy Ticket
    </button>
    <div class="text-sm mt-2">Price per Ticket: ${web3.utils.fromWei(raffleData.entryFee, 'ether')} ETH</div>
    <div class="text-sm">Tickets Bought: ${raffleData.ticketCount}</div>
  `;
  rafflesContainer.appendChild(raffleCard);
}

// Time still buggy its not live so maybe have a thing to always check the eth contract
function calculateTimeRemaining(deadline) {
  const now = Math.floor(Date.now() / 1000);

  const timeRemaining = Number(deadline) - now;

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}


// Nav bar helpers 
let lastScrollY = window.scrollY;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > lastScrollY) {
    header.classList.add('hide'); // scroll down
  } else {
    header.classList.remove('hide'); // scroll up
  }
  lastScrollY = window.scrollY;
});
