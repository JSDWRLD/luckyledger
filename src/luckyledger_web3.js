import Web3 from 'web3';
import raffleContractData from '../build/contracts/Lottery.json';

let web3;
let raffleContract;
// REPLACE W URS
const raffleAddress = "0x3c2d05f03d2c4689e309327120a30fe3a80cb013";

export async function initWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
        web3 = new Web3("http://127.0.0.1:8545");
    }
    raffleContract = new web3.eth.Contract(raffleContractData.abi, raffleAddress);
    console.log("Raffle Contract:", raffleContract);
}

export async function getRaffleCount() {
    return await raffleContract.methods.raffleCount().call();
}

export async function getRaffleDetails(raffleId) {
    return await raffleContract.methods.getRaffleDetails(raffleId).call();
}

export async function createRaffle(entryFee, duration, account) {
    console.log("Creating raffle with:", { entryFee, duration, account });
    const receipt = await raffleContract.methods.createRaffle(entryFee, duration).send({ from: account });
    console.log("Raffle created. Transaction receipt:", receipt);
    return receipt;
}

export async function buyTicket(raffleId, entryFee, account) {
    return await raffleContract.methods.buyTicket(raffleId).send({ from: account, value: entryFee });
}

export { web3, raffleContract };
