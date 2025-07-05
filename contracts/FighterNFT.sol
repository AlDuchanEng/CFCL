// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FighterNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    struct FighterStats {
        uint8 str; // Strength
        uint8 dex; // Dexterity
        uint16 hp;  // Health Points
    }

    mapping(uint256 => FighterStats) public fighterStats;

    constructor() ERC721("CryptoFightClub Fighter", "CFCF") Ownable(msg.sender) {}

    function _generateRandomStat() private view returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100) + 1;
    }

    function mint(address to) public {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);

        fighterStats[tokenId] = FighterStats({
            str: _generateRandomStat(),
            dex: _generateRandomStat(),
            hp: uint16(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.number))) % 200) + 100 // HP between 100-300
        });
    }

    function getStats(uint256 tokenId) public view returns (FighterStats memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        return fighterStats[tokenId];
    }
}
