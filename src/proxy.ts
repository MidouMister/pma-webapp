import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/site",
  "/company/sign-in(.*)",
  "/company/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/uploadthing(.*)", // Explicitly allow uploadthing for auth/creation
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // 1. Handle unauthenticated users
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn();
  }

  // 2. Handle authenticated users
  if (userId) {
    const metadata = sessionClaims?.metadata as {
      role?: string;
      companyId?: string;
    } | undefined;

    const role = metadata?.role;
    const companyId = metadata?.companyId;

    // A. If already on onboarding, let them finish
    if (isOnboardingRoute(req)) {
      if (companyId) {
        // Already finished onboarding, don't allow re-entry
        return NextResponse.redirect(new URL(`/company/${companyId}`, req.url));
      }
      return NextResponse.next();
    }

    // B. If not on onboarding but has no company, force onboarding
    if (!companyId && !isPublicRoute(req)) {
       // Check if they have an invitation link context? (AUTH-05)
       // Placeholder: for now always send to onboarding if no company
       return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // C. Dashboard redirection for Root / Generic paths
    if (req.nextUrl.pathname === "/" && companyId) {
      if (role === "OWNER") {
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
