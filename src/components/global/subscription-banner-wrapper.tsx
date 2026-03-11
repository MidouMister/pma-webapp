"use client";

import { useUser } from "@clerk/nextjs";
import { getCurrentUserSubscriptionStatus } from "@/lib/queries";
import { SubscriptionWarningBanner } from "@/components/global/subscription-warning-banner";
import { useEffect, useState } from "react";

interface SubscriptionData {
  daysRemaining: number | null;
  isGracePeriod: boolean;
  isBlocked: boolean;
  status: "ACTIVE" | "GRACE_PERIOD" | "BLOCKED" | "NONE";
  companyId: string;
}

export function SubscriptionBannerWrapper() {
  const { user: clerkUser, isLoaded } = useUser();
  const [data, setData] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!clerkUser || !isLoaded) return;

      // Call server action to get subscription status
      const status = await getCurrentUserSubscriptionStatus();

      if (!status || !status.companyId) return;

      setData({
        daysRemaining: status.daysRemaining,
        isGracePeriod: status.isGracePeriod,
        isBlocked: status.isBlocked,
        status: status.status,
        companyId: status.companyId,
      });
    }

    fetchSubscriptionStatus();
  }, [clerkUser, isLoaded]);

  if (!data) return null;

  return (
    <SubscriptionWarningBanner
      daysRemaining={data.daysRemaining}
      isGracePeriod={data.isGracePeriod}
      isBlocked={data.isBlocked}
      subscriptionStatus={data.status}
      companyId={data.companyId}
    />
  );
}
