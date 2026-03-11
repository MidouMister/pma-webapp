"use client";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  FolderKanban, 
  Users, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Zap,
  Sparkles,
  Lock,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatAmount, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { BillingData } from "@/lib/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { UpgradeRequestForm } from "@/components/forms/upgrade-request-form";

interface BillingClientProps {
  data: BillingData;
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function BillingClient({ data }: BillingClientProps) {
  const { company, subscription, plans, usage, daysRemaining, isGracePeriod, isBlocked, subscriptionStatus } = data;
  const currentPlan = subscription?.plan;
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{id: string, name: string} | null>(null);

  const handleUpgradeClick = (plan: {id: string, name: string}) => {
    setSelectedPlan(plan);
    setIsUpgradeOpen(true);
  };

  const usageStats = [
    {
      title: "Operational Units",
      count: usage.units,
      max: currentPlan?.maxUnits,
      icon: Building2,
      suffix: "/ " + (currentPlan?.maxUnits || "∞"),
    },
    {
      title: "Active Projects",
      count: usage.projects,
      max: currentPlan?.maxProjects,
      icon: FolderKanban,
      suffix: "/ " + (currentPlan?.maxProjects || "∞"),
    },
    {
      title: "Team Members",
      count: usage.members,
      max: currentPlan?.maxMembers,
      icon: Users,
      suffix: "/ " + (currentPlan?.maxMembers || "∞"),
    },
    {
      title: "Tasks (Aggregate)",
      count: usage.tasks,
      max: null, // Usually per project, but shown here for overview
      icon: Zap,
      suffix: "",
    },
  ];

  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Current Plan Overview */}
        <motion.div variants={item}>
          <Card className={cn(
            "glass-morphism border shadow-2xl overflow-hidden relative transition-all duration-500",
            isBlocked 
              ? "border-rose-500/30 bg-rose-500/5" 
              : isGracePeriod 
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-primary/20 bg-primary/5"
          )}>
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>

