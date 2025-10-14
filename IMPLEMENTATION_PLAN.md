### GoalPledge UI Implementation Plan

This plan wires the Base Sepolia deployment of `GoalPledgeEscrow` into the Next.js app under `goalpledge/`. It covers creating goals with USDC pledges and deadlines, marking goals complete, and claiming funds.

---

### Contract integration
- **Network**: Base Sepolia (`chainId: 84532`)
- **Contract**: `GoalPledgeEscrow`
  - Address: `0x7373770ffc99c7a51fd429aa0bd357cdb8a325fc`
  - ABI: use `goalpledge/public/contractabi.json`
- **USDC (Base Sepolia placeholder)**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

Expose a small config module (e.g., `app/config/contracts.ts`) exporting the address, chain, and ABI for wagmi/viem hooks.

---

### Pages and components
1) Landing/dashboard (`app/page.tsx`)
   - Shows connect wallet (OnchainKit modal is already provided in `RootProvider`).
   - Sections:
     - “Create Goal” card with a button to open a form modal.
     - “My Goals” list with status chips: Upcoming, Completed, Missed.

2) Create Goal modal (`app/components/CreateGoalDialog.tsx`)
   - Inputs:
     - Task title/description (client-only metadata, not on-chain; stored in local storage or simple index by `goalId`).
     - Pledge amount in USDC (6 decimals handling in UI; convert to `amount` as `uint256`).
     - Deadline (datetime picker → convert to seconds since epoch `uint64`).
   - Actions:
     - Step 1: Ensure USDC allowance is sufficient.
       - If insufficient: show `Approve` button calling `erc20.approve(escrowAddress, neededAmount)`.
     - Step 2: `createGoal(amount, deadline)` transaction.
   - After success: store `{goalId, title, notes}` mapping locally for richer UX labels.

3) Goals list (`app/components/GoalsList.tsx`)
   - Load `getUserGoals(address)` via `useReadContract` (wagmi) and fetch each `getGoal(goalId)`.
   - Derive status:
     - Upcoming: `!completed && now < deadline`
     - Completed: `completed && claimed`
     - Missed: `!completed && now >= deadline`
   - Render each item with:
     - Title (from local mapping if present; fallback `Goal #ID`).
     - Amount formatted in USDC (6 decimals).
     - Deadline (local time) and status chip.
     - Actions per state (see below).

4) Goal actions (`app/components/GoalActions.tsx`)
   - Upcoming (owner): show `Mark Complete`.
     - Calls `markComplete(goalId)`.
   - Completed & not claimed (owner): show `Claim`.
     - Calls `claim(goalId, to=ownerAddress)`.
   - Missed & not claimed (anyone can `forfeit`): optionally show `Forfeit` (secondary for MVP).
     - Calls `forfeit(goalId)`.

---

### Data and state management
- Use `@tanstack/react-query` for query caching and refetches after writes.
- Keep a client-side map `{goalId: {title, notes}}` in `localStorage` keyed per chain+contract.
- After each mutation (`createGoal`, `markComplete`, `claim`, `forfeit`), invalidate queries:
  - `getUserGoals` for the current address
  - `getGoal(goalId)` for updated items

---

### Wagmi/viem hooks
- Create a `lib/wagmi.ts` to set up wagmi config (Base Sepolia chain) if not already provided by OnchainKit.
- Read hooks:
  - `useAccount()` to get `address`, `chainId`.
  - `useReadContract({ address, abi, functionName: 'getUserGoals', args: [address] })`.
  - For each id, `useReadContract({ functionName: 'getGoal', args: [id] })` or batch with a multicall helper.
- Write hooks:
  - `useWriteContract()` for `approve`, `createGoal`, `markComplete`, `claim`, `forfeit`.
  - Guard: require connected wallet and correct `chainId`.

---

### UX flow details
1) Connect wallet
   - On page load, prompt to connect if no wallet.

2) Create goal
   - Validate amount > 0 and deadline > now + `minDeadlineBuffer` (read from contract via `minDeadlineBuffer()`).
   - Check allowance: `usdc.allowance(user, escrow)`. If `allowance < amount`, show `Approve`.
   - After approve mined, enable `Create Goal` button.
   - Show pending/mined toasts and link to BaseScan.

3) Mark complete
   - Only if owner, before deadline, and not already completed.
   - After mined, refetch.

4) Claim
   - Only if owner, `completed == true`, `claimed == false`.
   - Sends to `to = ownerAddress` field in UI (default self, editable optional).

5) Missed/forfeit (optional in MVP)
   - After deadline, anyone can call; funds go to treasury.

---

### Components to implement (files)
- `app/components/CreateGoalDialog.tsx`
- `app/components/GoalsList.tsx`
- `app/components/GoalActions.tsx`
- `app/lib/contracts.ts` (addresses/ABI/decimals)
- `app/lib/localMeta.ts` (localStorage helpers)

---

### Validation and formatting
- Amount: input in USDC with 6 decimals; convert using `parseUnits(value, 6)` via viem.
- Deadline: use `Date` → seconds (`Math.floor(date.getTime()/1000)`).
- Display amounts: `formatUnits(amount, 6)`.

---

### Testing checklist (manual)
- Approve then create a goal with valid buffer
- Create goal fails with too-soon deadline
- Mark complete before deadline
- Claim after complete
- Goal appears in lists with correct status transitions

---

### Env/config
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` already used.
- Add contract address to `contracts.ts`; no secret needed client-side.

---

### Nice-to-have (later)
- Batch reads via multicall for performance.
- Persist metadata to a lightweight backend or IPFS.
- Add `Forfeit` button and an admin settings page for owner-only ops.


