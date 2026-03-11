import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { InvitationStatus } from "@prisma/client";

const isPublicRoute = createRouteMatcher([
  "/site",
  "/company/sign-in(.*)",
  "/company/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/uploadthing(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

/**
 * Get user's company ID from database.
 */
async function getUserCompanyId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });
  return user?.companyId || null;
}

/**
 * Check if user has an ACCEPTED invitation and get their unit ID.
 * This handles the case where user signs up via invitation link
 * but Clerk metadata hasn't propagated yet.
 */
async function getAcceptedInvitationUnitId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) return null;

  const invitation = await db.invitation.findFirst({
    where: {
      email: user.email.toLowerCase(),
      status: InvitationStatus.ACCEPTED,
    },
    select: { unitId: true },
  });

  return invitation?.unitId || null;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // 1. Handle unauthenticated users
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn();
  }

  // 2. Handle authenticated users
  if (userId) {
    // Get companyId from database - more reliable than Clerk metadata
    const dbCompanyId = await getUserCompanyId(userId);
    
    // Also check Clerk metadata as fallback
    const metadata = sessionClaims?.metadata as {
      role?: string;
      companyId?: string;
    } | undefined;
    const metadataCompanyId = metadata?.companyId;
    const role = metadata?.role;

    // Use DB companyId if available, otherwise fall back to metadata
    const companyId = dbCompanyId || metadataCompanyId;

    // A. If already on onboarding, let them finish
    if (isOnboardingRoute(req)) {
      if (companyId) {
        // Already finished onboarding, don't allow re-entry
        return NextResponse.redirect(new URL(`/company/${companyId}`, req.url));
      }
      return NextResponse.next();
    }

    // B. If not on onboarding but has no company, check for invitation
    if (!companyId && !isPublicRoute(req)) {
      // Check if they have an ACCEPTED invitation
      const invitedUnitId = await getAcceptedInvitationUnitId(userId);
      
      if (invitedUnitId) {
        // User was invited, redirect to their unit dashboard
        return NextResponse.redirect(new URL(`/unite/${invitedUnitId}`, req.url));
      }
      
      // No company and no invitation - force onboarding
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // C. Dashboard redirection for Root / Generic paths
    if (req.nextUrl.pathname === "/" && companyId) {
      if (role === "OWNER" || dbCompanyId) {
        return NextResponse.redirect(new URL(`/company/${companyId}`, req.url));
      }
      // Future: ADMIN -> /unite/[unitId], USER -> /user/[userId]
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
