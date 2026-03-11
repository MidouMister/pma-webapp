import { getCompanyUnits, verifyCompanyOwner } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { Building2, Plus, Users, FolderKanban, MoreHorizontal, Edit, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnitForm } from "@/components/forms/unit-form";
import { UnitDeleteDialog } from "@/components/forms/unit-delete-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UnitsPageProps {
  params: Promise<{ companyId: string }>;
}

export default async function UnitsPage({ params }: UnitsPageProps) {
  const { companyId } = await params;
  
  // Verify ownership - only OWNER can access this page
  await verifyCompanyOwner(companyId);
  
  const units = await getCompanyUnits(companyId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Units</h1>
          <p className="text-muted-foreground">
            Manage your company&apos;s operational units. Each unit can have its own admin and team.
          </p>
        </div>
        <UnitForm companyId={companyId} trigger={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Unit
          </Button>
        } />
      </div>

      {/* Units Grid */}
      {units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No units yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Create your first operational unit to start organizing your projects and team members.
          </p>
          <UnitForm companyId={companyId} trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Unit
            </Button>
          } />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} companyId={companyId} />
          ))}
        </div>
      )}
    </div>
  );
}

interface UnitCardProps {
  unit: Awaited<ReturnType<typeof getCompanyUnits>>[number];
  companyId: string;
}

function UnitCard({ unit, companyId }: UnitCardProps) {
  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              {unit.name}
            </CardTitle>
            <CardDescription className="text-xs">
              Created {formatDate(unit.createdAt)}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`/unite/${unit.id}`} className="flex items-center gap-2 cursor-pointer">
                  <ArrowRight className="h-4 w-4" />
                  View Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <UnitForm companyId={companyId} unit={unit} trigger={
                  <span className="flex items-center gap-2 w-full cursor-pointer">
                    <Edit className="h-4 w-4" />
                    Edit
                  </span>
                } />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <UnitDeleteDialog unit={unit} companyId={companyId} trigger={
                  <span className="flex items-center gap-2 w-full cursor-pointer text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </span>
                } />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Admin */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={unit.admin.avatarUrl || undefined} />
            <AvatarFallback className="rounded-lg text-xs">
              {unit.admin.name?.slice(0, 2).toUpperCase() || "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{unit.admin.name || "No name"}</span>
            <Badge variant="secondary" className="w-fit text-[10px] h-5 px-2">
              Admin
            </Badge>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="h-3 w-3" />
            </div>
            <p className="text-lg font-semibold">{unit._count.users}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Members</p>
          </div>
          <div className="text-center border-x">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <FolderKanban className="h-3 w-3" />
            </div>
            <p className="text-lg font-semibold">{unit._count.projects}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Projects</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Building2 className="h-3 w-3" />
            </div>
            <p className="text-lg font-semibold">{unit._count.clients}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Clients</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/unite/${unit.id}`}>
              View Dashboard
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
