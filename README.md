# CryptoFightClub (CFCL) - Hedera Hackathon Project

A turn-based fighting game built on Hedera Hashgraph where players mint fighter NFTs with random stats and battle NPCs for HBAR rewards.

**Current Status:** Smart contracts deployed and verified. Frontend development in progress.

## 🎮 What Works Right Now

**Smart Contracts on Hedera Testnet:**
1. **Mint Fighter NFTs** with randomized stats (STR, DEX, HP)
2. **Stake HBAR** to enter fights (minimum 0.001 HBAR)
3. **Fight NPCs** using on-chain turn-based combat
4. **Win or lose** HBAR based on battle outcomes (2x multiplier for wins)

**Note:** Currently requires direct smart contract interaction. Web interface coming soon.

## 🚀 Live Deployment - Hedera Testnet

### 📋 Contract Addresses

| Contract | Address | HashScan Link |
|----------|---------|---------------|
| **FighterNFT** | `0xd565d1cb8A84FCF656E369C1Db2d2c26Ae2642c1` | [View on HashScan](https://hashscan.io/testnet/contract/0xd565d1cb8A84FCF656E369C1Db2d2c26Ae2642c1) |
| **FightClub** | `0xF4DA9F2d1e2c62342A00664297a01F9534FFf4D2` | [View on HashScan](https://hashscan.io/testnet/contract/0xF4DA9F2d1e2c62342A00664297a01F9534FFf4D2) |

### 🌐 Network Information
- **Network:** Hedera Testnet
- **Chain ID:** 296
- **RPC Endpoint:** `https://testnet.hashio.io/api`
- **Explorer:** [HashScan Testnet](https://hashscan.io/testnet)

### ✅ Verification Status
Both contracts are **fully verified** on HashScan with complete source code visibility.

## 🛠️ Technology Stack

- **Blockchain:** Hedera Hashgraph (EVM Compatible)
- **Smart Contracts:** Solidity 0.8.30
- **Development:** Hardhat 3.0 + ethers.js v6
- **Testing:** Mocha + Chai (39 tests passing)
- **Frontend:** Coming soon
- **Wallet Integration:** Coming soon

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Basic knowledge of smart contracts (for direct interaction)

### Clone & Install
```bash
git clone <repository-url>
cd CFCL
npm install
```

### Environment Setup (For Development)
1. Copy `.env.example` to `.env`
2. Add your Hedera testnet private key:
```bash
OPERATOR_KEY=0x_your_private_key_here
```
3. Fund your account at [Hedera Faucet](https://portal.hedera.com)

### Compile Contracts
```bash
npx hardhat compile
```

### Run Tests
```bash
npx hardhat test
```

## 🎯 Game Mechanics (Implemented)

### Fighter NFT Stats
- **STR (Strength):** 1-100 (affects damage output)
- **DEX (Dexterity):** 1-100 (affects critical hit chance)
- **HP (Health Points):** 100-300 (determines survivability)

### Combat System
- Turn-based combat with attack mechanics
- Critical hit system based on DEX stats
- On-chain pseudo-random number generation using blockhash
- NPCs generated with random stats for each fight
- Minimum stake: 0.001 HBAR

### Rewards
- **Win:** Get back stake + 100% bonus (2x total return)
- **Lose:** Lose staked HBAR to contract pool

## 📊 Deployment Metrics

- **Total Gas Used:** 1.29 HBAR
- **Deployment Cost:** ~$0.20 USD
- **Contract Size:** Optimized with 500 runs
- **Deployment Time:** ~30 seconds

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npx hardhat test

# Test with gas reporting
npx hardhat test --reporter gas

# Deploy to testnet
npx hardhat run scripts/deploy.js --network hedera-testnet
```

### Test Results
- ✅ 39 passing tests
- ✅ 100% core functionality coverage
- ✅ Gas optimization verified

## 🚧 Current Status & Roadmap

**✅ Completed:**
- [x] Smart contract development and testing
- [x] Hedera testnet deployment  
- [x] Contract verification on HashScan
- [x] Complete game logic implementation

**🔄 In Progress:**
- [ ] Frontend React application
- [ ] HashPack wallet integration
- [ ] User-friendly web interface

**📋 Next Steps:**
- [ ] Live demo deployment
- [ ] Video demonstration
- [ ] Hackathon submission

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

---

**Built for the Hedera Hashgraph Hackathon 2025** 🏆