// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title RarityRewards
 * @notice ERC-1155 reward token with weighted-random rarity minting and a per-wallet cooldown.
 *
 *  Token IDs:
 *    1 = Common     (50%)
 *    2 = Uncommon   (30%)
 *    3 = Rare       (15%)
 *    4 = Legendary  (5%)
 *
 *  NOTE on randomness: this uses on-chain pseudo-randomness (block.prevrandao + sender + nonce).
 *  It is suitable for low-stakes social reward games but is NOT cryptographically secure and is
 *  not safe against incentivized validator manipulation. For high-value rewards, integrate
 *  Chainlink VRF or a commit-reveal scheme.
 *
 *  Metadata URI follows the ERC-1155 spec: setBaseURI("ipfs://CID/{id}.json").
 */
contract RarityRewards is ERC1155, ERC1155Supply, Ownable, Pausable {
    // ---------------------------------------------------------------- Events
    event RewardMinted(address indexed user, uint256 indexed tokenId, uint8 rarity);
    event CooldownUpdated(uint256 newCooldown);
    event BaseURIUpdated(string newURI);

    // ---------------------------------------------------------------- Storage
    uint8 public constant RARITY_COMMON = 1;
    uint8 public constant RARITY_UNCOMMON = 2;
    uint8 public constant RARITY_RARE = 3;
    uint8 public constant RARITY_LEGENDARY = 4;

    /// @notice Cooldown between mints per wallet (default 60s).
    uint256 public cooldown = 60;

    /// @notice Last mint timestamp per user (gas-friendly reuse for cooldown checks).
    mapping(address => uint256) public lastMintAt;

    /// @notice Per-user nonce mixed into the randomness seed.
    mapping(address => uint256) private _nonce;

    string private _baseURI;

    // ---------------------------------------------------------------- Constructor
    constructor(string memory baseURI_) ERC1155(baseURI_) Ownable(msg.sender) {
        _baseURI = baseURI_;
    }

    // ---------------------------------------------------------------- Public mint
    /**
     * @notice Mints one randomized rarity NFT to the caller. Subject to cooldown.
     * @return tokenId The minted rarity token id (1-4).
     */
    function mint() external whenNotPaused returns (uint256 tokenId) {
        address user = msg.sender;
        uint256 last = lastMintAt[user];
        require(block.timestamp >= last + cooldown, "Cooldown active");

        uint256 n = ++_nonce[user];
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    user,
                    n
                )
            )
        );

        uint256 roll = seed % 100; // 0-99
        uint8 rarity;
        if (roll < 50)        { rarity = RARITY_COMMON; }
        else if (roll < 80)   { rarity = RARITY_UNCOMMON; }
        else if (roll < 95)   { rarity = RARITY_RARE; }
        else                  { rarity = RARITY_LEGENDARY; }

        tokenId = uint256(rarity);
        lastMintAt[user] = block.timestamp;

        _mint(user, tokenId, 1, "");
        emit RewardMinted(user, tokenId, rarity);
    }

    // ---------------------------------------------------------------- Admin
    function setCooldown(uint256 newCooldown) external onlyOwner {
        require(newCooldown <= 1 days, "Cooldown too long");
        cooldown = newCooldown;
        emit CooldownUpdated(newCooldown);
    }

    function setBaseURI(string calldata newURI) external onlyOwner {
        _baseURI = newURI;
        _setURI(newURI);
        emit BaseURIUpdated(newURI);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// @notice Owner-only mint for promos / corrections.
    function ownerMint(address to, uint256 id, uint256 amount) external onlyOwner {
        require(id >= 1 && id <= 4, "Invalid rarity id");
        _mint(to, id, amount, "");
        emit RewardMinted(to, id, uint8(id));
    }

    // ---------------------------------------------------------------- Views
    function uri(uint256) public view override returns (string memory) {
        return _baseURI; // ERC-1155 clients substitute {id}
    }

    function timeUntilNextMint(address user) external view returns (uint256) {
        uint256 next = lastMintAt[user] + cooldown;
        if (block.timestamp >= next) return 0;
        return next - block.timestamp;
    }

    // ---------------------------------------------------------------- Required overrides
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
