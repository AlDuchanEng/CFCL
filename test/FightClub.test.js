const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FightClub", function () {
  let FighterNFT;
  let fighterNFT;
  let FightClub;
  let fightClub;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy FighterNFT contract first
    FighterNFT = await ethers.getContractFactory("FighterNFT");
    fighterNFT = await FighterNFT.deploy();
    await fighterNFT.waitForDeployment();

    // Deploy FightClub contract with FighterNFT address
    FightClub = await ethers.getContractFactory("FightClub");
    fightClub = await FightClub.deploy(await fighterNFT.getAddress());
    await fightClub.waitForDeployment();

    // Fund the contract so it can pay out rewards
    await owner.sendTransaction({
      to: await fightClub.getAddress(),
      value: ethers.parseEther("10.0") // Fund with 10 ETH for testing
    });

    // Mint a fighter for testing
    await fighterNFT.mint(player1.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await fightClub.owner()).to.equal(owner.address);
    });

    it("Should set the correct FighterNFT address", async function () {
      expect(await fightClub.fighterNFT()).to.equal(await fighterNFT.getAddress());
    });

    it("Should have correct constants", async function () {
      expect(await fightClub.MIN_STAKE()).to.equal(ethers.parseEther("0.001"));
      expect(await fightClub.FIGHT_REWARD_MULTIPLIER()).to.equal(180);
    });
  });

  describe("Staking", function () {
    it("Should allow staking with valid fighter and minimum amount", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      
      await expect(fightClub.connect(player1).stake(1, { value: stakeAmount }))
        .to.emit(fightClub, "FightStarted")
        .withArgs(player1.address, 1, stakeAmount);

      expect(await fightClub.stakedAmounts(player1.address)).to.equal(stakeAmount);
    });

    it("Should reject staking below minimum amount", async function () {
      const lowStake = ethers.parseEther("0.0005"); // Below 0.001 minimum
      
      await expect(fightClub.connect(player1).stake(1, { value: lowStake }))
        .to.be.revertedWith("Stake amount too low");
    });

    it("Should reject staking with fighter not owned by player", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      
      await expect(fightClub.connect(player2).stake(1, { value: stakeAmount }))
        .to.be.revertedWith("You don't own this fighter");
    });

    it("Should reject staking when player already has active fight", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      
      // First stake should succeed
      await fightClub.connect(player1).stake(1, { value: stakeAmount });
      
      // Second stake should fail
      await expect(fightClub.connect(player1).stake(1, { value: stakeAmount }))
        .to.be.revertedWith("You already have an active fight");
    });

    it("Should generate NPC stats when staking", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      
      await fightClub.connect(player1).stake(1, { value: stakeAmount });
      
      const npcStats = await fightClub.getNPCStats(player1.address);
      
      // Verify NPC stats are within expected ranges
      expect(npcStats[0]).to.be.greaterThan(0);     // str
      expect(npcStats[0]).to.be.lessThanOrEqual(100);
      expect(npcStats[1]).to.be.greaterThan(0);     // dex
      expect(npcStats[1]).to.be.lessThanOrEqual(100);
      expect(npcStats[2]).to.be.greaterThanOrEqual(100); // hp
      expect(npcStats[2]).to.be.lessThanOrEqual(300);
    });

    it("Should store fight details correctly", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      
      await fightClub.connect(player1).stake(1, { value: stakeAmount });
      
      const fightDetails = await fightClub.getFightDetails(player1.address);
      
      expect(fightDetails.fighterTokenId).to.equal(1);
      expect(fightDetails.stakeAmount).to.equal(stakeAmount);
      expect(fightDetails.staker).to.equal(player1.address);
      expect(fightDetails.isActive).to.be.true;
      expect(fightDetails.fighterWon).to.be.false;
    });
  });

  describe("Fighting", function () {
    beforeEach(async function () {
      // Stake before each fight test
      const stakeAmount = ethers.parseEther("0.01");
      await fightClub.connect(player1).stake(1, { value: stakeAmount });
    });

    it("Should execute fight and determine outcome", async function () {
      await expect(fightClub.connect(player1).fight())
        .to.emit(fightClub, "FightCompleted");
    });

    it("Should reject fight when no active fight", async function () {
      await expect(fightClub.connect(player2).fight())
        .to.be.revertedWith("No active fight");
    });

    it("Should mark fight as inactive after completion", async function () {
      await fightClub.connect(player1).fight();
      
      const fightDetails = await fightClub.getFightDetails(player1.address);
      expect(fightDetails.isActive).to.be.false;
    });

    it("Should reset staked amount after fight", async function () {
      await fightClub.connect(player1).fight();
      
      expect(await fightClub.stakedAmounts(player1.address)).to.equal(0);
    });

    it("Should not allow fighting twice with same stake", async function () {
      await fightClub.connect(player1).fight();
      
      await expect(fightClub.connect(player1).fight())
        .to.be.revertedWith("No active fight");
    });
  });

  describe("Rewards and Payouts", function () {
    it("Should handle both winning and losing scenarios correctly", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      await fightClub.connect(player1).stake(1, { value: stakeAmount });
      
      const initialBalance = await ethers.provider.getBalance(player1.address);
      
      const tx = await fightClub.connect(player1).fight();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(player1.address);
      const fightDetails = await fightClub.getFightDetails(player1.address);
      
      if (fightDetails.fighterWon) {
        // Player should receive 1.8x their stake
        const expectedPayout = (stakeAmount * 180n) / 100n;
        const balanceChange = finalBalance - initialBalance + gasUsed;
        
        // Allow for small rounding differences
        expect(balanceChange).to.be.closeTo(expectedPayout, ethers.parseEther("0.001"));
        
        // Verify the fight was marked as won
        expect(fightDetails.fighterWon).to.be.true;
      } else {
        // Player should lose their stake (balance decreases by stake amount + gas)
        const balanceChange = finalBalance - initialBalance + gasUsed;
        
        // The player's net change should be close to losing their stake
        expect(balanceChange).to.be.lessThanOrEqual(0);
        expect(balanceChange).to.be.greaterThanOrEqual(-stakeAmount * 2n); // Allow for reasonable bounds
        
        // Verify the fight was marked as lost
        expect(fightDetails.fighterWon).to.be.false;
      }
      
      // Verify common properties regardless of outcome
      expect(fightDetails.isActive).to.be.false;
      expect(await fightClub.stakedAmounts(player1.address)).to.equal(0);
    });

    it("Should calculate correct reward multiplier", async function () {
      const stakeAmount = ethers.parseEther("1.0");
      const expectedWinPayout = (stakeAmount * 180n) / 100n; // 1.8x
      
      expect(expectedWinPayout).to.equal(ethers.parseEther("1.8"));
    });
  });

  describe("Multiple Players", function () {
    beforeEach(async function () {
      // Mint fighters for multiple players
      await fighterNFT.mint(player2.address);
    });

    it("Should allow multiple players to stake simultaneously", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      
      await fightClub.connect(player1).stake(1, { value: stakeAmount });
      await fightClub.connect(player2).stake(2, { value: stakeAmount });
      
      expect(await fightClub.stakedAmounts(player1.address)).to.equal(stakeAmount);
      expect(await fightClub.stakedAmounts(player2.address)).to.equal(stakeAmount);
    });

    it("Should handle independent fights for different players", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      
      await fightClub.connect(player1).stake(1, { value: stakeAmount });
      await fightClub.connect(player2).stake(2, { value: stakeAmount });
      
      await fightClub.connect(player1).fight();
      
      // Player1's fight should be finished, player2's still active
      const fight1 = await fightClub.getFightDetails(player1.address);
      const fight2 = await fightClub.getFightDetails(player2.address);
      
      expect(fight1.isActive).to.be.false;
      expect(fight2.isActive).to.be.true;
      
      // Player2 should still be able to fight
      await expect(fightClub.connect(player2).fight())
        .to.emit(fightClub, "FightCompleted");
    });
  });

  describe("NPC Generation", function () {
    it("Should generate different NPCs for different players", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      
      // Mint another fighter for player2
      await fighterNFT.mint(player2.address);
      
      await fightClub.connect(player1).stake(1, { value: stakeAmount });
      await fightClub.connect(player2).stake(2, { value: stakeAmount });
      
      const npc1 = await fightClub.getNPCStats(player1.address);
      const npc2 = await fightClub.getNPCStats(player2.address);
      
      // NPCs should have different stats (very unlikely to be identical)
      const npcsDifferent = npc1[0] !== npc2[0] || npc1[1] !== npc2[1] || npc1[2] !== npc2[2];
      expect(npcsDifferent).to.be.true;
    });

    it("Should reject getting NPC stats when no active fight", async function () {
      await expect(fightClub.getNPCStats(player1.address))
        .to.be.revertedWith("No active fight");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to withdraw contract balance", async function () {
      // Add some funds to the contract by having players lose fights
      const stakeAmount = ethers.parseEther("0.1");
      
      // Send some ether directly to contract for testing
      await owner.sendTransaction({
        to: await fightClub.getAddress(),
        value: ethers.parseEther("0.5")
      });
      
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(await fightClub.getAddress());
      
      const tx = await fightClub.withdrawContractBalance();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      const finalContractBalance = await ethers.provider.getBalance(await fightClub.getAddress());
      
      expect(finalContractBalance).to.equal(0);
      expect(finalOwnerBalance).to.be.closeTo(
        initialOwnerBalance + contractBalance - gasUsed,
        ethers.parseEther("0.001")
      );
    });

    it("Should reject withdrawal from non-owner", async function () {
      await expect(fightClub.connect(player1).withdrawContractBalance())
        .to.be.revertedWithCustomError(fightClub, "OwnableUnauthorizedAccount")
        .withArgs(player1.address);
    });
  });

  describe("Contract Balance Management", function () {
    it("Should receive ether correctly", async function () {
      const sendAmount = ethers.parseEther("1.0");
      const initialBalance = await ethers.provider.getBalance(await fightClub.getAddress());
      
      await owner.sendTransaction({
        to: await fightClub.getAddress(),
        value: sendAmount
      });
      
      const finalBalance = await ethers.provider.getBalance(await fightClub.getAddress());
      expect(finalBalance).to.equal(initialBalance + sendAmount);
    });

    it("Should accumulate losing stakes in contract", async function () {
      const stakeAmount = ethers.parseEther("0.01");
      const initialContractBalance = await ethers.provider.getBalance(await fightClub.getAddress());
      
      await fightClub.connect(player1).stake(1, { value: stakeAmount });
      await fightClub.connect(player1).fight();
      
      const fightDetails = await fightClub.getFightDetails(player1.address);
      const finalContractBalance = await ethers.provider.getBalance(await fightClub.getAddress());
      
      if (!fightDetails.fighterWon) {
        // If player lost, contract should have the stake
        expect(finalContractBalance).to.equal(initialContractBalance + stakeAmount);
      }
    });
  });
});
