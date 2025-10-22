"use client";
import { useEffect, useState, useRef } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Target, CheckCircle2, Zap, Users, Gift, ArrowRight, Sparkles } from "lucide-react";
import { useAccount } from "wagmi";
import CreateGoalDialog, { CreateGoalDialogRef } from "./components/CreateGoalDialog";
import GoalsList from "./components/GoalsList";
// import TotalPledgeCard from "./components/TotalPledgeCard";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { address, isConnected } = useAccount();
  const dialogRef = useRef<CreateGoalDialogRef>(null);

  useEffect(() => {
    // Signal readiness to the Farcaster Mini App SDK once the app mounts
    sdk.actions.ready();
  }, []);

  // Landing page for non-authenticated users
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse delay-4000"></div>
        </div>

        {/* Landing page content */}
        <main className="w-full mx-auto py-6 px-3 sm:px-6 sm:py-8 max-w-4xl relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-16 mt-8 sm:mt-12">
            {/* Badge */}
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-teal-100 border border-amber-200 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-amber-700 animate-spin" />
                <span className="text-sm font-semibold bg-gradient-to-r from-amber-700 to-teal-700 bg-clip-text text-transparent">Achievement Platform</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-amber-900 via-slate-800 to-teal-900 bg-clip-text text-transparent">
                Hit Your Goal
              </span>
              <span className="block text-gray-900 text-3xl sm:text-5xl md:text-6xl mt-2 font-bold">
                or Lose Your Stake
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2 font-medium">
              Set goals, create challenges, compete with friends, and stay accountable with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-teal-700 font-bold">real USDC stakes</span>.
            </p>
            
            <div className="flex justify-center">
              <Wallet />
            </div>
          </div>

          {/* Features Overview Section */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-8 sm:mb-12 text-center text-gray-900">
              Everything You Need
            </h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Personal Goals Card */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white p-6 sm:p-8 shadow-sm hover:shadow-2xl transition-all duration-300 hover:border-amber-400 bg-gradient-to-br hover:from-amber-50/50 hover:to-white hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:via-amber-500/10 group-hover:to-amber-500/5 transition-all duration-300"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Personal Goals</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Create personal goals with USDC stakes. Complete them to get rewarded, or lose your stake.
                  </p>
                </div>
              </div>

              {/* Group Challenges Card */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white p-6 sm:p-8 shadow-sm hover:shadow-2xl transition-all duration-300 hover:border-teal-400 bg-gradient-to-br hover:from-teal-50/50 hover:to-white hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/0 to-teal-500/0 group-hover:from-teal-500/5 group-hover:via-teal-500/10 group-hover:to-teal-500/5 transition-all duration-300"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Group Challenges</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Create competitive challenges where winners share the losers&apos; stakes. May the best person win!
                  </p>
                </div>
              </div>

              {/* Community Challenges Card */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white p-6 sm:p-8 shadow-sm hover:shadow-2xl transition-all duration-300 hover:border-emerald-400 bg-gradient-to-br hover:from-emerald-50/50 hover:to-white hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-emerald-500/10 group-hover:to-emerald-500/5 transition-all duration-300"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Community Challenges</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Browse and join challenges created by others. Compete in a global community of goal-setters.
                  </p>
                </div>
              </div>

              {/* Friend Beneficiary Card */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white p-6 sm:p-8 shadow-sm hover:shadow-2xl transition-all duration-300 hover:border-cyan-400 bg-gradient-to-br hover:from-cyan-50/50 hover:to-white hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-cyan-500/10 group-hover:to-cyan-500/5 transition-all duration-300"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Friend Beneficiary</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Set a friend&apos;s address to receive your stake if you fail. Support a friend or charity.
                  </p>
                </div>
              </div>

              {/* Real Accountability Card */}
              <div className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-orange-50 to-amber-50 p-6 sm:p-8 shadow-sm hover:shadow-2xl transition-all duration-300 hover:border-orange-400 sm:col-span-2 lg:col-span-2 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:via-orange-500/10 group-hover:to-orange-500/5 transition-all duration-300"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">Real Accountability</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Every goal is backed by real USDC. Complete your goal to recover your stake, or it goes to the community or your chosen beneficiary.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-8 sm:mb-12 text-center text-gray-900">
              Simple 6-Step Process
            </h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { num: "1", title: "Set a Goal", desc: "Decide what you want to achieve" },
                { num: "2", title: "Pick a Deadline", desc: "Choose a date that keeps you focused" },
                { num: "3", title: "Pledge in USDC", desc: "Lock in a real stake to stay serious" },
                { num: "4", title: "Stay Accountable", desc: "Track your progress toward completion" },
                { num: "5", title: "Get Rewarded", desc: "Complete it → Get your USDC back" },
                { num: "6", title: "Community Impact", desc: "Failed stakes support community or beneficiary" },
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur"></div>
                  <div className="relative z-10 bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-100 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-teal-500 flex items-center justify-center mb-3 text-white font-bold text-lg shadow-lg">
                      {step.num}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{step.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Examples Section */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-8 sm:mb-12 text-center text-gray-900">
              Real Use Cases
            </h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="group relative overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 sm:p-8 hover:border-amber-400 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-4 right-4 text-3xl group-hover:scale-125 transition-transform duration-300">💰</div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Personal Goal</h4>
                <p className="text-sm text-gray-700 mb-3 font-medium">&quot;Run 5km every day for 30 days&quot;</p>
                <div className="text-xs text-gray-600">Stake: 50 USDC • Deadline: 30 days</div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100/50 p-6 sm:p-8 hover:border-teal-400 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-4 right-4 text-3xl group-hover:scale-125 transition-transform duration-300">⚡</div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Group Challenge</h4>
                <p className="text-sm text-gray-700 mb-3 font-medium">&quot;100 Days of Fitness - Winners take all!&quot;</p>
                <div className="text-xs text-gray-600">Entry: 25 USDC • 15 participants</div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 sm:p-8 hover:border-emerald-400 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-4 right-4 text-3xl group-hover:scale-125 transition-transform duration-300">📚</div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Personal Goal</h4>
                <p className="text-sm text-gray-700 mb-3 font-medium">&quot;Finish reading 3 books this month&quot;</p>
                <div className="text-xs text-gray-600">Stake: 30 USDC • Deadline: 30 days</div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50 p-6 sm:p-8 hover:border-cyan-400 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-4 right-4 text-3xl group-hover:scale-125 transition-transform duration-300">👥</div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Community Challenge</h4>
                <p className="text-sm text-gray-700 mb-3 font-medium">&quot;Join your friend&apos;s meditation challenge&quot;</p>
                <div className="text-xs text-gray-600">Entry: 20 USDC • Open to community</div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-8 sm:mb-12 text-center text-gray-900">
              Why GoalPledge?
            </h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 sm:p-8 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-4" />
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Real Stakes</h4>
                  <p className="text-sm text-gray-600">USDC locked on blockchain = actual motivation</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100/50 p-6 sm:p-8 hover:border-teal-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative">
                  <Users className="h-8 w-8 text-teal-600 mb-4" />
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Community Driven</h4>
                  <p className="text-sm text-gray-600">Compete with others, share your journey</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 sm:p-8 hover:border-amber-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative">
                  <Target className="h-8 w-8 text-amber-600 mb-4" />
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Flexible</h4>
                  <p className="text-sm text-gray-600">Choose durations, amounts, and stakes</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 sm:p-8 hover:border-orange-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative">
                  <Gift className="h-8 w-8 text-orange-600 mb-4" />
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Give Back</h4>
                  <p className="text-sm text-gray-600">Support friends or charities with failed stakes</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center mb-6 sm:mb-0">
            <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-amber-700 to-teal-700 shadow-2xl">
              <div className="absolute inset-0 opacity-15">
                <div className="absolute top-0 right-10 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-10 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black mb-4 text-white">Start Your Journey</h2>
                <p className="text-lg sm:text-xl text-amber-50 mb-3 max-w-xl mx-auto">
                  Stop planning — start proving.
                </p>
                <p className="text-base sm:text-lg text-amber-50 mb-8 max-w-xl mx-auto font-medium">
                  Create your first goal, challenge, or join the community today.
                </p>
                <div className="flex justify-center">
                  <Wallet />
                </div>
              </div>
            </div>
          </section>

          {/* Footer Links */}
          <div className="mt-12 text-center space-x-6 text-sm">
            <a href="https://github.com/chandn0/goalpledge" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-700 hover:text-amber-700 transition-colors font-medium group">
              GitHub <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <span className="text-gray-300">•</span>
            <a href="https://basescan.org/address/0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519#code" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-700 hover:text-amber-700 transition-colors font-medium group">
              View Contract <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </main>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first header */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-200">
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
        {/* <TotalPledgeCard refreshKey={refreshKey} /> */}

        {/* Goals list */}
        <GoalsList refreshKey={refreshKey} dialogRef={dialogRef} />
        
        {/* Create goal button - positioned for mobile */}
        <CreateGoalDialog ref={dialogRef} onCreated={() => setRefreshKey((k) => k + 1)} />
      </main>
    </div>
  );
}
