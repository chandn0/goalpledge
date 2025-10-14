"use client";
import { useMemo} from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { goalPledgeEscrowAbi } from "../lib/abi";
import {
  BASE_SEPOLIA_CHAIN_ID,
  GOAL_PLEDGE_ESCROW_ADDRESS,
  USDC_DECIMALS,
} from "../lib/contracts";
import { formatUnits } from "viem";
import { getLocalMeta } from "../lib/localMeta";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GoalActions from "./GoalActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";

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

export default function GoalsList({ refreshKey }: { refreshKey?: number }) {
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
    () => getLocalMeta(BASE_SEPOLIA_CHAIN_ID, GOAL_PLEDGE_ESCROW_ADDRESS),
    [],
  );

  const { upcomingGoals, completedGoals, missedGoals } = useMemo(() => {
    const upcoming: GoalWithId[] = [];
    const completed: GoalWithId[] = [];
    const missed: GoalWithId[] = [];

    if (!goalsData) {
      return { upcomingGoals: upcoming, completedGoals: completed, missedGoals: missed };
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
        } else if (!goal.completed && isPastDeadline) {
          missed.push(goalWithId);
        }
      }
    });

    upcoming.sort((a, b) => Number(a.deadline) - Number(b.deadline));

    return { upcomingGoals: upcoming, completedGoals: completed, missedGoals: missed };
  }, [goalsData, ids]);


  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">My Goals</h2>
        {!address && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Connect your wallet to view your goals.
              </p>
            </CardContent>
          </Card>
        )}
        {address && chainId !== BASE_SEPOLIA_CHAIN_ID && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Please switch to Base Sepolia network.
              </p>
            </CardContent>
          </Card>
        )}
        {address && chainId === BASE_SEPOLIA_CHAIN_ID && (
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="rounded-md bg-gray-100 p-1">
              <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-white data-[state=active]:shadow-none">Upcoming</TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:shadow-none">Completed</TabsTrigger>
                <TabsTrigger value="missed" className="data-[state=active]:bg-white data-[state=active]:shadow-none">Missed</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="upcoming">
              <GoalCategoryList goals={upcomingGoals} metas={metas} refetch={refetch} view="list" />
            </TabsContent>
            <TabsContent value="completed">
              <GoalCategoryList goals={completedGoals} metas={metas} refetch={refetch} view="card" />
            </TabsContent>
            <TabsContent value="missed">
              <GoalCategoryList goals={missedGoals} metas={metas} refetch={refetch} view="card" />
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
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
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
    
    async function doMarkComplete() {
        await writeContractAsync({
            address: GOAL_PLEDGE_ESCROW_ADDRESS,
            abi: goalPledgeEscrowAbi,
            functionName: "markComplete",
            args: [goalId],
        });
        onChanged?.();
    }

    return (
        <div className="flex items-center p-3 rounded-lg bg-white shadow-sm border border-gray-200">
            <button onClick={doMarkComplete} disabled={isPending} className="mr-4">
                <CheckCircle className={`h-6 w-6 ${isPending ? 'text-gray-400' : 'text-gray-300 hover:text-green-500'} transition-colors`} />
            </button>
            <div className="flex-1 flex justify-between items-center">
                <p className="font-medium">{description || title || `Goal #${goalId.toString()}`}</p>
                <p className="text-sm text-muted-foreground">
                    ${formatUnits(goalData.amount, USDC_DECIMALS)} USDC
                </p>
            </div>
        </div>
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
              <CardTitle className="text-lg truncate">
                {description || title || `Goal #${goalId.toString()}`}
              </CardTitle>
              <Badge variant={statusInfo.variant} className="shrink-0">
                {statusInfo.text}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">
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


