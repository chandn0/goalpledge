"use client";
import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { Plus, ShieldCheck, CheckCircle } from "lucide-react";
import { erc20Abi, goalPledgeEscrowAbi } from "../lib/abi";
import {
  BASE_SEPOLIA_CHAIN_ID,
  GOAL_PLEDGE_ESCROW_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "../lib/contracts";
import { upsertGoalMeta } from "../lib/localMeta";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Calendar from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

type Props = {
  onCreated?: (goalId: bigint) => void;
};

export default function CreateGoalDialog({ onCreated }: Props) {
  const { address, chainId } = useAccount();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [deadlineStr, setDeadlineStr] = useState("");
  const [notes, setNotes] = useState("");

  const amount = useMemo(() => {
    if (!amountStr) return undefined;
    try {
      return parseUnits(amountStr, USDC_DECIMALS);
    } catch {
      return undefined;
    }
  }, [amountStr]);

  const deadline = useMemo(() => {
    if (!deadlineStr) return undefined;
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return undefined;
    return BigInt(Math.floor(d.getTime() / 1000));
  }, [deadlineStr]);

  const { data: minBuffer } = useReadContract({
    address: GOAL_PLEDGE_ESCROW_ADDRESS,
    abi: goalPledgeEscrowAbi,
    functionName: "minDeadlineBuffer",
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address
      ? [address, GOAL_PLEDGE_ESCROW_ADDRESS]
      : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const needsApprove = useMemo(() => {
    if (!amount || allowance == null) return false;
    try {
      return allowance < amount;
    } catch {
      return true;
    }
  }, [allowance, amount]);

  const disabled =
    !address || chainId !== BASE_SEPOLIA_CHAIN_ID || !amount || !deadline || !title.trim();

  async function onApprove() {
    if (!amount) return;
    await writeContractAsync({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [GOAL_PLEDGE_ESCROW_ADDRESS, amount],
    });
    await refetchAllowance();
  }

  async function onCreate() {
    if (!amount || !deadline || !title.trim()) return;
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (minBuffer != null && deadline <= now + BigInt(minBuffer as bigint)) {
      alert("Deadline must be after the minimum buffer");
      return;
    }
    const goalId = (await writeContractAsync({
      address: GOAL_PLEDGE_ESCROW_ADDRESS,
      abi: goalPledgeEscrowAbi,
      functionName: "createGoal",
      args: [amount, deadline, title],
    })) as unknown as bigint;
    // Best-effort local metadata persistence
    upsertGoalMeta(
      BASE_SEPOLIA_CHAIN_ID,
      GOAL_PLEDGE_ESCROW_ADDRESS,
      BigInt(goalId),
      { title, notes },
    );
    setOpen(false);
    setTitle("");
    setAmountStr("");
    setDeadlineStr("");
    setNotes("");
    onCreated?.(BigInt(goalId));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-8 right-8 sm:relative sm:bottom-auto sm:right-auto rounded-full sm:rounded-md h-16 w-16 sm:h-auto sm:w-auto shadow-xl sm:shadow-none"
        >
          <Plus className="h-10 w-10 sm:h-6 sm:w-6 sm:mr-2" />
          <span className="hidden sm:inline">Create Goal</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Create Goal</DialogTitle>
          <DialogDescription>
            Set a goal with a pledge amount. Complete it by the deadline to get your money back.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Run 5k"
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Pledge Amount (USDC)</Label>
            <Input
              id="amount"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="10.00"
              type="number"
              step="0.01"
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Deadline</Label>
            <div className="w-full">
              <Calendar
                className="inline-block"
                selected={deadlineStr ? new Date(deadlineStr) : undefined}
                onSelect={(d) => {
                  const yyyy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                  const dd = String(d.getDate()).padStart(2, '0');
                  setDeadlineStr(`${yyyy}-${mm}-${dd}`);
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {needsApprove && (
            <Button 
              disabled={disabled || isPending} 
              onClick={onApprove}
              variant="outline"
              className="w-full sm:w-auto gap-2 transition-shadow hover:shadow-md"
            >
              {isPending ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              <span>Approve USDC</span>
            </Button>
          )}
          <Button
            disabled={disabled || isPending || needsApprove}
            onClick={onCreate}
            className="w-full sm:w-auto gap-2 transition-shadow hover:shadow-md"
          >
            {isPending ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>{isPending ? "Creating..." : "Create Goal"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


