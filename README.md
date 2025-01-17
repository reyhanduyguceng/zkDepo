# zk-DEPO: Privacy-Oriented Distributed and Decentralized Warehouse Management System

## Overview

**zk-DEPO** is a blockchain-based decentralized warehouse management prototype developed to enhance **data security**, **operational efficiency**, and **information sharing** in warehouse processes. The system uniquely integrates **Zero Knowledge Proofs (ZKP)**, **Digital Identity (DID)**, and **IPFS (InterPlanetary File System)** to ensure confidentiality, traceability, and decentralized authentication. System specifications shown in Figure 1.

![Figure 1- System Model](https://github.com/user-attachments/assets/4519c12b-b98c-40f7-8965-835a2728fa31)

[Figure 1] System Model

## Key Features

- **Decentralized Identity (DID):** Ensures secure and fast user authentication without reliance on a central authority.
- **Zero Knowledge Proofs (ZKP):** Verifies sensitive data without revealing the data itself.
- **IPFS Integration:** Stores warehouse data securely with immutable links while reducing blockchain storage costs.
- **Smart Contracts:** Automates and secures warehouse operations like order placement and verification.
- **Blockchain Technology:** Provides an immutable and transparent ledger for data and transactions.

## System Architecture

The system consists of the following main components:

1. **Blockchain-Based Data Sharing Platform**
   - **IPFS**: Stores operational data securely and generates unchangeable URLs.
   - **Smart Contracts**: Defines user access rules and manages warehouse operations.
   
2. **Data Verification Using ZKP**
   - **ZoKrates Library**: Generates proofs using zk-SNARK and integrates them into smart contracts for verification.

3. **Authentication with DID**
   - **Hyperledger Indy and Von Network**: Enables decentralized identity authentication using Docker-based Von Network setup.

4. **Frontend Development**
   - Developed using **React** for seamless integration with DID, blockchain, ZKP, and IPFS.

## Installation

Follow the steps below to set up the project on your local machine:

### Prerequisites

- **Node.js** and **npm**
- **Docker**
- **Ganache** (for blockchain development and testing)
- **IPFS** (InterPlanetary File System)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/reyhanduyguceng/zkDepo.git
   cd zkDepo
   ```
  ## Setting Up Von Network for DID

To use **Decentralized Identity (DID)** within the project, follow these steps to set up the Von Network on Docker:

2.Set up the Von Network for DID:

```bash
git clone https://github.com/bcgov/von-network.git
cd von-network
./manage build
./manage start
```
## Start IPFS Node:

```bash
ipfs daemon
```
1. Start Ganache for the blockchain network:

```bash
ganache-cli
```
2. Deploy smart contracts using Truffle:

```bash
truffle compile
truffle migrate
```
3. Start the React frontend:

```bash
cd my-app
npm install
npm start
```
Access the frontend at http://localhost:3000 and the Von Network UI at http://localhost:9000.

### Usage
## Authenticate with DID:

- Register a new DID using the Von Network UI or import an existing DID.
- Authenticate using your DID and Verkey.
## Place Orders:

- Log in and use the "Place Order" form to create new warehouse entries.
- Orders are securely saved in IPFS and their immutable links are recorded on the blockchain.
## Verify Orders:

- Verify orders using ZKP without revealing sensitive data.
## Order Management:

- View order history and update order status.
### Results
- Successfully integrated blockchain, IPFS, DID, and ZKP into a working dApp prototype.
- Enhanced data confidentiality, integrity, and operational efficiency in warehouse management.
- Prototype demonstrated the feasibility of decentralized solutions for secure warehouse operations.
