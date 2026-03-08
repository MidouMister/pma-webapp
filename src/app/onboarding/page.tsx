import { OnboardingWizard } from "@/components/forms/onboarding-wizard";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/company/sign-in");

  // If user already has a company, redirect to dashboard.
  const authUser = await db.user.findUnique({
    where: { id: user.id },
  });

  if (authUser?.companyId) {
    redirect(`/company/${authUser.companyId}`);
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 lg:p-12 bg-linear-to-br from-zinc-900 to-zinc-950 relative overflow-hidden text-foreground">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full z-0 opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full text-center mb-10">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
          Welcome to <span className="text-primary italic">PMA</span>
        </h1>
        <p className="text-lg text-muted-foreground w-full max-w-xl mx-auto">
          Let&apos;s set up your workspace so you can start managing your projects efficiently. We&apos;ll get your company profile, your first operational unit, and your team ready in just a few steps.
        </p>
      </div>

      <div className="relative z-10 w-full grow flex items-center justify-center">
        <OnboardingWizard />
      </div>
    </div>
  );
}
