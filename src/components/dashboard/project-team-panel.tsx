"use client";

import { useState, useTransition } from "react";
import { Plus, X, UserPlus, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { addTeamMember, removeTeamMember } from "@/lib/queries";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  role: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  createdAt: Date;
}

interface UnitMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface ProjectTeamPanelProps {
  projectId: string;
  initialMembers?: TeamMember[];
  unitMembers?: UnitMember[];
}

const ROLE_OPTIONS = [
  { value: "Project Manager", label: "Project Manager" },
  { value: "Engineer", label: "Engineer" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Worker", label: "Worker" },
  { value: "Consultant", label: "Consultant" },
  { value: "Other", label: "Other" },
];

export function ProjectTeamPanel({
  projectId,
  initialMembers = [],
  unitMembers = [],
}: ProjectTeamPanelProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Filter out users who are already team members
  const availableMembers = unitMembers.filter(
    (um) => !members.some((m) => m.userId === um.id)
  );

  const handleAddMember = () => {
    if (!selectedUserId || !selectedRole) return;

    startTransition(async () => {
      const result = await addTeamMember({
        projectId,
        userId: selectedUserId,
        role: selectedRole,
      });

      if (result.success) {
        const addedUser = unitMembers.find((u) => u.id === selectedUserId);
        const newMember: TeamMember = {
          id: crypto.randomUUID(),
          role: selectedRole,
          userId: selectedUserId,
          userName: addedUser?.name || "Unknown",
          userEmail: addedUser?.email || "",
          userAvatar: addedUser?.avatarUrl || null,
          createdAt: new Date(),
        };
        setMembers((prev) => [...prev, newMember]);
        setIsOpen(false);
        setSelectedUserId("");
        setSelectedRole("");
        toast.success("Team member added successfully");
      } else {
        toast.error(result.error || "Failed to add team member");
      }
    });
  };

  const handleRemoveMember = (userId: string) => {
    startTransition(async () => {
      const result = await removeTeamMember(projectId, userId);

      if (result.success) {
        setMembers((prev) => prev.filter((m) => m.userId !== userId));
        toast.success("Team member removed successfully");
      } else {
        toast.error(result.error || "Failed to remove team member");
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium">Project Team</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a unit member to this project team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user">Select User</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={isPending}
                >
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.length === 0 ? (
                      <SelectItem value="no-members" disabled>
                        No available members
                      </SelectItem>
                    ) : (
                      availableMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.avatarUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                  disabled={isPending}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleAddMember}
                disabled={!selectedUserId || !selectedRole || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Team
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No team members yet.</p>
            <p className="text-sm">Add members to collaborate on this project.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.userAvatar || undefined} />
                    <AvatarFallback>
                      {getInitials(member.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.userEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
