import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { CompanySettingsForm } from "@/components/forms/company-settings-form";
import { Building2, ChevronRight, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function CompanySettingsPage({ params }: PageProps) {
  const { companyId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/company/sign-in");
  }

  const company = await db.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    notFound();
  }

  // Double check ownership
  if (company.ownerId !== userId) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Breadcrumbs / Back navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link 
          href={`/company/${companyId}`} 
          className="hover:text-foreground transition-colors"
        >
          {company.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Settings</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Company Settings</h2>
            <p className="text-muted-foreground">
              Manage your organization&apos;s legal profile and identity.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <CompanySettingsForm company={company} />
        
        <Link href={`/company/${companyId}/settings/billing`} className="block group">
          <Card className="glass-morphism border-white/5 transition-all group-hover:bg-white/5 group-hover:border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Subscription & Billing</CardTitle>
                    <CardDescription>
                      View your current plan, usage limits, and manage your subscription.
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
