## Relevant Files

- `contracts/FighterNFT.sol` - Smart contract for minting Fighter NFTs with STR, DEX, and HP stats.
- `contracts/FightClub.sol` - Smart contract handling staking, NPC generation, and on-chain fight logic.
- `test/FighterNFT.test.js` - Unit tests for FighterNFT contract verifying minting and stat assignment.
- `test/FightClub.test.js` - Unit tests for FightClub contract verifying staking, fight logic, and stake return.
- `scripts/deploy.js` - Deployment script for deploying both contracts to the Hedera Testnet.
- `deployment/hedera-testnet.json` - Deployment information for Hedera testnet contracts.
- `config/contracts.json` - Comprehensive contract configuration and network details.
- `hardhat.config.js` - Hardhat configuration with Hedera testnet settings.
- `.env` - Environment variables for private key and network configuration.
- `README.md` - Complete project documentation with deployed contract addresses and setup instructions.
- `test/fight-club.test.js` - Unit and integration tests for the smart contracts.
- `src/App.jsx` - Main frontend component for user interaction (minting, fighting).
- `src/hedera.js` - Client-side logic for connecting to Hedera, calling smart contract functions, and interacting with wallets.

### Notes

- Smart contracts will be developed using Solidity and deployed via Hardhat.
- The frontend will be a simple web interface to interact with the deployed contracts.
- Use `npx hardhat test` to run smart contract tests.
- Use `npx hardhat run scripts/deploy.js --network hedera-testnet` to deploy.

## Tasks

- [x] 1.0 Project Setup & Smart Contract Development
  - [x] 1.1 Initialize a Hardhat project (`npx hardhat`).
  - [x] 1.2 Install necessary dependencies: `ethers`, `hardhat`, `@hashgraph/sdk`, `dotenv`.
  - [x] 1.3 Develop the `FighterNFT.sol` contract with minting logic and stats (STR, DEX, HP).
  - [x] 1.4 Develop the `FightClub.sol` contract with staking, NPC generation, and turn-based fight logic.
  - [x] 1.5 Implement a verifiable on-chain pseudo-RNG using `blockhash` for fight outcomes.
  - [x] 1.6 Write unit tests for `FighterNFT.sol` to verify minting and stat assignment.
  - [x] 1.7 Write unit tests for `FightClub.sol` to verify staking, fight logic, and stake return.
- [x] 2.0 Smart Contract Deployment & Hedera Integration
  - [x] 2.1 Configure `hardhat.config.js` with Hedera Testnet details and compiler settings.
  - [ ] 2.2 [Human] Create and fund Hedera Testnet accounts for deployment and testing.
  - [x] 2.3 Create a `.env` file and add the private key for the deployment account.
  - [x] 2.4 Write a deployment script (`scripts/deploy.js`) for both contracts.
  - [x] 2.5 Deploy the contracts to the Hedera Testnet.
  - [x] 2.6 [Human] Verify the deployed smart contracts on HashScan.
  - [x] 2.7 Document the deployed contract addresses in the project's README or a config file.
- [ ] 3.0 Frontend Development for Core Gameplay Loop
  - [ ] 3.1 Set up a basic frontend project (e.g., using Vite: `npm create vite@latest`).
  - [ ] 3.2 Implement wallet connection for HashPack.
  - [ ] 3.3 Create a UI component to call the `mint` function on the `FighterNFT` contract.
  - [ ] 3.4 Create a UI component to display the player's minted fighter and its stats.
  - [ ] 3.5 Create a UI component to call the `stake` and `fight` functions on the `FightClub` contract.
  - [ ] 3.6 Display the NPC's stats and the fight's outcome to the user.
- [ ] 4.0 End-to-End Testing & Verification
  - [ ] 4.1 [Human] Manually test the complete mint-stake-fight user flow on the testnet via the frontend.
  - [ ] 4.2 [Human] Verify that all transactions (mint, stake, fight) appear correctly on HashScan.
  - [ ] 4.3 [Human] Time the full loop to ensure it meets the < 60-second success metric.
  - [ ] 4.4 [Human] Check the total transaction fees on HashScan to ensure they are < $0.10.
- [ ] 5.0 Documentation & Hackathon Submission Preparation
  - [ ] 5.1 Update `README.md` with a project description, setup instructions, and a link to the live demo.
  - [ ] 5.2 Write a clear demo script outlining the steps to showcase the project for a video.
  - [ ] 5.3 [Human] Record a short video (~2-3 minutes) demonstrating the full gameplay loop.
  - [ ] 5.4 [Human] Ensure the GitHub repository is public and contains all source code.
  - [ ] 5.5 [Human] Prepare and submit all required hackathon deliverables (video, repo link, etc.).
