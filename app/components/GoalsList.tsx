"use client";
import { useMemo, useEffect, useState } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { goalPledgeEscrowAbi } from "../lib/abi";
import {
  CURRENT_CHAIN_ID,
  GOAL_PLEDGE_ESCROW_ADDRESS,
  USDC_DECIMALS,
} from "../lib/contracts";
import { formatUnits } from "viem";
import { getLocalMeta } from "../lib/localMeta";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GoalActions from "./GoalActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Zap } from "lucide-react";
import Celebration from "./Celebration";
import type { CreateGoalDialogRef } from "./CreateGoalDialog";

// Shared goal types for component and helpers in this module
type GoalData = {
  owner: `0x${string}`;
  amount: bigint;
  deadline: bigint;
  completed: boolean;
  claimed: boolean;
  description?: string;
};

type GoalWithId = GoalData & { id: bigint };

// Challenge types
type ChallengeData = {
  creator: `0x${string}`;
  description: string;
  entryFee: bigint;
  startTime: bigint;
  deadline: bigint;
  totalParticipants: bigint;
  winners: bigint;
  resolved: boolean;
  goal: string;
};

type ChallengeWithId = ChallengeData & { id: bigint };

export default function GoalsList({ refreshKey, dialogRef }: { refreshKey?: number; dialogRef?: React.RefObject<CreateGoalDialogRef | null> }) {
  const { address, chainId } = useAccount();

  const { data: ids, refetch } = useReadContract({
    address: GOAL_PLEDGE_ESCROW_ADDRESS,
    abi: goalPledgeEscrowAbi,
    functionName: "getUserGoals",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: goalsData, refetch: refetchGoals } = useReadContracts({
    contracts: (ids as bigint[] | undefined)?.map((id) => ({
      address: GOAL_PLEDGE_ESCROW_ADDRESS,
      abi: goalPledgeEscrowAbi,
      functionName: "getGoal",
      args: [id],
    })),
    query: { enabled: !!ids && ids.length > 0 },
  });

  // Refresh reads when parent bumps key
  if (refreshKey) {
    refetch();
    refetchGoals();
  }

  const metas = useMemo(
    () => getLocalMeta(CURRENT_CHAIN_ID, GOAL_PLEDGE_ESCROW_ADDRESS),
    [],
  );

  const { upcomingGoals, completedGoals } = useMemo(() => {
    const upcoming: GoalWithId[] = [];
    const completed: GoalWithId[] = [];

    if (!goalsData) {
      return { upcomingGoals: upcoming, completedGoals: completed };
    }

    (ids as bigint[] | undefined)?.forEach((id, index) => {
      const goalResult = goalsData[index];
      if (goalResult && goalResult.status === 'success') {
        const goal = goalResult.result as unknown as GoalData;
        const now = BigInt(Math.floor(Date.now() / 1000));
        const isPastDeadline = now >= goal.deadline;
        
        const goalWithId: GoalWithId = { ...goal, id };

        if (!goal.completed && !isPastDeadline) {
          upcoming.push(goalWithId);
        } else if (goal.completed) {
          completed.push(goalWithId);
        }
      }
    });

    upcoming.sort((a, b) => Number(a.deadline) - Number(b.deadline));

    return { upcomingGoals: upcoming, completedGoals: completed };
  }, [goalsData, ids]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-6">
      <div className="mb-6">
        {/* <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">My Goals</h2> */}
        {!address && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Connect your wallet to view your goals.
              </p>
            </CardContent>
          </Card>
        )}
        {address && chainId !== CURRENT_CHAIN_ID && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Please switch to Base Sepolia network.
              </p>
            </CardContent>
          </Card>
        )}
        {address && chainId === CURRENT_CHAIN_ID && (
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="rounded-md bg-gray-100 p-1">
              <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-white data-[state=active]:shadow-none">Active</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:shadow-none">Completed</TabsTrigger>
                <TabsTrigger value="community" className="data-[state=active]:bg-white data-[state=active]:shadow-none">Community</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="upcoming">
            <GoalCategoryList goals={upcomingGoals} metas={metas} refetch={refetch} view="list" />

              {upcomingGoals.length < 2 && (
                <TemplateSuggestions dialogRef={dialogRef} />
              )}
            </TabsContent>
            <TabsContent value="completed">
              <GoalCategoryList goals={completedGoals} metas={metas} refetch={refetch} view="card" />
            </TabsContent>
            <TabsContent value="community">
              <CommunityChallengesView userAddress={address} refreshKey={refreshKey} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function GoalCategoryList({ goals, metas, refetch, view }: { goals: GoalWithId[], metas: Record<string, { title?: string; notes?: string }>, refetch: () => void, view: 'list' | 'card' }) {
  if (goals.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No goals in this category.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (view === 'list') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayGoals = goals.filter(goal => {
      const deadlineDate = new Date(Number(goal.deadline) * 1000);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate.getTime() === today.getTime();
    });

    const tomorrowGoals = goals.filter(goal => {
      const deadlineDate = new Date(Number(goal.deadline) * 1000);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate.getTime() === tomorrow.getTime();
    });

    const futureGoals = goals.filter(goal => {
        const deadlineDate = new Date(Number(goal.deadline) * 1000);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate.getTime() > tomorrow.getTime();
    });
    
    return (
        <div className="space-y-4 mt-4">
            {todayGoals.length > 0 && <GoalGroup title="Today" goals={todayGoals} metas={metas} refetch={refetch} />}
            {tomorrowGoals.length > 0 && <GoalGroup title="Tomorrow" goals={tomorrowGoals} metas={metas} refetch={refetch} />}
            {futureGoals.length > 0 && <GoalGroup title="Future" goals={futureGoals} metas={metas} refetch={refetch} />}
        </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      {goals.map((goal) => (
        <GoalRow
          key={goal.id.toString()}
          goalId={goal.id}
          goalData={goal}
          onChanged={() => refetch()}
          title={metas[goal.id.toString()]?.title}
        />
      ))}
    </div>
  )
}

function GoalGroup({ title, goals, metas, refetch }: { title: string, goals: GoalWithId[], metas: Record<string, { title?: string; notes?: string }>, refetch: () => void }) {
    return (
        <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3">{ title}</h3>
            <div className="space-y-2">
                {goals.map(goal => (
                    <UpcomingGoalRow
                        key={goal.id.toString()}
                        goalId={goal.id}
                        goalData={goal}
                        onChanged={() => refetch()}
                        title={metas[goal.id.toString()]?.title}
                    />
                ))}
            </div>
        </div>
    );
}

function UpcomingGoalRow({ goalId, goalData, onChanged, title }: { goalId: bigint; goalData: GoalData; onChanged: () => void; title?: string }) {
    const { description } = goalData;
    const { writeContractAsync, isPending } = useWriteContract();
    const [showCelebration, setShowCelebration] = useState(false);
    
    async function doMarkComplete() {
        await writeContractAsync({
            address: GOAL_PLEDGE_ESCROW_ADDRESS,
            abi: goalPledgeEscrowAbi,
            functionName: "markComplete",
            args: [goalId],
        });
        setShowCelebration(true);
        onChanged?.();
    }

    return (
        <>
            <div className="flex items-center p-3 rounded-lg bg-white shadow-sm border border-gray-200">
                <button onClick={doMarkComplete} disabled={isPending} className="mr-4">
                    <CheckCircle className={`h-6 w-6 ${isPending ? 'text-gray-400' : 'text-gray-300 hover:text-green-500'} transition-colors`} />
                </button>
                <div className="flex-1 flex justify-between items-center">
                    <p className="text-sm sm:text-base">{description || title || `Goal #${goalId.toString()}`}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        ${formatUnits(goalData.amount, USDC_DECIMALS)} USDC
                    </p>
                </div>
            </div>
            <Celebration
                isOpen={showCelebration}
                onClose={() => setShowCelebration(false)}
                title="Goal Completed! 🎯"
                subtitle="Keep up the amazing work!"
                icon="trophy"
                duration={3000}
            />
        </>
    );
}

function GoalRow({ goalId, goalData, onChanged, title }: { goalId: bigint; goalData: GoalData; onChanged: () => void; title?: string }) {
  const { owner, amount, deadline, completed, claimed, description } = goalData;
  const now = BigInt(Math.floor(Date.now() / 1000));
  const isPastDeadline = now >= deadline;

  const getStatusInfo = () => {
    if (!completed && !isPastDeadline) return { text: "Upcoming", variant: "secondary" as const };
    if (completed && claimed) return { text: "Completed", variant: "default" as const };
    if (!completed && isPastDeadline) return { text: "Missed", variant: "destructive" as const };
    if (completed && !claimed) return { text: "Claimable", variant: "default" as const };
    return { text: "Unknown", variant: "secondary" as const };
  };

  const statusInfo = getStatusInfo();
  const deadlineDate = new Date(Number(deadline) * 1000);
  const isToday = deadlineDate.toDateString() === new Date().toDateString();
  const isTomorrow = deadlineDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const formatDeadline = () => {
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    return deadlineDate.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base sm:text-lg truncate">
                {description || title || `Goal #${goalId.toString()}`}
              </CardTitle>
              <Badge variant={statusInfo.variant} className="shrink-0">
                {statusInfo.text}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>
                ${formatUnits(amount, USDC_DECIMALS)} USDC
              </span>
              <span className="hidden sm:inline">•</span>
              <span>
                Deadline: {formatDeadline()}
              </span>
              {!isToday && !isTomorrow && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-xs">
                    {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end sm:justify-start">
            <GoalActions
              goalId={goalId}
              owner={owner}
              deadline={deadline}
              completed={completed}
              claimed={claimed}
              onChanged={onChanged}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function TemplateSuggestions({ dialogRef }: { dialogRef?: React.RefObject<CreateGoalDialogRef | null> }) {
  const categories: Array<{ icon: string; title: string; color: string; items: string[] }> = [
    {
      icon: "🏃‍♂️",
      title: "Fitness Goals",
      color: "from-orange-50 to-orange-100/50",
      items: [
        "Run a 5K / Half Marathon",
        "Walk 10,000 steps daily",
        "Exercise 3–5 times per week",
        "Go to the gym X times per week",
      ],
    },
    {
      icon: "⚖️",
      title: "Health & Weight Goals",
      color: "from-blue-50 to-blue-100/50",
      items: [
        "Lose 5–10 pounds in a month",
        "Limit alcohol or caffeine intake",
        "Sleep 7–8 hours nightly",
        "Reduce screen time before bed",
      ],
    },
    {
      icon: "💰",
      title: "Financial & Habit Goals",
      color: "from-green-50 to-green-100/50",
      items: [
        "Save $500–$1000/month",
        "Pay off credit card debt",
        "Invest consistently (e.g., weekly or monthly)",
        "Avoid impulse purchases / eating out",
      ],
    },
    {
      icon: "⏰",
      title: "Productivity & Lifestyle Goals",
      color: "from-purple-50 to-purple-100/50",
      items: [
        "Wake up before 6 or 7 a.m.",
        "Spend less time on social media",
        "Complete a side project or content goal (e.g., post weekly, start a YouTube channel)",
      ],
    },
  ];

  function handleTemplateClick(item: string) {
    if (dialogRef?.current?.openWithTitle) {
      dialogRef.current.openWithTitle(item);
    }
  }

  return (
    <div className="mt-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-semibold mb-3">Get Started with Templates</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className={`rounded-lg border border-gray-200/80 bg-gradient-to-br ${cat.color} p-4 hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{cat.icon}</span>
              <h4 className="font-semibold text-sm sm:text-base text-gray-900">{cat.title}</h4>
            </div>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <button
                  key={item}
                  onClick={() => handleTemplateClick(item)}
                  className="w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm transition-all duration-150 border border-gray-200/50 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex-1 text-left line-clamp-2">{item}</span>
                    <span className="text-xs shrink-0 ml-2 mt-0.5">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-900">
          <span className="font-semibold">Tip:</span> Click any template to auto-load it into the Create Goal form. Then just add the amount and deadline!
        </p>
      </div>
    </div>
  );
}

function CommunityChallengesView({ userAddress, refreshKey }: { userAddress: `0x${string}`; refreshKey?: number }) {
  // Fetch next challenge ID to know how many challenges exist
  const { data: nextChallengeId, refetch: refetchNextId } = useReadContract({
    address: GOAL_PLEDGE_ESCROW_ADDRESS,
    abi: goalPledgeEscrowAbi,
    functionName: "nextChallengeId",
  });

  // Fetch all challenges
  const challengeIds = useMemo(() => {
    if (!nextChallengeId || nextChallengeId === 0n) return [];
    const ids: bigint[] = [];
    for (let i = 1n; i < nextChallengeId; i++) {
      ids.push(i);
    }
    return ids;
  }, [nextChallengeId]);

  const { data: challengesData, refetch: refetchChallenges } = useReadContracts({
    contracts: challengeIds.map((id) => ({
      address: GOAL_PLEDGE_ESCROW_ADDRESS,
      abi: goalPledgeEscrowAbi,
      functionName: "getChallenge",
      args: [id],
    })),
    query: { enabled: challengeIds.length > 0 },
  });

  // Fetch user's challenge IDs to check which ones they've joined
  const { data: userChallengeIds, refetch: refetchUserChallenges } = useReadContract({
    address: GOAL_PLEDGE_ESCROW_ADDRESS,
    abi: goalPledgeEscrowAbi,
    functionName: "getUserChallenges",
    args: [userAddress],
    query: { enabled: !!userAddress },
  });

  const userChallengeSet = useMemo(() => {
    return new Set((userChallengeIds as bigint[] | undefined)?.map(id => id.toString()) || []);
  }, [userChallengeIds]);

  // Refetch when refreshKey changes (after new challenge created)
  useEffect(() => {
    refetchNextId();
    refetchChallenges();
    refetchUserChallenges();
  }, [refreshKey, refetchNextId, refetchChallenges, refetchUserChallenges]);

  // Process challenges - filter to show challenges that haven't started yet
  const availableChallenges = useMemo(() => {
    const challenges: ChallengeWithId[] = [];
    const now = BigInt(Math.floor(Date.now() / 1000));

    challengeIds.forEach((id, index) => {
      const result = challengesData?.[index];
      if (result && result.status === 'success') {
        const challenge = result.result as unknown as ChallengeData;
        
        // Show challenges that haven't started yet and the user hasn't joined
        // Include both challenges from others and the user's own created challenges
        if (challenge.startTime > now &&
            !userChallengeSet.has(id.toString())) {
          challenges.push({ ...challenge, id });
        }
      }
    });

    // Sort by start time
    challenges.sort((a, b) => Number(a.startTime) - Number(b.startTime));
    return challenges;
  }, [challengesData, challengeIds, userChallengeSet]);

  if (!challengesData || availableChallenges.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No challenges available to join right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {availableChallenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id.toString()}
          challengeId={challenge.id}
          challenge={challenge}
        />
      ))}
    </div>
  );
}

function ChallengeCard({ challengeId, challenge }: { challengeId: bigint; challenge: ChallengeData; }) {
  const { writeContractAsync, isPending } = useWriteContract();
  const [showCelebration, setShowCelebration] = useState(false);
  
  const startDate = new Date(Number(challenge.startTime) * 1000);
  const endDate = new Date(Number(challenge.deadline) * 1000);
  const entryFeeFormatted = formatUnits(challenge.entryFee, USDC_DECIMALS);

  async function handleJoin() {
    try {
      await writeContractAsync({
        address: GOAL_PLEDGE_ESCROW_ADDRESS,
        abi: goalPledgeEscrowAbi,
        functionName: "joinChallenge",
        args: [challengeId],
      });
      setShowCelebration(true);
    } catch (error) {
      console.error("Error joining challenge:", error);
      alert("Failed to join challenge. Please try again.");
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Challenge Title */}
              <div className="flex items-start gap-2 mb-2">
                <Zap className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">
                    {challenge.description}
                  </CardTitle>
                </div>
              </div>

              {/* Goal Description */}
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                {challenge.goal}
              </p>

              {/* Info Row 1: Entry Fee & Participants */}
              <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground mb-2">
                <span className="font-medium text-gray-700">
                  Entry: <span className="font-semibold text-gray-900">${entryFeeFormatted} USDC</span>
                </span>
                <span>•</span>
                <span>
                  <span className="font-semibold text-gray-900">{challenge.totalParticipants.toString()}</span> participants
                </span>
              </div>

              {/* Info Row 2: Date Range */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>
                  {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span>→</span>
                <span>
                  {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Join Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleJoin}
                disabled={isPending}
                size="sm"
                className="gap-2 whitespace-nowrap"
              >
                <Zap className="h-4 w-4" />
                {isPending ? "Joining..." : "Join Challenge"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Celebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="Challenge Joined! ⚡"
        subtitle="You're in the race - go crush it!"
        icon="zap"
        duration={3000}
      />
    </>
  );
}

