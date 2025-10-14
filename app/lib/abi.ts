export const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export const goalPledgeEscrowAbi = [
  {
    type: 'function',
    name: 'createGoal',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'deadline', type: 'uint64' },
      { name: 'description', type: 'string' },
    ],
    outputs: [{ name: 'goalId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'markComplete',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'goalId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'goalId', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'forfeit',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'goalId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getUserGoals',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'getGoal',
    stateMutability: 'view',
    inputs: [{ name: 'goalId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'owner', type: 'address' },
          { name: 'amount', type: 'uint128' },
          { name: 'deadline', type: 'uint64' },
          { name: 'completed', type: 'bool' },
          { name: 'createdAt', type: 'uint64' },
          { name: 'claimed', type: 'bool' },
          { name: 'description', type: 'string' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'minDeadlineBuffer',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'event',
    name: 'GoalCreated',
    inputs: [
      { name: 'goalId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'deadline', type: 'uint64', indexed: false },
      { name: 'description', type: 'string', indexed: false },
    ],
  },
] as const;


