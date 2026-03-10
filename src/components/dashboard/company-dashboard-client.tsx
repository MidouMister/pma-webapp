"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  FolderKanban, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Plus,
  Settings,
  CreditCard,
  AlertTriangle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { CompanyDashboardData } from "@/lib/types";

interface CompanyDashboardClientProps {
  data: {
    company: CompanyDashboardData;
    stats: {
      totalUnits: number;
      totalProjects: number;
      totalMembers: number;
    };
    subscription: CompanyDashboardData["subscriptions"][number] | null;
  };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export function CompanyDashboardClient({ data }: CompanyDashboardClientProps) {
  const { company, stats, subscription } = data;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Subscription Warnings */}
      {subscription?.plan && (
        <div className="space-y-4">
          {(subscription.plan.maxUnits && stats.totalUnits >= subscription.plan.maxUnits * 0.8) ||
          (subscription.plan.maxProjects && stats.totalProjects >= subscription.plan.maxProjects * 0.8) ||
          (subscription.plan.maxMembers && stats.totalMembers >= subscription.plan.maxMembers * 0.8) ? (
            <motion.div variants={item}>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-4 text-amber-500">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="flex-1 text-sm">
                  <span className="font-semibold">Plan Limit Warning:</span> You are approaching your plan limits. 
                  View your <Link href={`/company/${company.id}/settings/billing`} className="underline font-medium hover:text-amber-400">billing dashboard</Link> to upgrade.
                </div>
              </div>
            </motion.div>
          ) : null}
          
          {new Date(subscription.endAt).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 && (
            <motion.div variants={item}>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4 text-primary">
                <CreditCard className="h-5 w-5 shrink-0" />
                <div className="flex-1 text-sm">
                  <span className="font-semibold">Subscription Renewal:</span> Your plan expires in less than 7 days.
                  Ensure your next payment is processed to avoid service interruption.
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <motion.div variants={item} className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            {company.name}
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Admin Control Panel</span>
            <Badge variant="outline" className="ml-2 bg-primary/5 text-primary border-primary/20">
              {subscription?.plan?.name || "No Plan"}
            </Badge>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="flex gap-3">
          <Button asChild variant="outline" className="glass-morphism">
            <Link href={`/company/${company.id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Unit
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Units",
            value: stats.totalUnits,
            description: "Active business silos",
            icon: Building2,
          },
          {
            title: "Total Projects",
            value: stats.totalProjects,
            description: "Across all units",
            icon: FolderKanban,
          },
          {
            title: "Total Members",
            value: stats.totalMembers,
            description: "Active collaborators",
            icon: Users,
          },
          {
            title: "Subscription",
            value: subscription?.active ? "Active" : "Inactive",
            description: subscription ? `Expires ${formatDate(subscription.endAt)}` : "No active subscription",
            icon: CreditCard,
          },
        ].map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="glass-morphism border-white/5 bg-white/2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Units Table / List */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Operational Units</h3>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View all units
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {company.units.map((unit) => (
            <motion.div 
              key={unit.id} 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="group overflow-hidden glass-morphism border-white/5 transition-all hover:bg-white/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{unit.name}</CardTitle>
                    <div className="rounded-full bg-primary/10 p-2 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  <CardDescription className="line-clamp-1">
                    {unit.address || "No address provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Projects</p>
                      <p className="text-sm font-medium">{unit._count.projects}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="text-sm font-medium">{unit._count.users}</p>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary/50 to-transparent transition-all group-hover:h-1.5" />
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Placeholder */}
      <motion.div variants={item}>
        <Card className="glass-morphism border-white/5">
          <CardHeader>
            <CardTitle>Recent Company Activity</CardTitle>
            <CardDescription>
              Monitor changes and audit logs across your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-8 w-8 opacity-20" />
              <p>Activity logs will appear here once units begin operations.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
