"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Lock, X, CreditCard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SubscriptionWarningBannerProps {
  daysRemaining: number | null;
  isGracePeriod: boolean;
  isBlocked: boolean;
  subscriptionStatus: "ACTIVE" | "GRACE_PERIOD" | "BLOCKED" | "NONE";
  companyId: string;
}

const DISMISS_KEY = "pma-subscription-banner-dismissed";

export function SubscriptionWarningBanner({
  daysRemaining,
  isGracePeriod,
  isBlocked,
  subscriptionStatus,
  companyId,
}: SubscriptionWarningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`${DISMISS_KEY}-${companyId}`);
    if (dismissed) {
      setIsDismissed(true);
    }
    setIsVisible(true);
  }, [companyId]);

  const handleDismiss = () => {
    localStorage.setItem(`${DISMISS_KEY}-${companyId}`, "true");
    setIsDismissed(true);
  };

  const showBanner =
    isVisible &&
    !isDismissed &&
    (isGracePeriod ||
      isBlocked ||
      (subscriptionStatus === "ACTIVE" &&
        daysRemaining !== null &&
        daysRemaining <= 30 &&
        daysRemaining > 0));

  if (!showBanner) return null;

  const getBannerConfig = () => {
    if (isBlocked) {
      return {
        variant: "blocked" as const,
        icon: Lock,
        title: "Account Locked - Read Only Mode",
        description:
          "Your subscription support to restore has expired. Contact full access.",
        buttonText: "Upgrade Now",
        buttonHref: `/${companyId}/settings/billing`,
        bgGradient:
          "bg-gradient-to-r from-rose-500/10 via-rose-600/10 to-rose-500/10",
        borderColor: "border-rose-500/30",
        iconBg: "bg-rose-500/20",
        iconColor: "text-rose-600 dark:text-rose-400",
      };
    }

    if (isGracePeriod) {
      return {
        variant: "grace" as const,
        icon: AlertTriangle,
        title: `Subscription Expiring in ${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""}`,
        description:
          "Your subscription is about to expire. Upgrade now to avoid read-only mode.",
        buttonText: "Upgrade Now",
        buttonHref: `/${companyId}/settings/billing`,
        bgGradient:
          "bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-500/10",
        borderColor: "border-amber-500/30",
        iconBg: "bg-amber-500/20",
        iconColor: "text-amber-600 dark:text-amber-400",
      };
    }

    return {
      variant: "warning" as const,
      icon: CreditCard,
      title: `Subscription Expires in ${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""}`,
      description: "Consider upgrading your plan to continue using all features.",
      buttonText: "View Plans",
      buttonHref: `/${companyId}/settings/billing`,
      bgGradient:
        "bg-gradient-to-r from-blue-500/8 via-blue-600/8 to-blue-500/8",
      borderColor: "border-blue-500/20",
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-600 dark:text-blue-400",
    };
  };

  const config = getBannerConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden"
      >
        <div
          className={cn(
            "relative mx-4 mt-4 rounded-xl border backdrop-blur-md",
            config.bgGradient,
            config.borderColor
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 dark:from-white/5 dark:to-transparent pointer-events-none" />

          <div className="relative flex items-start gap-4 p-4">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg",
                config.iconBg,
                config.iconColor,
                "p-2"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-semibold text-sm",
                  isBlocked
                    ? "text-rose-700 dark:text-rose-300"
                    : isGracePeriod
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-blue-700 dark:text-blue-300"
                )}
              >
                {config.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {config.description}
              </p>
              <Link
                href={config.buttonHref}
                className="inline-block mt-3"
                onClick={handleDismiss}
              >
                <Button
                  size="sm"
                  className={cn(
                    "h-8 text-xs font-medium transition-all",
                    isBlocked
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : isGracePeriod
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {config.buttonText}
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDismiss}
              className="shrink-0 -mt-1 -mr-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