            {/* Countdown Timer Section */}
            {subscriptionStatus !== "NONE" && (
              <div className={cn(
                "px-8 py-4 border-b backdrop-blur-sm",
                isBlocked 
                  ? "bg-rose-500/10 border-rose-500/20" 
                  : isGracePeriod 
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-primary/10 border-primary/20"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isBlocked ? (
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-rose-500" />
                      </div>
                    ) : isGracePeriod ? (
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </div>
                    ) : daysRemaining !== null ? (
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                    ) : null}
                    
                    <div>
                      {isBlocked ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-rose-500">Account Locked</span>
                          <Badge className="bg-rose-500 text-white border-rose-500 px-2 py-0.5 text-xs font-bold tracking-wider">
                            READ-ONLY MODE
                          </Badge>
                        </div>
                      ) : isGracePeriod ? (
                        <span className="text-lg font-bold text-amber-500">
                          {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining in grace period
                        </span>
                      ) : daysRemaining !== null ? (
                        <span className="text-lg font-semibold text-foreground">
                          {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                        </span>
                      ) : null}
                      <p className="text-sm text-muted-foreground">
                        {isBlocked 
                          ? "Your account has been locked due to payment issues. Contact billing to restore full access."
                          : isGracePeriod 
                            ? "Your subscription has expired. Renew now to avoid service interruption."
                            : "Your subscription is active and in good standing."
                        }
                      </p>
                    </div>
                  </div>
                  
                  {subscription && !isBlocked && (
                    <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Renews on {formatDate(subscription.endAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <CardHeader className="pb-8 pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">Current Plan: {currentPlan?.name || "No Plan"}</CardTitle>
                  <CardDescription>
                    Your subscription is {subscriptionStatus === "ACTIVE" ? (
                      <span className="text-emerald-500 font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : subscriptionStatus === "GRACE_PERIOD" ? (
                      <span className="text-amber-500 font-medium inline-flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Grace Period
                      </span>
                    ) : subscriptionStatus === "BLOCKED" ? (
                      <span className="text-rose-500 font-medium inline-flex items-center gap-1">
                        <Lock className="w-4 h-4" /> Blocked
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-medium inline-flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> No Active Subscription
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={cn(
                  "py-1 px-3",
                  isBlocked 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500" 
                    : isGracePeriod 
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      : "bg-primary/10 border-primary/30 text-primary"
                )}>
                  {subscription ? (
                    subscription.price === 0 ? "Free Trial" : "Business Account"
                  ) : (
                    "Basic"
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {usageStats.map((stat) => {
                  const percentage = stat.max ? Math.min((stat.count / stat.max) * 100, 100) : 0;
                  const isWarning = percentage > 80;
                  const isDanger = percentage === 100;

                  return (
                    <div key={stat.title} className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <stat.icon className="w-4 h-4" />
                          <span>{stat.title}</span>
                        </div>
                        <span className="font-semibold">
                          {stat.count} <span className="text-muted-foreground font-normal">{stat.suffix}</span>
                        </span>
                      </div>
                      {stat.max && (
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isBlocked 
                                ? "bg-rose-500" 
                                : isDanger 
                                  ? "bg-rose-500" 
                                  : isWarning 
                                    ? "bg-amber-500" 
                                    : "bg-primary"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
            {subscription && !isBlocked && (
              <CardFooter className={cn(
                "border-t p-4 flex items-center justify-between",
                isGracePeriod ? "bg-amber-500/5 border-amber-500/20" : "bg-white/5 border-white/5"
              )}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Renews on {formatDate(subscription.endAt)}</span>
                </div>
                <div className="text-sm font-semibold">
                  {formatAmount(subscription.price || 0)} / month
                </div>
              </CardFooter>
            )}
          </Card>
        </motion.div>

        {/* Plans Comparison */}
        <motion.div variants={item} className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight">Available Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan?.id;
              
              return (
                <Card 
                  key={plan.id} 
                  className={cn(
                    "relative glass-morphism flex flex-col h-full transition-all hover:border-primary/40 group",
                    isCurrent ? "border-primary bg-primary/2" : "border-white/5"
                  )}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-0.5">Your Plan</Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold">{formatAmount(plan.monthlyCost)}</span>
                      <span className="text-muted-foreground text-sm">/ month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-4 text-sm">
                      {[
                        { label: "Operational Units", value: plan.maxUnits },
                        { label: "Active Projects", value: plan.maxProjects },
                        { label: "Members", value: plan.maxMembers },
                        { label: "Tasks per Project", value: plan.maxTasksPerProject },
                      ].map((feature) => (
                        <li key={feature.label} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">
                            {feature.value === null ? "Unlimited" : `Up to ${feature.value}`} {feature.label}
                          </span>
                        </li>
                      ))}
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">Priority Email Support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={isCurrent ? "secondary" : "outline"} 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      disabled={isCurrent}
                      onClick={() => handleUpgradeClick({ id: plan.id, name: plan.name })}
                    >
                      {isCurrent ? (
                        "Current Plan"
                      ) : (
                        <>
                          Upgrade Plan
                          <ArrowUpRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Payment Information Notice */}
        <motion.div variants={item}>
          <div className="rounded-2xl border border-white/5 bg-white/2 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-semibold text-lg underline decoration-amber-500/30 underline-offset-4">Important Payment Information</h4>
              <p className="text-muted-foreground text-sm">
                We currently accept offline payments via bank transfer, check, or contract. To upgrade your plan, please click the upgrade button above to request a quote. Our billing team will contact you within 24 hours with payment details.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="shrink-0 glass-morphism border-white/10 hover:bg-white/5 ml-auto gap-2"
              onClick={() => handleUpgradeClick(plans[plans.length - 1])} // Pick highest plan by default for general contact
            >
              Contact Billing
            </Button>
          </div>
        </motion.div>
      </motion.div>

      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="glass-morphism border-white/10 sm:max-w-[600px] overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -translate-y-1/4 translate-x-1/4">
            <Sparkles className="w-64 h-64 text-primary" />
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Request {selectedPlan?.name} Upgrade
            </DialogTitle>
            <DialogDescription>
              Submit your request and our billing team will contact you with an invoice and payment details for Algerian B2B processing.
            </DialogDescription>
          </DialogHeader>

          <UpgradeRequestForm 
            companyId={company.id}
            plans={plans}
            selectedPlanId={selectedPlan?.name || ""}
            initialData={{
              companyName: company.name,
              email: company.companyEmail || "",
            }}
            onSuccess={() => setIsUpgradeOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

