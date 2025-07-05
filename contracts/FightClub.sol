// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./FighterNFT.sol";

contract FightClub is Ownable {
    FighterNFT public fighterNFT;
    
    struct NPCStats {
        uint8 str;
        uint8 dex;
        uint16 hp;
    }
    
    struct Fight {
        uint256 fighterTokenId;
        NPCStats npc;
        uint256 stakeAmount;
        address staker;
        bool isActive;
        bool fighterWon;
    }
    
    mapping(address => Fight) public activeFights;
    mapping(address => uint256) public stakedAmounts;
    
    uint256 public constant MIN_STAKE = 0.001 ether; // Minimum stake amount
    uint256 public constant FIGHT_REWARD_MULTIPLIER = 180; // 1.8x reward (180/100)
    
    event FightStarted(address indexed player, uint256 fighterTokenId, uint256 stakeAmount);
    event FightCompleted(address indexed player, bool fighterWon, uint256 payout);
    event StakeWithdrawn(address indexed player, uint256 amount);
    
    constructor(address _fighterNFT) Ownable(msg.sender) {
        fighterNFT = FighterNFT(_fighterNFT);
    }
    
    // Generate a pseudo-random NPC using on-chain data
    function _generateNPC(address player, uint256 fighterTokenId) private view returns (NPCStats memory) {
        bytes32 hash = keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            player,
            fighterTokenId,
            block.number
        ));
        
        return NPCStats({
            str: uint8(uint256(hash) % 100) + 1,
            dex: uint8(uint256(hash >> 8) % 100) + 1,
            hp: uint16(uint256(hash >> 16) % 200) + 100 // HP between 100-300
        });
    }
    
    // Calculate battle outcome using turn-based logic
    function _simulateFight(FighterNFT.FighterStats memory fighter, NPCStats memory npc, bytes32 seed) private pure returns (bool) {
        uint256 fighterHP = fighter.hp;
        uint256 npcHP = npc.hp;
        
        // Determine who goes first based on dexterity
        bool fighterFirst = fighter.dex >= npc.dex;
        
        uint256 round = 0;
        while (fighterHP > 0 && npcHP > 0 && round < 50) { // Max 50 rounds to prevent infinite loops
            if ((fighterFirst && round % 2 == 0) || (!fighterFirst && round % 2 == 1)) {
                // Fighter's turn
                uint256 damage = _calculateDamage(fighter.str, seed, round);
                if (damage >= npcHP) {
                    npcHP = 0;
                } else {
                    npcHP -= damage;
                }
            } else {
                // NPC's turn
                uint256 damage = _calculateDamage(npc.str, seed, round + 1);
                if (damage >= fighterHP) {
                    fighterHP = 0;
                } else {
                    fighterHP -= damage;
                }
            }
            round++;
        }
        
        return fighterHP > 0; // Fighter wins if they have HP left
    }
    
    // Calculate damage with some randomness
    function _calculateDamage(uint8 strength, bytes32 seed, uint256 round) private pure returns (uint256) {
        uint256 randomFactor = uint256(keccak256(abi.encodePacked(seed, round))) % 50 + 75; // 75-125% of strength
        return (strength * randomFactor) / 100;
    }
    
    // Stake tokens and start a fight
    function stake(uint256 fighterTokenId) external payable {
        require(msg.value >= MIN_STAKE, "Stake amount too low");
        require(fighterNFT.ownerOf(fighterTokenId) == msg.sender, "You don't own this fighter");
        require(!activeFights[msg.sender].isActive, "You already have an active fight");
        
        // Generate NPC opponent
        NPCStats memory npc = _generateNPC(msg.sender, fighterTokenId);
        
        // Store fight data
        activeFights[msg.sender] = Fight({
            fighterTokenId: fighterTokenId,
            npc: npc,
            stakeAmount: msg.value,
            staker: msg.sender,
            isActive: true,
            fighterWon: false
        });
        
        stakedAmounts[msg.sender] += msg.value;
        
        emit FightStarted(msg.sender, fighterTokenId, msg.value);
    }
    
    // Execute the fight and determine the outcome
    function fight() external {
        Fight storage playerFight = activeFights[msg.sender];
        require(playerFight.isActive, "No active fight");
        
        // Get fighter stats
        FighterNFT.FighterStats memory fighterStats = fighterNFT.getStats(playerFight.fighterTokenId);
        
        // Generate seed for fight simulation
        bytes32 fightSeed = keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            playerFight.fighterTokenId
        ));
        
        // Simulate the fight
        bool fighterWins = _simulateFight(fighterStats, playerFight.npc, fightSeed);
        
        playerFight.fighterWon = fighterWins;
        playerFight.isActive = false;
        
        uint256 payout = 0;
        if (fighterWins) {
            // Fighter wins: return stake + reward
            payout = (playerFight.stakeAmount * FIGHT_REWARD_MULTIPLIER) / 100;
            stakedAmounts[msg.sender] = 0;
            
            // Transfer the payout
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Payout transfer failed");
        } else {
            // Fighter loses: lose the stake
            stakedAmounts[msg.sender] = 0;
        }
        
        emit FightCompleted(msg.sender, fighterWins, payout);
    }
    
    // Get current fight details
    function getFightDetails(address player) external view returns (Fight memory) {
        return activeFights[player];
    }
    
    // Get NPC stats for display
    function getNPCStats(address player) external view returns (NPCStats memory) {
        require(activeFights[player].isActive, "No active fight");
        return activeFights[player].npc;
    }
    
    // Owner functions for contract management
    function withdrawContractBalance() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Allow the contract to receive Ether
    receive() external payable {}
}
