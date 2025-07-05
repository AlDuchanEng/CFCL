CryptoFight Club

# Concept Note – CryptoFight Club

1. Elevator Sentence
   Solo web‑3 duels: mint a fighter NFT, stake a few HBAR, battle a randomly generated NPC, and know the result (and payout) in seconds.

2. Core Loop
   Mint ► Stake ► Fight NPC ► Autopayout/Refund.

3. Target User & Need
   Crypto‑curious gamers who want a provably‑fair minigame with micro‑stakes rather than slow, gas‑heavy PvP setups.

4. Unique Insight
   Hedera’s sub‑cent fees keep fully on‑chain RNG + transfers cheaper than a mobile gacha pull, enabling “just‑one‑more” solo fights.

5. Key Features (MUST)

* HTS Fighter NFT with three base stats (STR, DEX, HP).
* Fight contract holding the player’s stake.
* `fight()` spawns an NPC with random stats (e.g., `uint(blockhash(block.number‑1)) % 100`).
* Player’s fighter and NPC fight each other until one’s HP reaches 0.
* On‑chain pseudo‑RNG decides victor.
* Contract sends stake × 2 to the winner; timeout refund path.

6. Success Criteria

* End‑to‑end fight < 5 s on Hedera testnet.
* All‑in network fee < \$0.005 HBAR.
* Anyone can recompute RNG locally and verify outcome.

7. Tech Pillars

* Hedera Token Service (HTS) for NFT minting.
* Hedera EVM smart contract for staking + RNG.
* HashPack / HashConnect wallet for one‑click tx.

8. Non‑Goals
   ✗ PvP matchmaking.
   ✗ Off‑chain oracle.
   ✗ Stat leveling or equipment.
