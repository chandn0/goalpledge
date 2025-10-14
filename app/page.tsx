"use client";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Target } from "lucide-react";
import CreateGoalDialog from "./components/CreateGoalDialog";
import GoalsList from "./components/GoalsList";
import TotalPledgeCard from "./components/TotalPledgeCard";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    // Signal readiness to the Farcaster Mini App SDK once the app mounts
    sdk.actions.ready();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
