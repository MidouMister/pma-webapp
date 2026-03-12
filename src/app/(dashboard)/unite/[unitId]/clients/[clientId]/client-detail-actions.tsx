"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientForm } from "@/components/forms/client-form";
import { deleteClient } from "@/lib/queries";

interface Project {
  id: string;
  name: string;
  code: string | null;
  status: string;
  montantTTC: number | null;
  createdAt: Date;
}

interface ClientDetailActionsProps {
  client: {
    id: string;
    name: string;
    wilaya: string | null;
    phone: string | null;
    email: string | null;
    projects: Project[];
  };
  unitId: string;
}

export function ClientDetailActions({ client, unitId }: ClientDetailActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const activeProjects = client.projects.filter((p) => p.status === "IN_PROGRESS");
  const hasActiveProjects = activeProjects.length > 0;

  const handleDelete = async () => {
    if (hasActiveProjects) {
      toast.error("Cannot delete client with active projects");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteClient({ clientId: client.id });
      if (result.success) {
        toast.success("Client deleted successfully");
        router.push(`/unite/${unitId}/clients`);
      } else {
        toast.error(result.error || "Failed to delete client");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteClick = () => {
    if (hasActiveProjects) {
      toast.error("Cannot delete client with active/InProgress projects");
      return;
    }
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <ClientForm
          unitId={unitId}
          client={client}
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          }
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-red-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Delete Client
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
              {hasActiveProjects && (
                <>
                  <br />
                  <br />
                  <span className="text-red-600 font-medium">
                    This client has {activeProjects.length} active project{activeProjects.length !== 1 ? "s" : ""} and cannot be deleted.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || hasActiveProjects}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}