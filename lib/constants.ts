export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

// 正しい本番URLを直接指定
export const APP_URL = 'https://monad-numbersum.vercel.app/';

export const MONAD_CHAIN_ID = 1337;
export const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz/";
export const COUNTER_CONTRACT_ADDRESS = "0xcA4d3659A5a4DA29312327cD44419512B4955f53";

export const COUNTER_ABI = [
  {
    type: "function",
    name: "increment",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "number",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setNumber",
    inputs: [{ name: "newNumber", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;