require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.30",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500
      }
    }
  },
  networks: {
    "hedera-testnet": {
      url: "https://testnet.hashio.io/api",
      chainId: 296,
      accounts: process.env.OPERATOR_KEY ? [process.env.OPERATOR_KEY] : [],
      timeout: 120000
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
