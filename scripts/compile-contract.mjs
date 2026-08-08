// Compile contracts/SpendLedger.sol -> lib/monad/spendLedger.json { abi, bytecode }.
// Run: node scripts/compile-contract.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import solc from "solc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "contracts/SpendLedger.sol"), "utf8");

const input = {
  language: "Solidity",
  sources: { "SpendLedger.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const out = JSON.parse(solc.compile(JSON.stringify(input)));
if (out.errors) {
  const fatal = out.errors.filter((e) => e.severity === "error");
  out.errors.forEach((e) => console.error(e.formattedMessage));
  if (fatal.length) process.exit(1);
}

const c = out.contracts["SpendLedger.sol"]["SpendLedger"];
const artifact = { abi: c.abi, bytecode: "0x" + c.evm.bytecode.object };

const dir = path.join(root, "lib/monad");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "spendLedger.json"), JSON.stringify(artifact, null, 2));
console.log("Wrote lib/monad/spendLedger.json  (bytecode " + artifact.bytecode.length + " chars, " + artifact.abi.length + " abi entries)");
