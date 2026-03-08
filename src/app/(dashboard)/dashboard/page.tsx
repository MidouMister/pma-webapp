"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome back, {user?.firstName || "there"}
        </h1>
        <p className="text-muted-foreground">
          Here is what&apos;s happening in your projects today.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/40 bg-card/40 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all hover:bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Metric {i}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Value {i * 123}</div>
              <p className="text-xs text-green-500 mt-1">
                +12% from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-border/40 rounded-xl text-muted-foreground">
              Charts and activity feed will be implemented in future milestones.
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-border/40 rounded-xl text-muted-foreground">
              Action buttons here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
