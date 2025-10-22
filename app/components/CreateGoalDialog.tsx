"use client";
import { useMemo, useState, forwardRef, useImperativeHandle } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { Plus, ShieldCheck, CheckCircle, DollarSign, Calendar, AlertCircle, Users, Zap } from "lucide-react";
import { erc20Abi, goalPledgeEscrowAbi } from "../lib/abi";
import {
  CURRENT_CHAIN_ID,
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
import { Label } from "@/components/ui/label";
import Celebration from "./Celebration";

type Props = {
  onCreated?: (goalId: bigint) => void;
};

export type CreateGoalDialogRef = {
  openWithTitle: (title: string) => void;
};

const CreateGoalDialog = forwardRef<CreateGoalDialogRef, Props>(function CreateGoalDialog(
  { onCreated }: Props,
  ref
) {
  const { address, chainId } = useAccount();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"goal" | "challenge">("goal");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationConfig, setCelebrationConfig] = useState<{
    title: string;
    subtitle?: string;
    icon: "sparkles" | "star" | "zap" | "trophy";
  }>({ title: "Awesome!", icon: "sparkles" });
  
  // Personal Goal fields
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [deadlineStr, setDeadlineStr] = useState("");
  const [notes, setNotes] = useState("");
  
  // Challenge fields
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeGoal, setChallengeGoal] = useState("");
  const [entryFeeStr, setEntryFeeStr] = useState("");
  const [challengeStartStr, setChallengeStartStr] = useState("");
  const [challengeDeadlineStr, setChallengeDeadlineStr] = useState("");
  
  // Dialogs
  const [showBeneficiaryDialog, setShowBeneficiaryDialog] = useState(false);
  const [friendAddress, setFriendAddress] = useState("");

  useImperativeHandle(ref, () => ({
    openWithTitle: (initialTitle: string) => {
      setTitle(initialTitle);
      setOpen(true);
    },
  }));

  // Personal Goal: Convert amount
  const amount = useMemo(() => {
    if (!amountStr) return undefined;
    try {
      return parseUnits(amountStr, USDC_DECIMALS);
    } catch {
      return undefined;
    }
  }, [amountStr]);

  // Personal Goal: Convert deadline
  const deadline = useMemo(() => {
    if (!deadlineStr) return undefined;
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return undefined;
    return BigInt(Math.floor(d.getTime() / 1000));
  }, [deadlineStr]);

  // Challenge: Convert entry fee
  const entryFee = useMemo(() => {
    if (!entryFeeStr) return undefined;
    try {
      return parseUnits(entryFeeStr, USDC_DECIMALS);
    } catch {
      return undefined;
    }
  }, [entryFeeStr]);

  // Challenge: Convert start time
  const challengeStart = useMemo(() => {
    if (!challengeStartStr) return undefined;
    const d = new Date(challengeStartStr);
    if (isNaN(d.getTime())) return undefined;
    return BigInt(Math.floor(d.getTime() / 1000));
  }, [challengeStartStr]);

  // Challenge: Convert deadline
  const challengeDeadline = useMemo(() => {
    if (!challengeDeadlineStr) return undefined;
    const d = new Date(challengeDeadlineStr);
    if (isNaN(d.getTime())) return undefined;
    return BigInt(Math.floor(d.getTime() / 1000));
  }, [challengeDeadlineStr]);

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

  // Fetch beneficiary address
  const { data: beneficiaryAddress, isLoading: isBeneficiaryLoading } = useReadContract({
    address: GOAL_PLEDGE_ESCROW_ADDRESS,
    abi: goalPledgeEscrowAbi,
    functionName: "getBeneficiary",
    args: address ? [address] : undefined,
  });

  // Fetch treasury address
  const { data: treasuryAddress, isLoading: isTreasuryLoading } = useReadContract({
    address: GOAL_PLEDGE_ESCROW_ADDRESS,
    abi: goalPledgeEscrowAbi,
    functionName: "treasury",
    query: { refetchInterval: false },
  });

  // Check if the beneficiary is a custom one (not the treasury)
  const hasCustomBeneficiary = useMemo(() => {
    if (!beneficiaryAddress || !treasuryAddress) return false;
    return beneficiaryAddress.toLowerCase() !== treasuryAddress.toLowerCase();
  }, [beneficiaryAddress, treasuryAddress]);

  const { writeContractAsync, isPending } = useWriteContract();

  const needsApprove = useMemo(() => {
    if (!allowance) return false;
    const requiredAmount = mode === "goal" ? amount : entryFee;
    if (!requiredAmount) return false;
    try {
      return allowance < requiredAmount;
    } catch {
      return true;
    }
  }, [allowance, amount, entryFee, mode]);

  const goalDisabled =
    !address || chainId !== CURRENT_CHAIN_ID || !amount || !deadline || !title.trim();

  const challengeDisabled =
    !address || chainId !== CURRENT_CHAIN_ID || !entryFee || !challengeStart || !challengeDeadline || !challengeDescription.trim() || !challengeGoal.trim();

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  async function onApprove() {
    const requiredAmount = mode === "goal" ? amount : entryFee;
    if (!requiredAmount) return;
    await writeContractAsync({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [GOAL_PLEDGE_ESCROW_ADDRESS, requiredAmount],
    });
    await refetchAllowance();
  }

  async function onSetBeneficiary() {
    if (!friendAddress.trim()) {
      alert("Please enter a valid address");
      return;
    }
    try {
      await writeContractAsync({
        address: GOAL_PLEDGE_ESCROW_ADDRESS,
        abi: goalPledgeEscrowAbi,
        functionName: "setBeneficiary",
        args: [friendAddress as `0x${string}`],
      });
      setFriendAddress("");
      setShowBeneficiaryDialog(false);
    } catch {
      alert("Failed to set beneficiary. Please try again.");
    }
  }

  async function onCreate() {
    if (mode === "goal") {
      await createGoal();
    } else {
      await createChallenge();
    }
  }

  async function createGoal() {
    if (!amount || !deadline || !title.trim()) return;
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (minBuffer != null && deadline <= now + BigInt(minBuffer as bigint)) {
      alert("Deadline must be after the minimum buffer");
      return;
    }
    try {
      const txHash = await writeContractAsync({
        address: GOAL_PLEDGE_ESCROW_ADDRESS,
        abi: goalPledgeEscrowAbi,
        functionName: "createGoal",
        args: [amount, deadline, title],
      });
      
      // Only proceed with local state updates after transaction is confirmed
      if (txHash) {
        const goalId = (txHash as unknown as bigint);
        // Best-effort local metadata persistence
        upsertGoalMeta(
          CURRENT_CHAIN_ID,
          GOAL_PLEDGE_ESCROW_ADDRESS,
          BigInt(goalId),
          { title, notes },
        );
        resetForm();
        setOpen(false);
        onCreated?.(BigInt(goalId));
        setShowCelebration(true);
        setCelebrationConfig({ title: "Goal Created!", icon: "sparkles" });
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Failed to create goal. Please try again.");
    }
  }

  async function createChallenge() {
    if (!entryFee || !challengeStart || !challengeDeadline || !challengeDescription.trim() || !challengeGoal.trim()) return;
    const now = BigInt(Math.floor(Date.now() / 1000));
    
    if (challengeStart <= now) {
      alert("Start time must be in the future");
      return;
    }
    
    if (minBuffer != null && challengeDeadline <= challengeStart + BigInt(minBuffer as bigint)) {
      alert("Challenge deadline must be at least the minimum buffer after start time");
      return;
    }

    try {
      const txHash = await writeContractAsync({
        address: GOAL_PLEDGE_ESCROW_ADDRESS,
        abi: goalPledgeEscrowAbi,
        functionName: "createChallenge",
        args: [challengeDescription, entryFee as bigint, challengeStart as bigint, challengeDeadline as bigint, challengeGoal],
      });
      
      // Only show success after transaction is confirmed
      if (txHash) {
        resetForm();
        setOpen(false);
        onCreated?.(0n); // Trigger refresh (challengeId not needed for refresh)
        setShowCelebration(true);
        setCelebrationConfig({ title: "Challenge Created!", icon: "zap" });
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      alert("Failed to create challenge. Please try again.");
    }
  }

  function resetForm() {
    setTitle("");
    setAmountStr("");
    setDeadlineStr("");
    setNotes("");
    setChallengeDescription("");
    setChallengeGoal("");
    setEntryFeeStr("");
    setChallengeStartStr("");
    setChallengeDeadlineStr("");
  }

  const getDeadlineString = (days: number) => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    return now.toISOString().split('T')[0];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            variant="outline"
            className="fixed bottom-8 right-8 sm:relative sm:bottom-auto sm:right-auto rounded-full sm:rounded-lg h-16 w-16 sm:h-auto sm:w-auto shadow-lg sm:shadow-none border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          >
            <Plus className="h-10 w-10 sm:h-6 sm:w-6 sm:mr-2 text-primary-700" />
            <span className="hidden sm:inline text-gray-700">Create</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto border-none shadow-md rounded-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <DialogTitle className="text-2xl">
                {mode === "goal" ? "Create Goal" : "Create Challenge"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground text-left">
              {mode === "goal"
                ? "Commit to your goal with a pledge. Complete it to get your USDC back."
                : "Create a group challenge for your friends to compete and win together!"}
            </DialogDescription>
          </DialogHeader>

          {/* Mode Toggle */}
          <div className="flex gap-2 py-3 border-b border-gray-200">
            <Button
              onClick={() => {
                setMode("goal");
                resetForm();
              }}
              variant={mode === "goal" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Personal Goal
            </Button>
            <Button
              onClick={() => {
                setMode("challenge");
                resetForm();
              }}
              variant={mode === "challenge" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
            >
              <Zap className="h-4 w-4" />
              Group Challenge
            </Button>
          </div>
          
          <div className="space-y-6 py-4">
            {mode === "goal" ? (
              <>
                {/* PERSONAL GOAL FIELDS */}
                {/* Field 1: Goal Title */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Label htmlFor="title" className="font-semibold text-base">
                      What&apos;s your goal?
                    </Label>
                  </div>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Run 5K, Save $500"
                    className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 placeholder:text-gray-400 text-sm"
                  />
                </div>

                {/* Field 2: Amount */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Label htmlFor="amount" className="font-semibold text-base">
                      Pledge Amount
                    </Label>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="amount"
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                      placeholder="10.00"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-9 h-10 border-gray-200 focus:border-primary focus:ring-primary/20 placeholder:text-gray-400 text-sm"
                    />
                  </div>
                </div>

                {/* Field 3: Deadline */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Label className="font-semibold text-base">Choose Deadline</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: "1 Week", days: 7 },
                      { label: "2 Weeks", days: 14 },
                      { label: "1 Month", days: 30 },
                      { label: "2 Months", days: 60 },
                    ].map(({ label, days }) => (
                      <Button
                        key={days}
                        variant={deadlineStr === getDeadlineString(days) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDeadlineStr(getDeadlineString(days))}
                        className={`h-9 text-xs sm:text-sm font-medium transition-all ${
                          deadlineStr === getDeadlineString(days)
                            ? "shadow-md"
                            : "hover:border-primary/50"
                        }`}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  {deadlineStr && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs leading-relaxed text-gray-600 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>
                          Deadline: <span className="font-semibold text-gray-900">
                            {new Date(deadlineStr).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Field 4: Beneficiary Info */}
                {address && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <Label className="font-semibold text-base">If you lose...</Label>
                    </div>
                    
                    {isBeneficiaryLoading || isTreasuryLoading ? (
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 animate-pulse">
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    ) : beneficiaryAddress && treasuryAddress ? (
                      hasCustomBeneficiary ? (
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-start gap-2.5">
                            <Users className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs leading-relaxed text-gray-700 flex-1">
                              <p className="mb-1">Your pledge will be sent to your friend:</p>
                              <p className="font-mono font-semibold text-blue-900 break-all">{formatAddress(beneficiaryAddress)}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                            <div className="flex items-start gap-2.5">
                              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="text-xs leading-relaxed text-gray-700">
                                <p className="mb-1">If you don&apos;t complete this goal, your pledge will go to: 💝 Donations</p>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => setShowBeneficiaryDialog(true)}
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 text-xs font-medium hover:bg-primary/5"
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>Or add a friend&apos;s address</span>
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-xs text-red-700">Failed to load beneficiary information. Please refresh.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* GROUP CHALLENGE FIELDS */}
                {/* Field 1: Challenge Title/Description */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Label htmlFor="challengeDesc" className="font-semibold text-base">
                      Challenge Title
                    </Label>
                  </div>
                  <Input
                    id="challengeDesc"
                    value={challengeDescription}
                    onChange={(e) => setChallengeDescription(e.target.value)}
                    placeholder="e.g., 100 Days of Fitness"
                    className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 placeholder:text-gray-400 text-sm"
                  />
                </div>

                {/* Field 2: Challenge Goal */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Label htmlFor="challengeGoal" className="font-semibold text-base">
                      Goal Description
                    </Label>
                  </div>
                  <Input
                    id="challengeGoal"
                    value={challengeGoal}
                    onChange={(e) => setChallengeGoal(e.target.value)}
                    placeholder="e.g., Complete 100 workouts"
                    className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 placeholder:text-gray-400 text-sm"
                  />
                </div>

                {/* Field 3: Entry Fee */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Label htmlFor="entryFee" className="font-semibold text-base">
                      Entry Fee (USDC)
                    </Label>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="entryFee"
                      value={entryFeeStr}
                      onChange={(e) => setEntryFeeStr(e.target.value)}
                      placeholder="10.00"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-9 h-10 border-gray-200 focus:border-primary focus:ring-primary/20 placeholder:text-gray-400 text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Winners share the losers&apos; stakes!</p>
                </div>

                {/* Field 4: Start Time */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Label htmlFor="challengeStart" className="font-semibold text-base">
                      Start Date
                    </Label>
                  </div>
                  <Input
                    id="challengeStart"
                    type="date"
                    value={challengeStartStr}
                    onChange={(e) => setChallengeStartStr(e.target.value)}
                    className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 text-sm"
                  />
                </div>

                {/* Field 5: End/Deadline */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Label htmlFor="challengeDeadline" className="font-semibold text-base">
                      End Date (Deadline)
                    </Label>
                  </div>
                  <Input
                    id="challengeDeadline"
                    type="date"
                    value={challengeDeadlineStr}
                    onChange={(e) => setChallengeDeadlineStr(e.target.value)}
                    className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 text-sm"
                  />
                </div>

                {challengeStartStr && challengeDeadlineStr && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs leading-relaxed text-blue-900 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                      <span>
                        <span className="font-semibold">{new Date(challengeStartStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        {" "} to {" "}
                        <span className="font-semibold">{new Date(challengeDeadlineStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </span>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            {needsApprove && (
              <Button 
                disabled={(mode === "goal" ? goalDisabled : challengeDisabled) || isPending} 
                onClick={onApprove}
                variant="outline"
                className="w-full sm:w-auto gap-2 h-10 transition-all hover:shadow-md font-medium text-sm"
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
              disabled={(mode === "goal" ? goalDisabled : challengeDisabled) || isPending || needsApprove}
              onClick={onCreate}
              size="lg"
              className="w-full sm:w-auto gap-2 h-10 transition-all hover:shadow-md font-medium text-sm"
            >
              {isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>{mode === "goal" ? "Creating Goal..." : "Creating Challenge..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>{mode === "goal" ? "Create Goal" : "Create Challenge"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Beneficiary Setting Dialog */}
      <Dialog open={showBeneficiaryDialog} onOpenChange={setShowBeneficiaryDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto border-none shadow-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Friend&apos;s Address</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground text-left">
              If you don&apos;t complete your goal, your pledge will be sent to this address.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2.5">
              <Label htmlFor="friendAddr" className="font-semibold text-base">
                Friend&apos;s Wallet Address
              </Label>
              <Input
                id="friendAddr"
                value={friendAddress}
                onChange={(e) => setFriendAddress(e.target.value)}
                placeholder="0x..."
                className="h-10 border-gray-200 focus:border-primary focus:ring-primary/20 placeholder:text-gray-400 text-sm font-mono"
              />
              <p className="text-xs text-gray-500">
                This will be saved to your profile for future goals too.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button
              onClick={() => {
                setShowBeneficiaryDialog(false);
                setFriendAddress("");
              }}
              variant="outline"
              className="w-full sm:w-auto h-10 font-medium text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={onSetBeneficiary}
              disabled={!friendAddress.trim() || isPending}
              className="w-full sm:w-auto gap-2 h-10 font-medium text-sm"
            >
              {isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Setting...</span>
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  <span>Save Address</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Celebration Dialog */}
      <Celebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title={celebrationConfig.title}
        subtitle={celebrationConfig.subtitle}
        icon={celebrationConfig.icon}
      />
    </>
  );
});

export default CreateGoalDialog;


