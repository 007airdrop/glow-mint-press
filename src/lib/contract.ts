/**
 * After deploying contracts/RarityRewards.sol to Base, paste the address here.
 * Leave empty string to keep the app in mock-mint mode (default for v1).
 */
export const REWARDS_CONTRACT_ADDRESS = "" as `0x${string}` | "";

export const REWARDS_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "lastMintAt",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "cooldown",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "RewardMinted",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "rarity", type: "uint8", indexed: false },
    ],
    anonymous: false,
  },
] as const;

export const isContractConfigured = REWARDS_CONTRACT_ADDRESS !== "";
