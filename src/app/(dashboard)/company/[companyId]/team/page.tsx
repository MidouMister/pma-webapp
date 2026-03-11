import { getCompanyMembers, getCompanyInvitations, verifyCompanyOwner } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { MailPlus, Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InviteMemberForm } from "@/components/forms/invite-member-form";
import { InvitationActions } from "./invitation-actions";

interface TeamPageProps {
  params: Promise<{ companyId: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { companyId } = await params;

  await verifyCompanyOwner(companyId);

  const [members, invitations] = await Promise.all([
    getCompanyMembers(companyId),
    getCompanyInvitations(companyId),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your company members and invitations.
          </p>
        </div>
        <InviteMemberForm companyId={companyId} trigger={
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        } />
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Members ({members.length})</CardTitle>
            </div>
            <CardDescription>
              All members across your company units
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No team members yet</h3>
                <p className="text-muted-foreground text-center text-sm mb-4">
                  Invite your first team member to get started.
                </p>
                <InviteMemberForm companyId={companyId} trigger={
                  <Button variant="outline" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite First Member
                  </Button>
                } />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium pl-2">Member</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Unit</th>
                      <th className="pb-3 font-medium">Job Title</th>
                      <th className="pb-3 font-medium pr-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-lg">
                              <AvatarImage src={member.avatarUrl || undefined} />
                              <AvatarFallback className="rounded-lg text-xs">
                                {member.name?.slice(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{member.name || "No name"}</span>
                              <span className="text-xs text-muted-foreground">{member.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <RoleBadge role={member.role} />
                        </td>
                        <td className="py-3">
                          {member.unit ? (
                            <Link
                              href={`/unite/${member.unit.id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {member.unit.name}
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="text-sm">{member.jobTitle || "—"}</span>
                        </td>
                        <td className="py-3 pr-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(member.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MailPlus className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Pending Invitations ({invitations.filter((i) => i.status === "PENDING").length})</CardTitle>
            </div>
            <CardDescription>
              Invitations sent to join your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <MailPlus className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No pending invitations</h3>
                <p className="text-muted-foreground text-center text-sm">
                  All your invitations have been accepted or expired.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MailPlus className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{invitation.email}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] h-5">
                            {invitation.role}
                          </Badge>
                          {invitation.unit && (
                            <>
                              <span>•</span>
                              <span>{invitation.unit.name}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Sent {formatDate(invitation.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <InvitationActions
                      invitationId={invitation.id}
                      status={invitation.status}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles = {
    OWNER: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    ADMIN: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    USER: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };

  const style = styles[role as keyof typeof styles] || styles.USER;

  return (
    <Badge className={`${style} border`}>
      {role}
    </Badge>
  );
}
