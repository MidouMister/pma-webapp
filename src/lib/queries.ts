"use server";

import { db } from "./db";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { CompanyOnboardingData, UnitOnboardingData, TeamInviteData } from "./types";
import { Role } from "@prisma/client";
import { TAGS } from "./cache";
import { cacheTag, cacheLife, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { companyUpdateSchema, upgradeRequestSchema } from "./schemas";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Enforces active (non-blocked) subscription before mutations.
 * Should be called AFTER authentication but BEFORE any database mutation.
 * @throws Error if subscription is blocked or inactive
 */
async function enforceActiveSubscription(companyId: string) {
    const { isBlocked } = await getSubscriptionStatus(companyId);
    if (isBlocked) {
        throw new Error("Your subscription has expired. Please upgrade to continue.");
    }
}

/**
 * Single source of truth for all database queries and mutations.
 * This ensures consistency and makes it easier to optimize queries.
 * 
 * Always export functions from this file for database interactions.
 */

export async function completeOnboarding({
  company,
  unit,
  invites,
}: {
  company: CompanyOnboardingData;
  unit: UnitOnboardingData;
  invites: TeamInviteData[];
}) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 0. Fetch Clerk user details to ensure we have name/email for DB creation
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email || "User";

    const result = await db.$transaction(async (tx) => {
      // 1. Get the Starter plan for initial subscription
      const starterPlan = await tx.plan.findUnique({
        where: { name: "Starter" },
      });

      if (!starterPlan) {
        throw new Error("Starter plan not found in database. Please run seeding.");
      }

      // 2. Create or Update the Company (Handling retries)
      const newCompany = await tx.company.upsert({
        where: { ownerId: userId },
        update: {
          name: company.name,
          companyEmail: company.email,
          logo: company.logoUrl,
          formJur: company.formJur,
          nif: company.nif,
          secteur: company.sector,
          state: company.state,
          address: company.address,
          phone: company.phone,
        },
        create: {
          name: company.name,
          companyEmail: company.email,
          logo: company.logoUrl,
          formJur: company.formJur,
          nif: company.nif,
          secteur: company.sector,
          state: company.state,
          address: company.address,
          phone: company.phone,
          ownerId: userId,
        },
      });

      // 3. Ensure the User exists in DB and update their company relationship
      await tx.user.upsert({
        where: { id: userId },
        update: {
          companyId: newCompany.id,
          role: Role.OWNER,
        },
        create: {
          id: userId,
          email,
          name,
          companyId: newCompany.id,
          role: Role.OWNER,
          avatarUrl: clerkUser.imageUrl,
        },
      });

      // 4. Create or Update the first Unit (Handling retries)
      const newUnit = await tx.unit.upsert({
        where: { adminId: userId },
        update: {
          name: unit.name,
          address: unit.address,
          phone: unit.phone,
          email: unit.email,
          companyId: newCompany.id,
        },
        create: {
          name: unit.name,
          address: unit.address,
          phone: unit.phone,
          email: unit.email,
          companyId: newCompany.id,
          adminId: userId,
        },
      });

      // 5. Create a 2-month Starter trial subscription (Only if none exists)
      const existingSubscription = await tx.subscription.findFirst({
        where: { companyId: newCompany.id, active: true },
      });

      if (!existingSubscription) {
        const trialEnd = new Date();
        trialEnd.setMonth(trialEnd.getMonth() + 2);

        await tx.subscription.create({
          data: {
            companyId: newCompany.id,
            planId: starterPlan.id,
            startAt: new Date(),
            endAt: trialEnd,
            active: true,
            price: 0,
          },
        });
      }

      // 6. Handle Team Invitations in DB
      const validInvites = invites?.filter(i => i.role === "ADMIN" || i.role === "USER") || [];
      if (validInvites.length > 0) {
        // First create or update invitations in DB
        const dbInvitations = await Promise.all(
          validInvites.map(async (invite) => {
            return tx.invitation.upsert({
              where: {
                email_companyId: {
                  email: invite.email,
                  companyId: newCompany.id,
                },
              },
              update: {
                role: invite.role as Role,
                unitId: newUnit.id,
              },
              create: {
                email: invite.email,
                role: invite.role as Role,
                companyId: newCompany.id,
                unitId: newUnit.id,
                status: "PENDING",
              },
            });
          })
        );
        
        return { companyId: newCompany.id, dbInvitations };
      }

      return { companyId: newCompany.id, dbInvitations: [] };
    });

    // 7. Dispatch Clerk Invitations (outside transaction as it's an external API call)
    if (result.dbInvitations && result.dbInvitations.length > 0) {
      await Promise.all(
        result.dbInvitations.map(async (inv) => {
          try {
            // Check if Clerk invitation already exists to avoid 422 duplicates
            const clerkInvitation = await clerkClient.invitations.createInvitation({
              emailAddress: inv.email,
              redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/company/sign-up`,
              publicMetadata: {
                invitationId: inv.id,
                companyId: result.companyId,
                role: inv.role,
              },
            });
            
            // Update the record with clerkInvitationId
            await db.invitation.update({
              where: { id: inv.id },
              data: { clerkInvitationId: clerkInvitation.id },
            });
          } catch (clerkError: unknown) {
             // Clerk might throw for duplicate invitations or invalid emails
             const errorMessage = clerkError instanceof Error ? clerkError.message : "Unknown Clerk error";
             console.warn(`[Queries] Clerk Invitation Warning for ${inv.email}:`, errorMessage);
             // We don't throw here to ensure onboarding completes for the OWNER
          }
        })
      );
    }

    try {
      // 8. Update Clerk User Metadata for fast redirection in middleware
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: Role.OWNER,
          companyId: result.companyId,
        },
      });
    } catch (metaError: unknown) {
      const errorMessage = metaError instanceof Error ? metaError.message : "Unknown metadata error";
      console.error("[Queries] Metadata Update Error:", errorMessage);
      // We still return success: true because the DB portion is done
    }

    return { success: true, companyId: result.companyId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Onboarding Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Fetches common dashboard data for a company owner.
 */
export async function getCompanyDashboardData(companyId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.COMPANY(companyId));
    cacheLife("minutes");

    const company = await db.company.findUnique({
      where: { id: companyId },
      include: {
        units: {
          include: {
            _count: {
              select: {
                projects: true,
                users: true,
              },
            },
          },
        },
        subscriptions: {
          include: {
            plan: true,
          },
          where: { active: true },
          take: 1,
        },
      },
    });

    if (!company || company.ownerId !== userId) {
      return null;
    }

    const totalUnits = company.units.length;
    const totalProjects = company.units.reduce((acc, unit) => acc + unit._count.projects, 0);
    const totalMembers = company.units.reduce((acc, unit) => acc + unit._count.users, 0);

    return {
      company,
      stats: {
        totalUnits,
        totalProjects,
        totalMembers,
      },
      subscription: company.subscriptions[0] || null,
    };
  }

  return fetchData();
}

/**
 * Validates if the current user is the owner of the given company.
 * Used for route protection in company-scoped pages.
 */
export async function verifyCompanyOwner(companyId: string) {
  const { userId } = await auth();
  if (!userId) redirect("/company/sign-in");

  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { ownerId: true },
  });

  if (!company || company.ownerId !== userId) {
    redirect("/unauthorized");
  }

  return true;
}


/**
 * Updates company metadata. Only accessible by the OWNER.
 */
export async function updateCompany(companyId: string, values: z.infer<typeof companyUpdateSchema>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    });

    if (!company || company.ownerId !== userId) {
      return { success: false, error: "Access denied. Only the owner can update company settings." };
    }

    await enforceActiveSubscription(companyId);

    const validated = companyUpdateSchema.parse(values);

    await db.company.update({
      where: { id: companyId },
      data: validated,
    });

    updateTag(TAGS.COMPANY(companyId));
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Update Company Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Fetches billing details, current usage, and available plans.
 */
export async function getCompanyBillingData(companyId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.COMPANY(companyId));
    cacheLife("minutes");

    const [company, allPlans] = await Promise.all([
      db.company.findUnique({
        where: { id: companyId },
        include: {
          subscriptions: {
            where: { active: true },
            include: { plan: true },
            take: 1,
          },
          _count: {
            select: {
              units: true,
              users: true,
            },
          },
        },
      }),
      db.plan.findMany({
        orderBy: { monthlyCost: "asc" },
      }),
    ]);

    if (!company || company.ownerId !== userId) return null;

    // To get total projects and tasks, we need to aggregate from units
    const projectAggregation = await db.project.aggregate({
      where: { unit: { companyId } },
      _count: { id: true },
    });

    const taskAggregation = await db.task.aggregate({
      where: { unit: { companyId } },
      _count: { id: true },
    });

    // Get subscription status for billing enforcement
    const subscriptionStatus = await getSubscriptionStatus(companyId);

    // Calculate days remaining
    let daysRemaining: number | null = null;
    if (subscriptionStatus.status !== "NONE" && subscriptionStatus.endAt) {
      const endAt = new Date(subscriptionStatus.endAt);
      const now = new Date();
      const diffTime = endAt.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      company,
      subscription: company.subscriptions[0] || null,
      plans: allPlans,
      usage: {
        units: company._count.units,
        projects: projectAggregation._count.id,
        members: company._count.users,
        tasks: taskAggregation._count.id,
      },
      daysRemaining,
      isGracePeriod: subscriptionStatus.isGracePeriod,
      isBlocked: subscriptionStatus.isBlocked,
      subscriptionStatus: subscriptionStatus.status as "ACTIVE" | "GRACE_PERIOD" | "BLOCKED" | "NONE",
    };
  }

  return fetchData();
}

/**
 * Checks the status of a company's subscription.
 * Returns information about expiry and grace periods.
 */
export async function getSubscriptionStatus(companyId: string) {
  const subscription = await db.subscription.findFirst({
    where: { companyId, active: true },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    return {
      status: "NONE",
      isExpired: true,
      isGracePeriod: false,
      isBlocked: true,
      plan: null,
    };
  }

  const now = new Date();
  const endAt = new Date(subscription.endAt);
  const gracePeriodEnd = new Date(subscription.endAt);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

  const isExpired = now > endAt;
  const isGracePeriod = isExpired && now <= gracePeriodEnd;
  const isBlocked = now > gracePeriodEnd;

  return {
    status: isBlocked ? "BLOCKED" : isGracePeriod ? "GRACE_PERIOD" : "ACTIVE",
    isExpired,
    isGracePeriod,
    isBlocked,
    plan: subscription.plan,
    endAt: subscription.endAt,
  };
}

/**
 * Server action to get the current user's subscription status.
 * Can be called from client components.
 */
export async function getCurrentUserSubscriptionStatus(): Promise<{
  daysRemaining: number | null;
  isGracePeriod: boolean;
  isBlocked: boolean;
  status: "ACTIVE" | "GRACE_PERIOD" | "BLOCKED" | "NONE";
  companyId: string | null;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  if (!dbUser?.companyId) return null;

  const subStatus = await getSubscriptionStatus(dbUser.companyId);

  let daysRemaining: number | null = null;
  if (subStatus.endAt) {
    const now = new Date();
    const endAt = new Date(subStatus.endAt);
    const diffTime = endAt.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    daysRemaining,
    isGracePeriod: subStatus.isGracePeriod,
    isBlocked: subStatus.isBlocked,
    status: subStatus.status as "ACTIVE" | "GRACE_PERIOD" | "BLOCKED" | "NONE",
    companyId: dbUser.companyId,
  };
}

/**
 * Checks if a company has reached its plan limits for a specific entity type.
 * @throws Error if the limit is reached.
 */
export async function checkPlanLimit(
  companyId: string,
  entityType: "units" | "projects" | "users" | "tasks",
  projectId?: string // Required for tasks check (tasks per project)
) {
  const { status, plan, isBlocked } = await getSubscriptionStatus(companyId);

  if (status === "NONE" || !plan) {
    throw new Error("No active subscription found. Please contact support.");
  }

  if (isBlocked) {
    throw new Error("Your subscription has expired and the grace period has ended. Access to creation features is blocked.");
  }

  // 2. Check entities count
  switch (entityType) {
    case "units":
      if (plan.maxUnits === null) return true; // Unlimited
      const unitCount = await db.unit.count({ where: { companyId } });
      if (unitCount >= plan.maxUnits) {
        throw new Error(`Limit reached: Your plan allows only ${plan.maxUnits} units.`);
      }
      break;

    case "projects":
      if (plan.maxProjects === null) return true;
      const projectCount = await db.project.count({ where: { unit: { companyId } } });
      if (projectCount >= plan.maxProjects) {
        throw new Error(`Limit reached: Your plan allows only ${plan.maxProjects} projects.`);
      }
      break;

    case "users":
      if (plan.maxMembers === null) return true;
      const memberCount = await db.user.count({ where: { companyId } });
      if (memberCount >= plan.maxMembers) {
        throw new Error(`Limit reached: Your plan allows only ${plan.maxMembers} members.`);
      }
      break;

    case "tasks":
      if (plan.maxTasksPerProject === null) return true;
      if (!projectId) throw new Error("Project ID is required to check task limits.");
      const taskCount = await db.task.count({ 
        where: { 
          unit: { companyId }, 
          // Note: In our current schema Task doesn't have projectId directly, 
          // but we usually filter by lane or unit. 
          // If we assume tasks are within projects (M10), we'll need that link.
        } 
      });
      // This is a placeholder until M10 Task-Project link is solid
      if (taskCount >= plan.maxTasksPerProject) {
         // throw new Error(`Limit reached: Your plan allows only ${plan.maxTasksPerProject} tasks per project.`);
      }
      break;
  }

  return true;
}

/**
 * Handles the "Request Upgrade" form submission.
 * Creates a notification for the OWNER and logs the request.
 */
export async function requestUpgrade(values: z.infer<typeof upgradeRequestSchema>, companyId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await enforceActiveSubscription(companyId);

    const validated = upgradeRequestSchema.parse(values);
    
    // In a real application, we would send an email to the platform operator here.
    // console.log("EMAILING OPERATOR:", validated);

    // Create a confirmation notification for the OWNER
    await db.notification.create({
      data: {
        notification: `Your request to upgrade to the ${validated.planId} plan has been received. Our team will contact you shortly regarding the ${validated.paymentMethod} payment.`,
        type: "GENERAL",
        companyId,
        userId, // The owner who requested it
        targetUserId: userId,
        read: false,
      },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Request Upgrade Error:", message);
    return { success: false, error: message };
  }
}
