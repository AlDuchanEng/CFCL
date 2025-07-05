const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Hedera Testnet...");
  
  // Get network info
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  // Get signer (deployer account)
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "HBAR");
  
  if (balance === 0n) {
    throw new Error("❌ Deployer account has no HBAR. Please fund your account first.");
  }
  
  // Get fee data for Hedera-optimized gas settings
  const feeData = await ethers.provider.getFeeData();
  console.log("⛽ Fee data:", {
    gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "null",
    maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, "gwei") + " gwei" : "null",
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") + " gwei" : "null"
  });
  
  // Gas settings optimized for Hedera (based on cheat sheet recommendations)
  const gasSettings = {
    maxFeePerGas: feeData.maxFeePerGas || ethers.parseUnits("5", "gwei"), // 5 gwei base
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits("1", "gwei") // 1 gwei priority
  };
  
  console.log("\n🔧 Using gas settings:", {
    maxFeePerGas: ethers.formatUnits(gasSettings.maxFeePerGas, "gwei") + " gwei",
    maxPriorityFeePerGas: ethers.formatUnits(gasSettings.maxPriorityFeePerGas, "gwei") + " gwei"
  });
  
  // Deploy FighterNFT contract
  console.log("\n🎯 Deploying FighterNFT...");
  const FighterNFT = await ethers.getContractFactory("FighterNFT");
  const fighterNFT = await FighterNFT.deploy(gasSettings);
  await fighterNFT.waitForDeployment();
  
  console.log("✅ FighterNFT deployed to:", fighterNFT.target);
  
  // Deploy FightClub contract
  console.log("\n⚔️  Deploying FightClub...");
  const FightClub = await ethers.getContractFactory("FightClub");
  const fightClub = await FightClub.deploy(fighterNFT.target, gasSettings);
  await fightClub.waitForDeployment();
  
  console.log("✅ FightClub deployed to:", fightClub.target);
  
  // Verify contracts are working
  console.log("\n🔍 Verifying deployments...");
  
  // Test FighterNFT
  const nftName = await fighterNFT.name();
  const nftSymbol = await fighterNFT.symbol();
  console.log("✅ FighterNFT verification:", { name: nftName, symbol: nftSymbol });
  
  // Test FightClub
  const fightClubNFTAddress = await fightClub.fighterNFT();
  const minStake = await fightClub.MIN_STAKE();
  console.log("✅ FightClub verification:", { 
    connectedNFT: fightClubNFTAddress, 
    minStake: ethers.formatEther(minStake) + " HBAR" 
  });
  
  // Prepare deployment info
  const deploymentInfo = {
    network: network,
    chainId: chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      FighterNFT: fighterNFT.target,
      FightClub: fightClub.target
    },
    gasSettings: {
      maxFeePerGas: gasSettings.maxFeePerGas.toString(),
      maxPriorityFeePerGas: gasSettings.maxPriorityFeePerGas.toString()
    },
    verified: false // Will be updated after manual verification
  };
  
  // Create deployment directory if it doesn't exist
  const deploymentDir = path.join(__dirname, "..", "deployment");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  // Save deployment info
  const deploymentFile = path.join(deploymentDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("Network:", network);
  console.log("Chain ID:", chainId);
  console.log("Deployer:", deployer.address);
  console.log("FighterNFT:", fighterNFT.target);
  console.log("FightClub:", fightClub.target);
  console.log("Deployment info saved to:", deploymentFile);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Verify contracts on HashScan (task 2.6)");
  console.log("2. Update deployment JSON with verified: true");
  console.log("3. Fund your account with more HBAR for testing");
  
  // Final balance check
  const finalBalance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Final account balance:", ethers.formatEther(finalBalance), "HBAR");
  console.log("💸 Gas used:", ethers.formatEther(balance - finalBalance), "HBAR");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
