import { auth } from "@clerk/nextjs/server";
import { Building2, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "@/components/forms/client-form";
import { ClientList } from "./client-list";

interface ClientsPageProps {
  params: Promise<{ unitId: string }>;
}

async function getUserRoleInUnit(unitId: string, userId: string): Promise<{ role: "OWNER" | "ADMIN" | "USER"; companyId: string } | null> {
  const unit = await db.unit.findUnique({
    where: { id: unitId },
    select: {
      companyId: true,
      adminId: true,
      company: { select: { ownerId: true } },
    },
  });

  if (!unit) return null;

  const isOwner = unit.company.ownerId === userId;
  const isAdmin = unit.adminId === userId;

  if (isOwner || isAdmin) {
    return { role: isOwner ? "OWNER" : "ADMIN" as const, companyId: unit.companyId };
  }

  // Check if user is a regular member of the unit
  const user = await db.user.findFirst({
    where: { id: userId, unitId },
  });

  if (user) {
    return { role: "USER" as const, companyId: unit.companyId };
  }

  return null;
}

async function getClientsForUnit(unitId: string, userRole: "OWNER" | "ADMIN" | "USER", userId: string) {
  // For OWNER/ADMIN, show all clients
  if (userRole === "OWNER" || userRole === "ADMIN") {
    const clients = await db.client.findMany({
      where: { unitId },
      select: {
        id: true,
        name: true,
        wilaya: true,
        phone: true,
        email: true,
        createdAt: true,
        _count: {
          select: { projects: true },
        },
        projects: {
          select: { montantTTC: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return clients.map((client) => ({
      ...client,
      projectCount: client._count?.projects || 0,
      totalTTC: client.projects.reduce((sum, p) => sum + (p.montantTTC || 0), 0),
    }));
  }

  // For USER, only show clients linked to their assigned projects
  const userTeamMembers = await db.teamMember.findMany({
    where: {
      userId,
      team: {
        project: {
          unitId,
          clientId: { not: null },
        },
      },
    },
    include: {
      team: {
        include: {
          project: {
            select: {
              clientId: true,
            },
          },
        },
      },
    },
  });

  const clientIds = [...new Set(
    userTeamMembers
      .map((tm) => tm.team.project?.clientId)
      .filter((clientId): clientId is string => !!clientId)
  )];

  const clients = await db.client.findMany({
    where: {
      id: { in: clientIds as string[] },
      unitId,
    },
    select: {
      id: true,
      name: true,
      wilaya: true,
      phone: true,
      email: true,
      createdAt: true,
      _count: {
        select: { projects: true },
      },
      projects: {
        select: { montantTTC: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return clients.map((client) => ({
    ...client,
    projectCount: client._count?.projects || 0,
    totalTTC: client.projects.reduce((sum, p) => sum + (p.montantTTC || 0), 0),
  }));
}

export default async function ClientsPage({ params }: ClientsPageProps) {
  const { unitId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
        <p className="text-muted-foreground">Please sign in to view clients.</p>
      </div>
    );
  }

  const userAccess = await getUserRoleInUnit(unitId, userId);

  if (!userAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access denied</h2>
        <p className="text-muted-foreground">You don't have access to this unit.</p>
      </div>
    );
  }

  const { role: userRole, companyId } = userAccess;
  const isAdmin = userRole === "OWNER" || userRole === "ADMIN";

  const clients = await getClientsForUnit(unitId, userRole, userId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your {isAdmin ? "unit" : ""} clients and their projects.
          </p>
        </div>
        {isAdmin && (
          <ClientForm
            unitId={unitId}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            }
          />
        )}
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">All Clients ({clients.length})</CardTitle>
          </div>
          <CardDescription>
            {isAdmin
              ? "View and manage all clients in this unit"
              : "View clients linked to your assigned projects"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientList
            clients={clients}
            unitId={unitId}
            isAdmin={isAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}
