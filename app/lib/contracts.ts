// Base Sepolia Testnet Configuration
export const BASE_SEPOLIA_CHAIN_ID = 84532 as const;
export const BASE_MAINNET_CHAIN_ID = 8453 as const;

// Use Base Mainnet for production
export const CURRENT_CHAIN_ID = BASE_MAINNET_CHAIN_ID;

// Contract addresses for Base Mainnet
export const GOAL_PLEDGE_ESCROW_ADDRESS =
  '0xedCD311Ca3aD735F3245faC724D9d5714845b761' as const; // Base Mainnet GoalPledge Escrow

// USDC addresses
export const USDC_ADDRESS_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const; // Base Sepolia USDC
export const USDC_ADDRESS_MAINNET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const; // Base Mainnet USDC

// Use Mainnet USDC for current deployment
export const USDC_ADDRESS = USDC_ADDRESS_MAINNET;

export const USDC_DECIMALS = 6 as const;


