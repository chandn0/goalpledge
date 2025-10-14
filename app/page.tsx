"use client";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Target, CheckCircle2 } from "lucide-react";
import { useAccount } from "wagmi";
import CreateGoalDialog from "./components/CreateGoalDialog";
import GoalsList from "./components/GoalsList";
import TotalPledgeCard from "./components/TotalPledgeCard";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Signal readiness to the Farcaster Mini App SDK once the app mounts
    sdk.actions.ready();
  }, []);

  // Landing page for non-authenticated users
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-background">
        {/* Landing page content */}
        <main className="w-full mx-auto py-6 px-3 sm:px-6 sm:py-8 max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 mt-8 sm:mt-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hit Your Goal
              </span>
              <span className="block text-gray-900 text-3xl sm:text-4xl md:text-5xl mt-2">
                or Lose Your Stake 
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              Set a goal, choose a deadline, and pledge USDC to keep yourself accountable.
            </p>
            <div className="flex justify-center">
              <Wallet />
            </div>
          </div>

          {/* How It Works Section */}
          <section className="mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">How It Works</h3>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-4 sm:p-6">
                <div className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">1. Set a Goal</div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Decide what you want to achieve — fitness, learning, habit-building, anything.
                </p>
              </Card>
              <Card className="p-4 sm:p-6">
                <div className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">2. Pick a Deadline</div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Choose a date that keeps you focused.
                </p>
              </Card>
              <Card className="p-4 sm:p-6">
                <div className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">3. Pledge in USDC</div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Lock in a small stake to stay serious.
                </p>
              </Card>
              <Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-2">
                <div className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">4. Get Rewarded</div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm sm:text-base">
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    Complete it → get your USDC back
                  </span>
                  <span className="text-red-600 flex items-center gap-2">
                    <span className="text-red-600 text-lg leading-none">×</span>
                    Fail → lose your stake
                  </span>
                </div>
              </Card>
            </div>
          </section>

          {/* Examples Section */}
          <section className="mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center"> Examples</h3>
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              <Card className="p-3 sm:p-4 border-l-4 border-l-primary">
                <p className="text-sm sm:text-base font-medium">&quot;Run 5km every day for 30 days&quot;</p>
              </Card>
              <Card className="p-3 sm:p-4 border-l-4 border-l-purple-600">
                <p className="text-sm sm:text-base font-medium">&quot;Finish reading 3 books this month&quot;</p>
              </Card>
              <Card className="p-3 sm:p-4 border-l-4 border-l-blue-600">
                <p className="text-sm sm:text-base font-medium">&quot;Lose 3kg by November 30&quot;</p>
              </Card>
              <Card className="p-3 sm:p-4 border-l-4 border-l-green-600">
                <p className="text-sm sm:text-base font-medium">&quot;Write my app MVP by next week&quot;</p>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center mb-6 sm:mb-0">
            <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg p-5 sm:p-8 border-1 border-primary/20">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Start Now</h3>
              <p className="text-base sm:text-lg mb-1 sm:mb-2">Stop planning — start proving.</p>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Set your goal today and stake your USDC.</p>
              <div className="flex justify-center">
                <Wallet />
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first header */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">GoalPledge</h1>
          </div>
          <Wallet />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4 sm:px-6">
        {/* here we should show the total pledge amount of the user in all the goals he has created */}
        <TotalPledgeCard refreshKey={refreshKey} />

        {/* Goals list */}
        <GoalsList refreshKey={refreshKey} />
        
        {/* Create goal button - positioned for mobile */}
        <CreateGoalDialog onCreated={() => setRefreshKey((k) => k + 1)} />
      </main>
    </div>
  );
}
