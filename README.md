# Ethereum Lottery Decentralized Application

A decentralized lottery application built on Ethereum using **Solidity**, **Javascript**, **Tailwind CSS**, and **Web3.js**. Users can enter a lottery by purchasing tickets, and a random winner is drawn once the raffle ends.

## Features

- **Create Raffles**: Hosts can create new raffles with a defined entry fee and duration.
- **Buy Tickets**: Users can buy tickets for raffles using Ethereum.
- **Draw Winners**: Anyone can end a raffle once it has expired.
- **Automatic Award Distribution**: Winners will be chosen randomly and prizes will be disbursed automatically.
- **Web3 Integration**: Interacts with the Ethereum blockchain using Web3.js.

## System Design

This is a representation of how actors will interface with this decentralized application.
![System Design](https://github.com/JSDWRLD/luckyledger/blob/main/repositoryPhotos/SystemDesign.png)

## Images and Video Demo

This is the main homepage where users will see all raffles.
![Main Screen](https://github.com/JSDWRLD/luckyledger/blob/main/repositoryPhotos/main.png)

This is the other raffles section, which display smaller prizes.
![Other Raffles](https://github.com/JSDWRLD/luckyledger/blob/main/repositoryPhotos/otherraffles.png)

Video Demo, hosted on Streamable:
[Video Demo](https://streamable.com/g7f00t)

## Installation

### Prerequisites

- **Node.js** 
- **npm** 
- **Ganache** 
- **Truffle**

### 1. Clone the Repository

```bash
git clone https://github.com/JSDWRLD/luckyledger.git
cd luckyledger
```

### 2. Install Dependencies

Install both frontend and backend dependencies.

#### Frontend (React and Tailwind CSS)

```bash
npm install
```

#### 3. Install Truffle

If you're using **Truffle**, install Truffle and Ganache:

```bash
npm install -g truffle
```
### 4. Start Ganache Local Blockchain

```bash
ganache-cli -m "unable aspect worth unit unable giraffe sure blouse absurd kick shield mom" -p 8545
```

### 5. Configure Metamask

Open up Firefox browser and install the extension Metamask.
When you click on the extension it will ask you to import or create a wallet.
Select import wallet, and enter in this seed phrase below.
```bash
unable aspect worth unit unable giraffe sure blouse absurd kick shield mom
```
Once entered, you must add the local blockchain to the list of networks manually.
Click on Metamask settings and navigate to a screen where you can add a blockchain network.
Click on the bottom of the list "add network manually"
Fill in these details:
- Network Name = Ganache
- New RPC URL = http://127.0.0.1:8545
- Chain ID = 1337
- Currency symbol = ETH
- After you press save be sure to press "switch to local blockchain" on the Metamask extension.


### 6. Compile and Migrate solidity contract onto Local Blockchain

```bash
truffle compile
truffle migrate --reset
```

### 7. Ensure the Deployed Contract Address is the Same

Take note of the deployed contract address, you should see it on your terminal window that is running ganache cli.
When in the root directory of the project, cd into /src/web3.
There will be a file named web3Init.js, make sure the variable raffleAddress is the same as the deployed contract address.

### 8. (Optional) Setup Scripts

This step is optional and only true if you wish to run the scripts under /src/scripts.
Simply check each file and make sure the variable contractAddress is the same as the deployed contract address.

### 9. Run the Development Server

For the frontend, start the React development server:

```bash
npm run dev
```

This will open your app at `http://localhost:5173`.

This will start Ganache with the same mnemonic each time to ensure your wallets are consistent.


## Contributing

1. Fork this repository.
2. Create a new branch (`git checkout -b feature-xyz`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to your branch (`git push origin feature-xyz`).
5. Open a Pull Request.
