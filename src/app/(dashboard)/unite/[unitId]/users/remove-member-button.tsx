"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { removeUserFromUnit } from "@/lib/queries";
import { Loader2, Trash2 } from "lucide-react";

interface RemoveMemberButtonProps {
  memberId: string;
  memberName: string;
  unitId: string;
}

export function RemoveMemberButton({ memberId, memberName, unitId }: RemoveMemberButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleRemove = async () => {
    setIsPending(true);

    try {
      const result = await removeUserFromUnit(memberId, unitId);

      if (result.success) {
        toast.success("Member removed from unit");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to remove member");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
        title="Remove from unit"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Remove Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the unit? They will lose access to all unit-scoped data.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="font-medium">{memberName}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. The user account will not be deleted.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove from Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
