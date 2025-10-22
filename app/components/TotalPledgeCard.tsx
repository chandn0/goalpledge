"use client";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import {
  GOAL_PLEDGE_ESCROW_ADDRESS,
  USDC_DECIMALS,
} from "../lib/contracts";
import { goalPledgeEscrowAbi } from "../lib/abi";
import { formatUnits } from "viem";

export default function TotalPledgeCard({ refreshKey }: { refreshKey?: number }) {
  const { address } = useAccount();

  const { data: ids } = useReadContract({
    address: GOAL_PLEDGE_ESCROW_ADDRESS,
    abi: goalPledgeEscrowAbi,
    functionName: "getUserGoals",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: goalsData, refetch } = useReadContracts({
    contracts: (ids as bigint[] | undefined)?.map((id) => ({
      address: GOAL_PLEDGE_ESCROW_ADDRESS,
      abi: goalPledgeEscrowAbi,
      functionName: "getGoal",
      args: [id],
    })),
    query: { enabled: !!ids && ids.length > 0 },
  });

  // Refresh when parent bumps key
  if (refreshKey) {
    // fire and forget, wagmi caches
    refetch();
  }

  type GoalResult = { amount: bigint };

  const totalPledged =
    goalsData?.reduce((acc, goal) => {
      if (goal.result) {
        const { amount } = (goal.result as unknown) as GoalResult;
        return acc + amount;
      }
      return acc;
    }, 0n) ?? 0n;

  if (!address) {
    return null;
  }

  return (
    <div className="mb-6 text-center">
      
      <p className="text-2xl sm:text-3xl font-bold">
        {formatUnits(totalPledged, USDC_DECIMALS)}$
      </p>
      <p className="text-sm sm:text-base font-medium text-gray-500">Pledged</p>
      {/* <p className="text-xs text-muted-foreground">
        Across {(ids as bigint[] | undefined)?.length ?? 0} goals
      </p> */}
    </div>
  );
}
