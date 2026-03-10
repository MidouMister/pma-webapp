import { getCompanyDashboardData } from "@/lib/queries";
import { notFound, redirect } from "next/navigation";
import { CompanyDashboardClient } from "@/components/dashboard/company-dashboard-client";
import { auth } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function CompanyDashboardPage({ params }: PageProps) {
  const { companyId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/company/sign-in");
  }

  const data = await getCompanyDashboardData(companyId);

  if (!data) {
    // If data is null, it might mean the company doesn't exist 
    // or the user isn't the owner. verifyCompanyOwner already handles redirect.
    // For now, let's just use notFound if it's completely missing.
    notFound();
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <CompanyDashboardClient data={data} />
    </div>
  );
}
