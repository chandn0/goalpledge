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
  // Constructor
  {
    type: 'constructor',
    inputs: [
      { name: 'usdcAddress', type: 'address' },
      { name: 'treasuryAddress', type: 'address' },
      { name: 'minBufferSeconds', type: 'uint64' },
    ],
    stateMutability: 'nonpayable',
  },

  // === EXISTING GOAL FUNCTIONS ===
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

  // === NEW BENEFICIARY FUNCTIONS ===
  {
    type: 'function',
    name: 'setBeneficiary',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'beneficiary', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'clearBeneficiary',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getBeneficiary',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'userBeneficiaries',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'address' }],
  },

  // === NEW CHALLENGE FUNCTIONS ===
  {
    type: 'function',
    name: 'createChallenge',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'description', type: 'string' },
      { name: 'entryFee', type: 'uint128' },
      { name: 'startTime', type: 'uint64' },
      { name: 'deadline', type: 'uint64' },
      { name: 'goal', type: 'string' },
    ],
    outputs: [{ name: 'challengeId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'joinChallenge',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'markChallengeComplete',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'resolveChallenge',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimChallengeWinnings',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    outputs: [],
  },

  // === CHALLENGE GETTER FUNCTIONS ===
  {
    type: 'function',
    name: 'getUserChallenges',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'getChallenge',
    stateMutability: 'view',
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'creator', type: 'address' },
          { name: 'description', type: 'string' },
          { name: 'entryFee', type: 'uint128' },
          { name: 'startTime', type: 'uint64' },
          { name: 'deadline', type: 'uint64' },
          { name: 'totalParticipants', type: 'uint256' },
          { name: 'winners', type: 'uint256' },
          { name: 'resolved', type: 'bool' },
          { name: 'goal', type: 'string' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getChallengeParticipants',
    stateMutability: 'view',
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'user', type: 'address' },
          { name: 'stake', type: 'uint128' },
          { name: 'completed', type: 'bool' },
          { name: 'claimed', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getChallengeParticipant',
    stateMutability: 'view',
    inputs: [
      { name: 'challengeId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'user', type: 'address' },
          { name: 'stake', type: 'uint128' },
          { name: 'completed', type: 'bool' },
          { name: 'claimed', type: 'bool' },
        ],
      },
    ],
  },

  // === STORAGE MAPPINGS (for direct access) ===
  {
    type: 'function',
    name: 'challenges',
    stateMutability: 'view',
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    outputs: [
      { name: 'creator', type: 'address' },
      { name: 'description', type: 'string' },
      { name: 'entryFee', type: 'uint128' },
      { name: 'startTime', type: 'uint64' },
      { name: 'deadline', type: 'uint64' },
      { name: 'totalParticipants', type: 'uint256' },
      { name: 'winners', type: 'uint256' },
      { name: 'resolved', type: 'bool' },
      { name: 'goal', type: 'string' },
    ],
  },
  {
    type: 'function',
    name: 'challengeParticipants',
    stateMutability: 'view',
    inputs: [
      { name: 'challengeId', type: 'uint256' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [
      { name: 'user', type: 'address' },
      { name: 'stake', type: 'uint128' },
      { name: 'completed', type: 'bool' },
      { name: 'claimed', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'userChallengeIndex',
    stateMutability: 'view',
    inputs: [
      { name: 'challengeId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'nextChallengeId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },

  // === EXISTING SYSTEM FUNCTIONS ===
  {
    type: 'function',
    name: 'minDeadlineBuffer',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint64' }],
  },
  {
    type: 'function',
    name: 'treasury',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'usdc',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },

  // === EVENTS ===
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
  {
    type: 'event',
    name: 'GoalCompleted',
    inputs: [
      { name: 'goalId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'StakeClaimed',
    inputs: [
      { name: 'goalId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'StakeForfeited',
    inputs: [
      { name: 'goalId', type: 'uint256', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'BeneficiarySet',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'beneficiary', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'BeneficiaryCleared',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'ChallengeCreated',
    inputs: [
      { name: 'challengeId', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'description', type: 'string', indexed: false },
      { name: 'entryFee', type: 'uint128', indexed: false },
      { name: 'startTime', type: 'uint64', indexed: false },
      { name: 'deadline', type: 'uint64', indexed: false },
      { name: 'goal', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ChallengeJoined',
    inputs: [
      { name: 'challengeId', type: 'uint256', indexed: true },
      { name: 'participant', type: 'address', indexed: true },
      { name: 'stake', type: 'uint128', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ChallengeGoalCompleted',
    inputs: [
      { name: 'challengeId', type: 'uint256', indexed: true },
      { name: 'participant', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'ChallengeResolved',
    inputs: [
      { name: 'challengeId', type: 'uint256', indexed: true },
      { name: 'winners', type: 'uint256', indexed: false },
      { name: 'totalPayout', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ChallengeWinningsClaimed',
    inputs: [
      { name: 'challengeId', type: 'uint256', indexed: true },
      { name: 'winner', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;