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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { deleteUnit } from "@/lib/queries";
import { Loader2, AlertTriangle, FolderKanban, Users, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UnitDeleteDialogProps {
  companyId: string;
  unit: {
    id: string;
    name: string;
    _count: {
      projects: number;
      clients: number;
      users: number;
    };
  };
  trigger?: React.ReactNode;
}

export function UnitDeleteDialog({ companyId, unit, trigger }: UnitDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const router = useRouter();
  
  const canDelete = confirmName.toLowerCase() === unit.name.toLowerCase();

  const onDelete = async () => {
    if (!canDelete) return;
    
    setIsDeleting(true);
    
    try {
      const result = await deleteUnit(unit.id);
      
      if (result.success) {
        toast.success("Unit deleted successfully");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete unit");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Unit
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please review the impact below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Warning Box */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive font-medium">
              Deleting &quot;{unit.name}&quot; will permanently remove:
            </p>
          </div>
          
          {/* Impact Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <FolderKanban className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-semibold">{unit._count.projects}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Building2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-semibold">{unit._count.clients}</p>
              <p className="text-xs text-muted-foreground">Clients</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-semibold">{unit._count.users}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>
          
          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-semibold">{unit.name}</span> to confirm
            </Label>
            <Input
              id="confirm"
              placeholder="Enter unit name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="border-destructive/50 focus-visible:ring-destructive"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Unit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
