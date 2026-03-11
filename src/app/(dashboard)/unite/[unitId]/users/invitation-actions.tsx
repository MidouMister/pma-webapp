"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cancelInvitation, resendInvitation } from "@/lib/queries";
import { Loader2, X, RefreshCw } from "lucide-react";

interface UnitInvitationActionsProps {
  invitationId: string;
  status: string;
}

export function UnitInvitationActions({ invitationId, status }: UnitInvitationActionsProps) {
  const [isPending, setIsPending] = useState(false);
  const [action, setAction] = useState<"cancel" | "resend" | null>(null);

  const handleCancel = async () => {
    setIsPending(true);
    setAction("cancel");

    try {
      const result = await cancelInvitation(invitationId);

      if (result.success) {
        toast.success("Invitation cancelled");
      } else {
        toast.error(result.error || "Failed to cancel invitation");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsPending(false);
      setAction(null);
    }
  };

  const handleResend = async () => {
    setIsPending(true);
    setAction("resend");

    try {
      const result = await resendInvitation(invitationId);

      if (result.success) {
        toast.success("Invitation resent successfully");
      } else {
        toast.error(result.error || "Failed to resend invitation");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsPending(false);
      setAction(null);
    }
  };

  if (status !== "PENDING") {
    return (
      <Badge variant="secondary" className="text-xs">
        {status}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleResend}
        disabled={isPending}
        title="Resend invitation"
      >
        {isPending && action === "resend" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        onClick={handleCancel}
        disabled={isPending}
        title="Cancel invitation"
      >
        {isPending && action === "cancel" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
