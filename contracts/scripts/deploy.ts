import { ethers, network, run } from "hardhat";

async function main() {
  const baseURI =
    process.env.METADATA_BASE_URI ?? "ipfs://REPLACE_WITH_CID/{id}.json";

  console.log(`Deploying RarityRewards to ${network.name} with baseURI: ${baseURI}`);

  const Factory = await ethers.getContractFactory("RarityRewards");
  const contract = await Factory.deploy(baseURI);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ RarityRewards deployed at: ${address}`);

  // Optional verify
  if (process.env.BASESCAN_API_KEY && network.name !== "hardhat") {
    console.log("Waiting 30s before verifying…");
    await new Promise((r) => setTimeout(r, 30_000));
    try {
      await run("verify:verify", { address, constructorArguments: [baseURI] });
      console.log("✅ Verified on Basescan");
    } catch (e) {
      console.warn("Verify failed (you can re-run manually):", e);
    }
  }

  console.log("\nNext steps:");
  console.log(`  1. Paste this address into src/lib/contract.ts → REWARDS_CONTRACT_ADDRESS`);
  console.log(`     "${address}"`);
  console.log(`  2. Pin metadata to IPFS and call setBaseURI("ipfs://CID/{id}.json") if needed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
