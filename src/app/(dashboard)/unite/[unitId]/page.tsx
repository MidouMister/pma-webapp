import { getUnitDashboardData, verifyUnitAccess } from "@/lib/queries";
import { formatAmount, formatDate } from "@/lib/utils";
import { 
  Building2, 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Activity
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UnitDashboardPageProps {
  params: Promise<{ unitId: string }>;
}

export default async function UnitDashboardPage({ params }: UnitDashboardPageProps) {
  const { unitId } = await params;
  
  // Verify access - OWNER or ADMIN can access
  const access = await verifyUnitAccess(unitId);
  
  const data = await getUnitDashboardData(unitId);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unit not found</h2>
        <p className="text-muted-foreground">This unit may have been deleted.</p>
      </div>
    );
  }

  const { unit, stats } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{unit.name}</h1>
            <Badge variant="outline" className="text-xs">
              Unit Dashboard
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Operational overview for {unit.name} • Part of {unit.company.name}
          </p>
        </div>
        
        {access.isOwner && (
          <Button variant="outline" asChild>
            <Link href={`/company/${unit.companyId}/units`}>
              Manage Units
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Active Projects"
          value={stats.activeProjects}
          total={stats.totalProjects}
          icon={<FolderKanban className="h-4 w-4" />}
          description="In progress"
          color="blue"
        />
        <KPICard
          title="Team Members"
          value={stats.totalMembers}
          icon={<Users className="h-4 w-4" />}
          description="Assigned to this unit"
          color="purple"
        />
        <KPICard
          title="Total Clients"
          value={stats.totalClients}
          icon={<Building2 className="h-4 w-4" />}
          description="Active clients"
          color="green"
        />
        <KPICard
          title="Contract Value"
          value={formatAmount(stats.totalContractValue)}
          icon={<DollarSign className="h-4 w-4" />}
          description="Total TTC"
          color="amber"
          isCurrency
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Active Projects
              </CardTitle>
              <CardDescription>Projects currently in progress</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/unite/${unitId}/projects`}>
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.activeProjects === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderKanban className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No active projects</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href={`/unite/${unitId}/projects`}>
                    Create Project
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {unit.projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.code}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatAmount(project.montantTTC || 0)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Team Members
              </CardTitle>
              <CardDescription>People in this unit</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/unite/${unitId}/users`}>
                Manage
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.totalMembers === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No team members yet</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href={`/unite/${unitId}/users`}>
                    Invite Members
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {unit.users.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-lg">
                        <AvatarImage src={member.avatarUrl || undefined} />
                        <AvatarFallback className="rounded-lg text-xs">
                          {member.name?.slice(0, 2).toUpperCase() || "MB"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={member.role === "ADMIN" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Common tasks for this unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/unite/${unitId}/projects`}>
                <FolderKanban className="h-4 w-4 mr-2" />
                Projects
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/unite/${unitId}/clients`}>
                <Building2 className="h-4 w-4 mr-2" />
                Clients
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/unite/${unitId}/tasks`}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Tasks
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/unite/${unitId}/users`}>
                <Users className="h-4 w-4 mr-2" />
                Team
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: number | string;
  total?: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "purple" | "green" | "amber";
  isCurrency?: boolean;
}

function KPICard({ title, value, total, icon, description, color, isCurrency }: KPICardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", colorClasses[color])}>
            {icon}
          </div>
          {total !== undefined && (
            <span className="text-xs text-muted-foreground">
              of {total} total
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
