const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FighterNFT", function () {
  let FighterNFT;
  let fighterNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    FighterNFT = await ethers.getContractFactory("FighterNFT");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy a new FighterNFT contract for each test
    fighterNFT = await FighterNFT.deploy();
    await fighterNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await fighterNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await fighterNFT.name()).to.equal("CryptoFightClub Fighter");
      expect(await fighterNFT.symbol()).to.equal("CFCF");
    });
  });

  describe("Minting", function () {
    it("Should mint a new fighter NFT", async function () {
      await fighterNFT.mint(addr1.address);
      
      expect(await fighterNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await fighterNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should assign random stats when minting", async function () {
      await fighterNFT.mint(addr1.address);
      
      const stats = await fighterNFT.getStats(1);
      
      // Check that stats are within expected ranges
      expect(stats[0]).to.be.greaterThan(0);     // str
      expect(stats[0]).to.be.lessThanOrEqual(100);
      
      expect(stats[1]).to.be.greaterThan(0);     // dex
      expect(stats[1]).to.be.lessThanOrEqual(100);
      
      expect(stats[2]).to.be.greaterThanOrEqual(100); // hp
      expect(stats[2]).to.be.lessThanOrEqual(300);
    });

    it("Should mint multiple fighters with different stats", async function () {
      await fighterNFT.mint(addr1.address);
      await fighterNFT.mint(addr1.address);
      
      const stats1 = await fighterNFT.getStats(1);
      const stats2 = await fighterNFT.getStats(2);
      
      // Stats should be different (very unlikely to be identical with proper randomization)
      const stats1Different = stats1[0] !== stats2[0] || stats1[1] !== stats2[1] || stats1[2] !== stats2[2];
      expect(stats1Different).to.be.true;
    });

    it("Should increment token IDs correctly", async function () {
      await fighterNFT.mint(addr1.address);
      await fighterNFT.mint(addr2.address);
      await fighterNFT.mint(addr1.address);
      
      expect(await fighterNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await fighterNFT.ownerOf(2)).to.equal(addr2.address);
      expect(await fighterNFT.ownerOf(3)).to.equal(addr1.address);
      
      expect(await fighterNFT.balanceOf(addr1.address)).to.equal(2);
      expect(await fighterNFT.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should allow anyone to mint", async function () {
      // Test minting from different addresses
      await fighterNFT.connect(addr1).mint(addr1.address);
      await fighterNFT.connect(addr2).mint(addr2.address);
      
      expect(await fighterNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await fighterNFT.balanceOf(addr2.address)).to.equal(1);
    });
  });

  describe("Stats Retrieval", function () {
    it("Should return correct stats for existing token", async function () {
      await fighterNFT.mint(addr1.address);
      
      const stats = await fighterNFT.getStats(1);
      
      expect(stats).to.have.lengthOf(3);
      
      // Verify types and ranges - stats returns [str, dex, hp]
      expect(typeof stats[0]).to.equal('bigint'); // str
      expect(typeof stats[1]).to.equal('bigint'); // dex
      expect(typeof stats[2]).to.equal('bigint'); // hp
    });

    it("Should revert when querying stats for non-existent token", async function () {
      await expect(fighterNFT.getStats(999))
        .to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
    });

    it("Should return stats after token transfer", async function () {
      await fighterNFT.mint(addr1.address);
      const originalStats = await fighterNFT.getStats(1);
      
      // Transfer the token
      await fighterNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      
      // Stats should remain the same after transfer
      const statsAfterTransfer = await fighterNFT.getStats(1);
      expect(statsAfterTransfer[0]).to.equal(originalStats[0]); // str
      expect(statsAfterTransfer[1]).to.equal(originalStats[1]); // dex
      expect(statsAfterTransfer[2]).to.equal(originalStats[2]); // hp
    });
  });

  describe("ERC721 Compliance", function () {
    it("Should support ERC721 interface", async function () {
      const ERC721InterfaceId = "0x80ac58cd";
      expect(await fighterNFT.supportsInterface(ERC721InterfaceId)).to.be.true;
    });

    it("Should allow token transfers", async function () {
      await fighterNFT.mint(addr1.address);
      
      await fighterNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      
      expect(await fighterNFT.ownerOf(1)).to.equal(addr2.address);
      expect(await fighterNFT.balanceOf(addr1.address)).to.equal(0);
      expect(await fighterNFT.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should allow approvals and transferFrom", async function () {
      await fighterNFT.mint(addr1.address);
      
      // Approve addr2 to transfer token 1
      await fighterNFT.connect(addr1).approve(addr2.address, 1);
      
      // addr2 can now transfer the token
      await fighterNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
      
      expect(await fighterNFT.ownerOf(1)).to.equal(addr2.address);
    });
  });

  describe("Stat Ranges Validation", function () {
    it("Should generate STR and DEX stats between 1-100", async function () {
      // Mint multiple fighters to test stat ranges
      const numTests = 10;
      for (let i = 0; i < numTests; i++) {
        await fighterNFT.mint(addr1.address);
        const stats = await fighterNFT.getStats(i + 1);
        
        expect(stats[0]).to.be.greaterThan(0);      // str
        expect(stats[0]).to.be.lessThanOrEqual(100);
        
        expect(stats[1]).to.be.greaterThan(0);      // dex
        expect(stats[1]).to.be.lessThanOrEqual(100);
      }
    });

    it("Should generate HP stats between 100-300", async function () {
      // Mint multiple fighters to test HP range
      const numTests = 10;
      for (let i = 0; i < numTests; i++) {
        await fighterNFT.mint(addr1.address);
        const stats = await fighterNFT.getStats(i + 1);
        
        expect(stats[2]).to.be.greaterThanOrEqual(100); // hp
        expect(stats[2]).to.be.lessThanOrEqual(300);
      }
    });
  });
});
