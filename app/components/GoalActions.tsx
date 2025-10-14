"use client";
import { useAccount, useWriteContract } from "wagmi";
import { goalPledgeEscrowAbi } from "../lib/abi";
import { BASE_SEPOLIA_CHAIN_ID, GOAL_PLEDGE_ESCROW_ADDRESS } from "../lib/contracts";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift } from "lucide-react";

type Props = {
  goalId: bigint;
  owner: `0x${string}`;
  deadline: bigint;
  completed: boolean;
  claimed: boolean;
  onChanged?: () => void;
};

export default function GoalActions({ goalId, owner, deadline, completed, claimed, onChanged }: Props) {
  const { address, chainId } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const isOwner = address?.toLowerCase() === owner.toLowerCase();
  const now = BigInt(Math.floor(Date.now() / 1000));
  const isPastDeadline = now > deadline;

  async function doMarkComplete() {
    await writeContractAsync({
      address: GOAL_PLEDGE_ESCROW_ADDRESS,
      abi: goalPledgeEscrowAbi,
      functionName: "markComplete",
      args: [goalId],
    });
    onChanged?.();
  }

  async function doClaim() {
    if (!address) return;
    await writeContractAsync({
      address: GOAL_PLEDGE_ESCROW_ADDRESS,
      abi: goalPledgeEscrowAbi,
      functionName: "claim",
      args: [goalId, address],
    });
    onChanged?.();
  }

  const canMarkComplete = isOwner && !completed && !isPastDeadline;
  const canClaim = isOwner && completed && !claimed;

  const disabled = chainId !== BASE_SEPOLIA_CHAIN_ID || isPending;

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {canMarkComplete && (
        <Button 
          disabled={disabled} 
          onClick={doMarkComplete}
          size="sm"
          className="w-full sm:w-auto"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark Complete
        </Button>
      )}
      {canClaim && (
        <Button 
          disabled={disabled} 
          onClick={doClaim}
          size="sm"
          variant="default"
          className="w-full sm:w-auto"
        >
          <Gift className="h-4 w-4 mr-2" />
          Claim
        </Button>
      )}
    </div>
  );
}


