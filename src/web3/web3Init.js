import Web3 from 'web3';
import raffleContractData from '../../build/contracts/Lottery.json';

export let web3;
export let raffleContract;

// Replace with your deployed contract address
const raffleAddress = "0x86dce17e8cf6e3af80d622753cfbdea7886e18b1";

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
