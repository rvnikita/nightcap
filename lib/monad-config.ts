// Public Monad chain constants (mainnet 143) (safe for the client bundle — no secrets, no viem).
export const MONAD_CHAIN_ID = 143;
export const MONAD_EXPLORER = "https://monadscan.com";
export const monadTxUrl = (hash: string) => `${MONAD_EXPLORER}/tx/${hash}`;
export const monadAddressUrl = (addr: string) => `${MONAD_EXPLORER}/address/${addr}`;
