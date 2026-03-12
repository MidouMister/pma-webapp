import Link from "next/link";
import { Building2, ArrowLeft, Phone, Mail, MapPin, FileText } from "lucide-react";
import { formatAmount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientDetailActions } from "./client-detail-actions";

interface Project {
  id: string;
  name: string;
  code: string | null;
  status: string;
  montantTTC: number | null;
  createdAt: Date;
}

interface ClientData {
  id: string;
  name: string;
  wilaya: string | null;
  phone: string | null;
  email: string | null;
  unit: {
    id: string;
    name: string;
    company: {
      id: string;
      name: string;
    };
  };
  projects: Project[];
  totalTTC: number;
  projectCount: number;
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "IN_PROGRESS":
      return "default";
    case "COMPLETED":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function ClientDetailContent({ client, unitId, isAdmin }: { client: ClientData; unitId: string; isAdmin: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/unite/${unitId}/clients`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-sm text-muted-foreground">
              {client.unit.name} • {client.unit.company.name}
            </p>
          </div>
        </div>
        {isAdmin && (
          <ClientDetailActions client={client} unitId={unitId} />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Contact Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Wilaya:</span>
                <span className="font-medium">{client.wilaya || "—"}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{client.email}</span>
                </div>
              )}
              {!client.wilaya && !client.phone && !client.email && (
                <span className="text-sm text-muted-foreground">No contact details available</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Financial Summary</CardTitle>
            </div>
            <CardDescription>Total contract value across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{formatAmount(client.totalTTC)}</span>
              <span className="text-sm text-muted-foreground">TTC</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {client.projectCount} project{client.projectCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Linked Projects</CardTitle>
          </div>
          <CardDescription>
            {isAdmin
              ? "All projects linked to this client"
              : "Projects linked to your assigned work"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {client.projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects linked to this client
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Project Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Montant TTC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.projects.map((project) => (
                  <TableRow key={project.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link
                        href={`/unite/${unitId}/projects/${project.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.code || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {project.montantTTC ? formatAmount(project.montantTTC) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ClientPageProps {
  params: Promise<{ unitId: string; clientId: string }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { unitId, clientId } = await params;
  const { userId } = await import("@clerk/nextjs/server").then((m) => m.auth());

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
        <p className="text-muted-foreground">Please sign in to view client details.</p>
      </div>
    );
  }

  const { db } = await import("@/lib/db");
  const { getClientWithProjects, getClientById } = await import("@/lib/queries");

  let client: ClientData | null = await getClientWithProjects(clientId);

  if (!client) {
    const fallbackClient = await getClientById(clientId);
    if (!fallbackClient) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Client not found</h2>
          <p className="text-muted-foreground">The client you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
          <Button asChild className="mt-4">
            <Link href={`/unite/${unitId}/clients`}>Back to Clients</Link>
          </Button>
        </div>
      );
    }
    client = {
      ...fallbackClient,
      projects: [],
      totalTTC: 0,
      projectCount: 0,
    };
  }

  const unit = await db.unit.findUnique({
    where: { id: unitId },
    select: {
      companyId: true,
      adminId: true,
      company: { select: { ownerId: true } },
    },
  });

  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unit not found</h2>
        <p className="text-muted-foreground">The unit you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  const isOwner = unit.company.ownerId === userId;
  const isAdmin = unit.adminId === userId;
  const isAdminOrOwner = isOwner || isAdmin;

  let userHasAccess = false;
  if (isAdminOrOwner) {
    userHasAccess = true;
  } else {
    const userTeamMembers = await db.teamMember.findMany({
      where: {
        userId,
        team: {
          project: {
            unitId,
            clientId,
          },
        },
      },
    });
    userHasAccess = userTeamMembers.length > 0;
  }

  if (!userHasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access denied</h2>
        <p className="text-muted-foreground">You don&apos;t have access to this client.</p>
        <Button asChild className="mt-4">
          <Link href={`/unite/${unitId}/clients`}>Back to Clients</Link>
        </Button>
      </div>
    );
  }

  return <ClientDetailContent client={client as ClientData} unitId={unitId} isAdmin={isAdminOrOwner} />;
}