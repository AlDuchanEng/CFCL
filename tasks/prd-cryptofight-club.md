# Product Requirements Document: CryptoFight Club (Minimal Viable Product)

## 1. Introduction / Overview
This document outlines the requirements for a minimal viable product (MVP) of "CryptoFight Club," a simple hackathon project. The project is a solo web-3 dueling game where a player mints a fighter NFT and battles a randomly generated non-player character (NPC). The outcome is determined by verifiable on-chain logic, with a symbolic stake to initiate the fight.

## 2. Goals
*   To build a functional, end-to-end gameplay loop on the Hedera testnet.
*   To create a simple, understandable, and verifiable on-chain game.
*   To ensure the core fight mechanic is fast and cheap, aligning with Hedera's strengths.

## 3. User Stories
*   As a gamer, I want to mint a unique fighter NFT so I can own a piece of the game.
*   As a gamer, I want to fight a random computer-controlled opponent after placing a small, symbolic stake, so I can experience a quick and verifiable duel.

## 4. Functional Requirements
1.  **NFT Minting:** Users must be able to mint a "Fighter" NFT. Each NFT will have three basic stats: Strength (STR), Dexterity (DEX), and Health Points (HP).
2.  **Staking:** To start a fight, the player must stake a symbolic, nominal amount of HBAR into a smart contract.
3.  **NPC Generation:** The fight smart contract will generate an NPC with randomized stats upon fight initiation.
4.  **Fight Logic:** The player's fighter and the NPC will engage in a turn-based battle until one fighter's HP reaches 0. The logic will be executed on-chain.
5.  **Verifiable RNG:** The winner will be determined by a pseudo-random number generated on-chain (e.g., using a blockhash). This process must be verifiable by anyone.
6.  **Outcome:** The symbolic stake will be returned to the player after the fight concludes. For this initial version, there is no "doubling" of the stake for winning.

## 5. Hedera & AI Integration Plan
*   **Hedera Network Services:**
    *   **Hedera Token Service (HTS):** To mint and manage the Fighter NFTs.
    *   **Hedera Smart Contract Service (EVM):** To handle the staking, NPC generation, fight logic, and verifiable RNG.
*   **AI / ML Components:**
    *   None for this initial version.
*   **Bridges / Oracles:**
    *   None.
*   **SDK / Tooling:**
    *   **Language:** JavaScript / TypeScript
    *   **Tooling:** Ethers.js and/or Hardhat for smart contract interaction and deployment.

## 6. Non-Goals (Out of Scope)
*   Player-vs-Player (PvP) matchmaking.
*   Off-chain oracles for randomness or data.
*   Fighter stat leveling, experience points, or equipment.
*   Real-money gambling or significant financial stakes.

## 7. Design Considerations (Optional)
*   The user interface should be minimal and functional, focusing on the core actions: mint, stake, and fight. A simple web-based frontend will be sufficient.

## 8. Technical Considerations (Optional)
*   The on-chain RNG mechanism should be simple and auditable, using block variables as a source of entropy.
*   Smart contracts should be optimized for gas efficiency.

## 9. Acceptance Criteria & Hackathon Deliverables
*   The Fighter NFT and Fight smart contracts are successfully deployed and verified on the Hedera Testnet and viewable on **HashScan**.
*   All source code for the smart contracts and frontend is publicly available in a GitHub repository.
*   All functional requirements listed in section 4 are met.

## 10. Success Metrics
*   A user can successfully complete the mint-stake-fight loop on the Hedera testnet in under 60 seconds.
*   The total network fee for the entire loop is less than $0.1 USD.

## 11. Optional / Stretch Goals
*   Add more complexity to the NPC stat generation.
*   Integrate HashPack or another Hedera wallet for a smoother user experience.

## 12. Open Questions
*   None at this stage.
