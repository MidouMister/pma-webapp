import { getCompanyBillingData } from "@/lib/queries";
import { notFound } from "next/navigation";
 
import { CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BillingClient } from "@/components/dashboard/billing-client";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function BillingPage({ params }: PageProps) {
  const { companyId } = await params;
  const data = await getCompanyBillingData(companyId);

  if (!data) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link 
          href={`/company/${companyId}`} 
          className="hover:text-foreground transition-colors"
        >
          {data.company.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link 
          href={`/company/${companyId}/settings`} 
          className="hover:text-foreground transition-colors"
        >
          Settings
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Billing & Plans</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Billing & Plans</h2>
            <p className="text-muted-foreground">
              Manage your subscription, view plan limits, and upgrade your organization.
            </p>
          </div>
        </div>
      </div>

      <BillingClient data={data} />
    </div>
  );
}
