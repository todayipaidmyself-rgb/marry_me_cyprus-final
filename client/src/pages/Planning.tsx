import Navigation from "@/components/Navigation";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { CheckCircle2, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

// Define timeframe order for consistent display
const TIMEFRAME_ORDER = [
  "12+ months",
  "9–12 months",
  "6–9 months",
  "3–6 months",
  "1–3 months",
  "Final month",
  "Wedding week",
];

export default function Planning() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } =
    trpc.profile.get.useQuery(undefined, {
      enabled: !!user,
    });

  const {
    data: tasks,
    isLoading: tasksLoading,
    refetch,
  } = trpc.planning.getTasks.useQuery(undefined, {
    enabled: !!user,
  });

  const initializeTasks = trpc.planning.initializeTasks.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const toggleTask = trpc.planning.toggleTask.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Auto-initialize tasks if user has profile but no tasks
  useEffect(() => {
    if (
      user &&
      profile &&
      tasks &&
      tasks.length === 0 &&
      !initializeTasks.isPending
    ) {
      initializeTasks.mutate();
    }
  }, [user, profile, tasks]);

  // Loading state
  if (authLoading || profileLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-32 container">
          <p className="font-sans text-center text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-32 container max-w-2xl">
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="font-serif text-3xl mb-4">
                Welcome to Your Planning Hub
              </h2>
              <p className="font-sans text-gray-300 mb-8">
                Sign in to access your personalized checklist
              </p>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-[#C6B4AB] hover:bg-[#B5A49B] text-black font-sans tracking-wider uppercase px-10 py-6"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No profile yet - show onboarding prompt
  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <Navigation />
        <div className="pt-32 pb-16 container max-w-3xl">
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-[#C6B4AB]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-[#C6B4AB]" size={40} />
              </div>
              <CardTitle className="font-serif text-4xl md:text-5xl text-white mb-4">
                Let's Set Up Your Details First
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg font-sans">
                Complete your wedding profile to unlock your personalized
                planning checklist
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-12">
              <Link href="/onboarding-full">
                <Button
                  size="lg"
                  className="bg-[#C6B4AB] hover:bg-[#B5A49B] text-black font-sans tracking-wider uppercase px-12 py-6 text-base"
                >
                  Start Setup
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate progress
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.isCompleted).length || 0;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by timeframe
  const tasksByTimeframe = tasks?.reduce(
    (acc, task) => {
      if (!acc[task.timeframe]) {
        acc[task.timeframe] = [];
      }
      acc[task.timeframe].push(task);
      return acc;
    },
    {} as Record<string, typeof tasks>
  );

  const handleToggleTask = (taskId: number) => {
    toggleTask.mutate({ taskId });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />

      <div className="pt-32 pb-16 container max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-4 tracking-tight">
            Planning Checklist
          </h1>
          <p className="text-xl text-gray-300 font-sans mb-8">
            Your personalised to-do list leading up to your Cyprus wedding
          </p>

          {/* Progress Section */}
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#C6B4AB]" size={28} />
                  <span className="font-sans text-lg">
                    You've completed{" "}
                    <span className="font-bold text-[#C6B4AB]">
                      {completedTasks}
                    </span>{" "}
                    of <span className="font-bold">{totalTasks}</span> tasks
                  </span>
                </div>
                <span className="font-serif text-2xl text-[#C6B4AB]">
                  {progressPercentage}%
                </span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-3 bg-white/10"
              />
            </CardContent>
          </Card>
        </div>

        {/* Tasks by Timeframe */}
        <div className="space-y-12">
          {TIMEFRAME_ORDER.map(timeframe => {
            const timeframeTasks = tasksByTimeframe?.[timeframe] || [];

            if (timeframeTasks.length === 0) return null;

            const completedInTimeframe = timeframeTasks.filter(
              t => t.isCompleted
            ).length;
            const totalInTimeframe = timeframeTasks.length;

            return (
              <div key={timeframe}>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-serif text-3xl md:text-4xl text-white">
                      {timeframe}
                    </h2>
                    <span className="text-sm text-gray-400 font-sans">
                      {completedInTimeframe}/{totalInTimeframe} completed
                    </span>
                  </div>
                  <div className="h-px bg-[#C6B4AB]/30 w-full"></div>
                </div>

                <div className="grid gap-4">
                  {timeframeTasks
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(task => (
                      <Card
                        key={task.id}
                        className={`bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer ${
                          task.isCompleted ? "opacity-60" : ""
                        }`}
                        onClick={() => handleToggleTask(task.id)}
                      >
                        <CardContent className="pt-6 pb-6">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              id={`task-${task.id}`}
                              checked={task.isCompleted}
                              onCheckedChange={() => handleToggleTask(task.id)}
                              className="border-[#C6B4AB] data-[state=checked]:bg-[#C6B4AB] data-[state=checked]:border-[#C6B4AB] mt-1"
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`task-${task.id}`}
                                className={`font-sans text-lg cursor-pointer transition-all block ${
                                  task.isCompleted
                                    ? "line-through text-gray-500"
                                    : "text-white"
                                }`}
                              >
                                {task.title}
                              </label>
                              {task.description && (
                                <p
                                  className={`font-sans text-sm mt-1 ${
                                    task.isCompleted
                                      ? "text-gray-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dossier Library Section */}
        <div className="mt-16">
          <Card className="bg-white/5 border-[#C6B4AB]/20 backdrop-blur-sm">
            <CardContent className="py-10 px-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-serif text-2xl md:text-3xl mb-3 text-white">
                    Dossier Library
                  </h3>
                  <p className="font-sans text-white/70 leading-relaxed mb-4">
                    Access curated venue guides, planning dossiers, décor
                    lookbooks, and essential resources to help you plan every
                    detail of your Cyprus wedding.
                  </p>
                  <Link href="/dossiers">
                    <Button className="bg-[#C6B4AB] hover:bg-[#B5A49B] text-black font-sans tracking-wider uppercase">
                      Browse Dossiers
                    </Button>
                  </Link>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-[#C6B4AB]/20 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-[#C6B4AB]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-[#C6B4AB]/10 to-[#C6B4AB]/5 border-[#C6B4AB]/30 backdrop-blur-sm">
            <CardContent className="py-12">
              <h3 className="font-serif text-3xl md:text-4xl mb-4 text-white">
                Need Help Staying on Track?
              </h3>
              <p className="font-sans text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                Our expert wedding planners can guide you through every step and
                ensure nothing is missed
              </p>
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-[#C6B4AB] hover:bg-[#B5A49B] text-black font-sans tracking-wider uppercase px-10 py-6"
                >
                  Contact Your Planner
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
