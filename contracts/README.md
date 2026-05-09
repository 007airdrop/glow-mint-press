# Press to Start — Smart Contracts

ERC-1155 NFT contract with weighted-random rarity minting, per-wallet cooldown,
pausable admin controls, and Base-network deploy scripts.

## Token IDs

| ID | Rarity     | Drop rate |
|----|------------|-----------|
| 1  | Common     | 50%       |
| 2  | Uncommon   | 30%       |
| 3  | Rare       | 15%       |
| 4  | Legendary  | 5%        |

## Setup

```bash
cd contracts
npm install     # or: pnpm install / yarn
cp .env.example .env
# Fill in PRIVATE_KEY and (optionally) BASESCAN_API_KEY + METADATA_BASE_URI
```

## Compile & test

```bash
npm run compile
npm test
```

## Pin metadata (recommended order)

1. Upload the four images to IPFS, note the folder CID.
2. Edit `metadata/1.json` … `metadata/4.json` so each `image` points to
   `ipfs://<image-cid>/<file>.png`.
3. Upload the metadata folder to IPFS, note that CID.
4. Set `METADATA_BASE_URI=ipfs://<metadata-cid>/{id}.json` in `.env`.

Pinata, web3.storage, NFT.Storage, or Lighthouse all work.

## Deploy

**Base Sepolia (testnet)**:
```bash
npm run deploy:base-sepolia
```

**Base mainnet**:
```bash
npm run deploy:base
```

The deploy script prints the contract address and (if `BASESCAN_API_KEY` is set)
auto-verifies on Basescan.

## Wire it into the frontend

Open `src/lib/contract.ts` in the project root and paste the deployed address:

```ts
export const REWARDS_CONTRACT_ADDRESS = "0x...." as `0x${string}` | "";
```

When this is non-empty the homepage banner switches from `Mock mint mode` to
`Live on Base`. The Wagmi config already targets Base + Base Sepolia, so the
Coinbase Smart Wallet will prompt the user to switch networks if needed.

## Admin functions

| Function                       | Caller | Notes                                  |
|--------------------------------|--------|----------------------------------------|
| `setCooldown(uint256)`         | owner  | Per-wallet cooldown in seconds (≤ 1 day) |
| `setBaseURI(string)`           | owner  | New `ipfs://CID/{id}.json` template    |
| `pause()` / `unpause()`        | owner  | Emergency stop on minting              |
| `ownerMint(to, id, amount)`    | owner  | Promo / correction mints               |

## Security notes

The mint function uses `block.prevrandao + msg.sender + per-user nonce` for
randomness. This is fine for a low-stakes social reward game but is **not**
manipulation-resistant against block producers. If the rewards become
financially significant, swap in **Chainlink VRF** or a commit-reveal scheme
before going to mainnet.
