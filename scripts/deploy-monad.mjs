// Deploy contracts/SpendLedger.sol to Monad testnet.
// Run: node --env-file=.env scripts/deploy-monad.mjs
import fs from "fs";
import { createPublicClient, createWalletClient, defineChain, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC = process.env.MONAD_RPC_URL || "https://rpc.monad.xyz";
const CHAIN_ID = Number(process.env.MONAD_CHAIN_ID || 143);
const PK = process.env.MONAD_PRIVATE_KEY;
if (!PK) {
  console.error("MONAD_PRIVATE_KEY missing (run with --env-file=.env)");
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(new URL("../lib/monad/spendLedger.json", import.meta.url)));

const monadChain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_ID === 143 ? "Monad" : "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  testnet: CHAIN_ID !== 143,
});

const account = privateKeyToAccount(PK);
const pub = createPublicClient({ chain: monadChain, transport: http(RPC) });

const bal = await pub.getBalance({ address: account.address });
console.log(`Deployer:  ${account.address}`);
console.log(`Balance:   ${formatEther(bal)} MON`);
if (bal === 0n) {
  console.error("\nNo gas. Fund the address at https://faucet.monad.xyz then re-run.");
  process.exit(1);
}

const wallet = createWalletClient({ account, chain: monadChain, transport: http(RPC) });
console.log("Deploying SpendLedger…");
const hash = await wallet.deployContract({ abi: artifact.abi, bytecode: artifact.bytecode, args: [] });
console.log(`Deploy tx: ${hash}`);
const receipt = await pub.waitForTransactionReceipt({ hash });
console.log(`\n✅ Deployed at: ${receipt.contractAddress}`);
console.log(`\nAdd to .env and Vercel:\nMONAD_LEDGER_ADDRESS=${receipt.contractAddress}`);
