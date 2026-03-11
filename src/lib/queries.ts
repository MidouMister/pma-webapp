"use server";

import { db } from "./db";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { CompanyOnboardingData, UnitOnboardingData, TeamInviteData } from "./types";
import { Role, InvitationStatus, NotificationType } from "@prisma/client";
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

// ============================================================================
// M07 - Unit Management Server Actions
// ============================================================================

/**
 * Unit creation input schema
 */
const createUnitSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  adminId: z.string().min(1, "Admin assignment is required"),
});

/**
 * Unit update input schema
 */
const updateUnitSchema = z.object({
  name: z.string().min(1, "Unit name is required").optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

/**
 * Creates a new Unit for a company.
 * Only OWNER can create units.
 * Enforces Plan.maxUnits limit.
 */
export async function createUnit(companyId: string, values: z.infer<typeof createUnitSchema>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Verify ownership
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true },
    });

    if (!company || company.ownerId !== userId) {
      return { success: false, error: "Only the company owner can create units." };
    }

    // Check plan limits
    await checkPlanLimit(companyId, "units");

    // Validate input
    const validated = createUnitSchema.parse(values);

    // Verify admin exists and is in this company
    const adminUser = await db.user.findFirst({
      where: { id: validated.adminId, companyId },
      include: { administeredUnit: true },
    });

    if (!adminUser) {
      return { success: false, error: "Selected admin must be a member of this company." };
    }

    // Check if user is already admin of another unit
    if (adminUser.administeredUnit) {
      return { success: false, error: "This user is already an admin of another unit." };
    }

    // Create the unit
    const newUnit = await db.unit.create({
      data: {
        name: validated.name,
        address: validated.address,
        phone: validated.phone,
        email: validated.email,
        companyId,
        adminId: validated.adminId,
      },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        company: { select: { name: true } },
      },
    });

    // Update the admin user's role and unit assignment
    await db.user.update({
      where: { id: validated.adminId },
      data: {
        role: "ADMIN",
        unitId: newUnit.id,
      },
    });

    // Invalidate cache
    updateTag(TAGS.COMPANY(companyId));

    return { success: true, unit: newUnit };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Create Unit Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Updates an existing Unit.
 * OWNER can update any unit.
 * ADMIN can only update their own unit.
 */
export async function updateUnit(unitId: string, values: z.infer<typeof updateUnitSchema>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Get the unit
    const unit = await db.unit.findUnique({
      where: { id: unitId },
      select: { companyId: true, adminId: true, company: { select: { ownerId: true } } },
    });

    if (!unit) {
      return { success: false, error: "Unit not found." };
    }

    // Check permissions: OWNER can update any unit, ADMIN can only update their own
    const isOwner = unit.company.ownerId === userId;
    const isAdmin = unit.adminId === userId;

    if (!isOwner && !isAdmin) {
      return { success: false, error: "You don't have permission to update this unit." };
    }

    // Validate input
    const validated = updateUnitSchema.parse(values);

    // Update the unit
    const updatedUnit = await db.unit.update({
      where: { id: unitId },
      data: validated,
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
    });

    // Invalidate cache
    updateTag(TAGS.UNIT(unitId));
    updateTag(TAGS.COMPANY(unit.companyId));

    return { success: true, unit: updatedUnit };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Update Unit Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Deletes a Unit and cascades deletion of all associated data.
 * Only OWNER can delete units.
 * Cascades: Projects, Phases, Tasks, Lanes, Tags, Clients
 */
export async function deleteUnit(unitId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Get the unit with company info
    const unit = await db.unit.findUnique({
      where: { id: unitId },
      select: { companyId: true, company: { select: { ownerId: true } } },
    });

    if (!unit) {
      return { success: false, error: "Unit not found." };
    }

    // Only OWNER can delete
    if (unit.company.ownerId !== userId) {
      return { success: false, error: "Only the company owner can delete units." };
    }

    // Get deletion impact summary before deleting
    const [projectCount, clientCount, memberCount] = await Promise.all([
      db.project.count({ where: { unitId } }),
      db.client.count({ where: { unitId } }),
      db.user.count({ where: { unitId } }),
    ]);

    // Delete the unit (cascades via schema: Projects, Phases, Tasks, Lanes, Tags, Clients)
    await db.unit.delete({
      where: { id: unitId },
    });

    // Invalidate cache
    updateTag(TAGS.UNIT(unitId));
    updateTag(TAGS.COMPANY(unit.companyId));

    return { 
      success: true, 
      message: `Unit deleted successfully.`,
      impact: { projectCount, clientCount, memberCount }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Delete Unit Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Fetches all units for a company with details.
 * Used by the units list page.
 */
export async function getCompanyUnits(companyId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.COMPANY(companyId));
    cacheLife("minutes");

    return db.unit.findMany({
      where: { companyId },
      include: {
        admin: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: {
          select: {
            projects: true,
            users: true,
            clients: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return fetchData();
}

/**
 * Fetches a single unit by ID with full details.
 */
export async function getUnitById(unitId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.UNIT(unitId));
    cacheLife("minutes");

    return db.unit.findUnique({
      where: { id: unitId },
      include: {
        admin: { select: { id: true, name: true, email: true, avatarUrl: true } },
        company: { select: { id: true, name: true, ownerId: true } },
        _count: {
          select: {
            projects: true,
            users: true,
            clients: true,
            tasks: true,
          },
        },
      },
    });
  }

  return fetchData();
}

/**
 * Fetches unit dashboard data for the unit overview page.
 */
export async function getUnitDashboardData(unitId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.UNIT(unitId));
    cacheLife("minutes");

    const unit = await db.unit.findUnique({
      where: { id: unitId },
      include: {
        admin: { select: { id: true, name: true, email: true, avatarUrl: true } },
        company: { select: { id: true, name: true, ownerId: true } },
        projects: {
          where: { status: "IN_PROGRESS" },
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            montantTTC: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        _count: {
          select: {
            projects: true,
            users: true,
            clients: true,
            tasks: true,
          },
        },
      },
    });

    if (!unit) return null;

    // Calculate stats
    const activeProjects = unit.projects.length;
    const totalMembers = unit._count.users;
    const totalClients = unit._count.clients;
    const totalProjects = unit._count.projects;

    // Calculate total contract value
    const projectAggregation = await db.project.aggregate({
      where: { unitId },
      _sum: { montantTTC: true },
    });

    return {
      unit,
      stats: {
        activeProjects,
        totalMembers,
        totalClients,
        totalProjects,
        totalContractValue: projectAggregation._sum.montantTTC || 0,
      },
    };
  }

  return fetchData();
}

/**
 * Verifies if the current user can access a unit (OWNER of company or ADMIN of unit).
 */
export async function verifyUnitAccess(unitId: string) {
  const { userId } = await auth();
  if (!userId) redirect("/company/sign-in");

  const unit = await db.unit.findUnique({
    where: { id: unitId },
    select: { 
      companyId: true, 
      adminId: true, 
      company: { select: { ownerId: true } } 
    },
  });

  if (!unit) {
    redirect("/not-found");
  }

  const isOwner = unit.company.ownerId === userId;
  const isAdmin = unit.adminId === userId;

  if (!isOwner && !isAdmin) {
    redirect("/unauthorized");
  }

  return { 
    canAccess: true, 
    isOwner, 
    isAdmin,
    companyId: unit.companyId,
    unitId 
  };
}

/**
 * Fetches eligible users who can be assigned as admin of a new unit.
 * Excludes users who are already admins of another unit.
 */
export async function getEligibleAdmins(companyId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  // Only OWNER can access this
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { ownerId: true },
  });

  if (!company || company.ownerId !== userId) {
    return [];
  }

  // Find users in the company who are not already admins of a unit
  // Also exclude the company owner (they can't be assigned as unit admin)
  const eligibleUsers = await db.user.findMany({
    where: { 
      companyId,
      role: { not: "OWNER" },
      // Exclude users who are already admins
      administeredUnit: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
    orderBy: { name: "asc" },
  });

  return eligibleUsers;
}

// ============================================================================
// M08 - Invitation Server Actions
// ============================================================================

const sendInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "USER"]),
  companyId: z.string().uuid("Invalid company ID"),
  unitId: z.string().uuid("Invalid unit ID").optional(),
});

/**
 * Checks if a company has reached its maxMembers plan limit.
 * @throws Error if the limit is reached.
 */
async function checkPlanLimitForMembers(companyId: string) {
  const { status, plan, isBlocked } = await getSubscriptionStatus(companyId);

  if (status === "NONE" || !plan) {
    throw new Error("No active subscription found. Please contact support.");
  }

  if (isBlocked) {
    throw new Error("Your subscription has expired and the grace period has ended. Access to creation features is blocked.");
  }

  if (plan.maxMembers === null) return true;

  const memberCount = await db.user.count({ where: { companyId } });
  if (memberCount >= plan.maxMembers) {
    throw new Error(`Limit reached: Your plan allows only ${plan.maxMembers} members.`);
  }

  return true;
}

/**
 * Fetches all members (users) in a company.
 */
export async function getCompanyMembers(companyId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.COMPANY(companyId));
    cacheLife("hours");

    return db.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        unitId: true,
        jobTitle: true,
        createdAt: true,
        unit: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  return fetchData();
}

/**
 * Fetches all invitations for a company.
 */
export async function getCompanyInvitations(companyId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.COMPANY_INVITATIONS(companyId));
    cacheLife("minutes");

    return db.invitation.findMany({
      where: { companyId },
      include: {
        unit: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return fetchData();
}

/**
 * Fetches all invitations scoped to a unit.
 */
export async function getUnitInvitations(unitId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.UNIT_INVITATIONS(unitId));
    cacheLife("minutes");

    return db.invitation.findMany({
      where: { unitId },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return fetchData();
}

/**
 * Fetches all members (users) assigned to a specific unit.
 */
export async function getUnitMembers(unitId: string) {
  const { userId } = await auth();
  if (!userId) return [];

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.UNIT_MEMBERS(unitId));
    cacheLife("hours");

    return db.user.findMany({
      where: { unitId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        jobTitle: true,
        createdAt: true,
        unit: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  return fetchData();
}

/**
 * Removes a user from a unit (sets unitId to null).
 * Only ADMIN of the unit or COMPANY OWNER can perform this action.
 * Does NOT delete the User account or their Clerk account.
 */
export async function removeUserFromUnit(userId: string, unitId: string) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) {
    return { success: false, error: "Unauthorized" };
  }

  const unit = await db.unit.findUnique({
    where: { id: unitId },
    select: { 
      companyId: true, 
      adminId: true, 
      company: { select: { ownerId: true } } 
    },
  });

  if (!unit) {
    return { success: false, error: "Unit not found" };
  }

  const isOwner = unit.company.ownerId === currentUserId;
  const isAdmin = unit.adminId === currentUserId;

  if (!isOwner && !isAdmin) {
    return { success: false, error: "You don't have permission to remove members from this unit" };
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { unitId: true, role: true },
  });

  if (!targetUser || targetUser.unitId !== unitId) {
    return { success: false, error: "User is not a member of this unit" };
  }

  if (targetUser.role === "OWNER") {
    return { success: false, error: "Cannot remove the company owner" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { unitId: null },
    });

    updateTag(TAGS.UNIT_MEMBERS(unitId));

    return { success: true };
  } catch {
    return { success: false, error: "Failed to remove user from unit" };
  }
}

/**
 * Authenticates that the current user is OWNER or ADMIN of the company.
 */
async function authenticateAsOwnerOrAdmin(companyId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, companyId: true },
  });

  if (!user || user.companyId !== companyId) {
    throw new Error("Access denied. You must be a member of this company.");
  }

  if (user.role !== Role.OWNER && user.role !== Role.ADMIN) {
    throw new Error("Access denied. Only OWNER and ADMIN can manage invitations.");
  }

  return user;
}

/**
 * Sends an invitation to join the company.
 * - Creates a Clerk invitation
 * - Creates an Invitation record in the database
 * - Enforces plan limits and subscription status
 */
export async function sendInvitation(params: {
  email: string;
  role: "ADMIN" | "USER";
  companyId: string;
  unitId?: string;
}) {
  try {
    const validated = sendInvitationSchema.parse(params);

    await authenticateAsOwnerOrAdmin(validated.companyId);

    await enforceActiveSubscription(validated.companyId);

    if (validated.role === "ADMIN") {
      await checkPlanLimit(validated.companyId, "users");
    } else {
      await checkPlanLimitForMembers(validated.companyId);
    }

    const existingInvitation = await db.invitation.findFirst({
      where: {
        email: validated.email,
        companyId: validated.companyId,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: "A pending invitation has already been sent to this email address.",
      };
    }

    const clerkInvitation = await clerkClient.invitations.createInvitation({
      emailAddress: validated.email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/company/sign-up`,
      publicMetadata: {
        role: validated.role,
        unitId: validated.unitId,
        companyId: validated.companyId,
      },
    });

    const invitation = await db.invitation.create({
      data: {
        email: validated.email,
        role: validated.role,
        companyId: validated.companyId,
        unitId: validated.unitId,
        clerkInvitationId: clerkInvitation.id,
        status: InvitationStatus.PENDING,
      },
    });

    updateTag(TAGS.COMPANY_INVITATIONS(validated.companyId));
    if (validated.unitId) {
      updateTag(TAGS.UNIT_INVITATIONS(validated.unitId));
    }

    return { success: true, invitation };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Send Invitation Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Cancels a pending invitation.
 * - Revokes the Clerk invitation
 * - Sets status to REJECTED
 */
export async function cancelInvitation(invitationId: string) {
  try {
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: { company: { select: { ownerId: true } } },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found." };
    }

    await authenticateAsOwnerOrAdmin(invitation.companyId);

    if (invitation.clerkInvitationId) {
      try {
        await clerkClient.invitations.revokeInvitation(invitation.clerkInvitationId);
      } catch (clerkError) {
        console.warn("[Queries] Clerk revocation warning:", clerkError);
      }
    }

    await db.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REJECTED },
    });

    updateTag(TAGS.INVITATION(invitationId));
    updateTag(TAGS.COMPANY_INVITATIONS(invitation.companyId));
    if (invitation.unitId) {
      updateTag(TAGS.UNIT_INVITATIONS(invitation.unitId));
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Cancel Invitation Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Resends a pending invitation via Clerk.
 */
export async function resendInvitation(invitationId: string) {
  try {
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found." };
    }

    await authenticateAsOwnerOrAdmin(invitation.companyId);

    if (invitation.status !== InvitationStatus.PENDING) {
      return { success: false, error: "Only pending invitations can be resent." };
    }

    if (!invitation.clerkInvitationId) {
      return { success: false, error: "Clerk invitation ID not found." };
    }

    await clerkClient.invitations.revokeInvitation(invitation.clerkInvitationId);

    const newClerkInvitation = await clerkClient.invitations.createInvitation({
      emailAddress: invitation.email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/company/sign-up`,
      publicMetadata: {
        role: invitation.role,
        unitId: invitation.unitId,
        companyId: invitation.companyId,
      },
    });

    await db.invitation.update({
      where: { id: invitationId },
      data: { clerkInvitationId: newClerkInvitation.id },
    });

    updateTag(TAGS.INVITATION(invitationId));
    updateTag(TAGS.COMPANY_INVITATIONS(invitation.companyId));

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Resend Invitation Error:", message);
    return { success: false, error: message };
  }
}

// ============================================================================
// M08 - Project Team Management Server Actions
// ============================================================================

const teamMemberSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  userId: z.string().min(1, "User ID is required"),
  role: z.string().min(1, "Role is required"),
});

/**
 * Helper to create a TEAM notification when a user is added to a project.
 */
async function createTeamAddedNotification(
  targetUserId: string,
  projectName: string,
  role: string,
  addedByName: string,
  companyId: string
) {
  await db.notification.create({
    data: {
      notification: `${addedByName} has added you to the project "${projectName}" as ${role}.`,
      type: NotificationType.TEAM,
      read: false,
      companyId,
      userId: targetUserId,
      targetUserId,
    },
  });
}

/**
 * Authenticates that the current user is ADMIN of the unit or OWNER of the company.
 */
async function authenticateProjectTeamAdmin(projectId: string) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) {
    throw new Error("Unauthorized");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { 
      unitId: true,
      unit: {
        select: {
          companyId: true,
          adminId: true,
          company: {
            select: { ownerId: true }
          }
        }
      }
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const isOwner = project.unit.company.ownerId === currentUserId;
  const isAdmin = project.unit.adminId === currentUserId;

  if (!isOwner && !isAdmin) {
    throw new Error("Access denied. Only ADMIN or OWNER can manage project team members.");
  }

  return {
    userId: currentUserId,
    companyId: project.unit.companyId,
    isOwner,
    isAdmin,
  };
}

/**
 * Fetches the team members for a project.
 * Includes user details (avatar, name, email).
 */
export async function getProjectTeam(projectId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  async function fetchData() {
    "use cache";
    cacheTag(TAGS.PROJECT_TEAM(projectId));
    cacheLife("minutes");

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        unitId: true,
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) return null;

    // Return members directly
    return project.team?.members.map((tm) => ({
      id: tm.id,
      role: tm.role,
      userId: tm.user.id,
      userName: tm.user.name,
      userEmail: tm.user.email,
      userAvatar: tm.user.avatarUrl,
      createdAt: tm.createdAt,
    })) || [];
  }

  return fetchData();
}

/**
 * Adds a user to the project's team with a specified role.
 * - Validates user is ADMIN of unit or OWNER of company
 * - Checks user is a member of the unit
 * - Creates Team if it doesn't exist
 * - Creates TeamMember record
 * - Sends TEAM notification to the added user
 * - Invalidates cache
 */
export async function addTeamMember(params: {
  projectId: string;
  userId: string;
  role: string;
}) {
  try {
    const validated = teamMemberSchema.parse(params);

    // Authenticate as admin/owner
    const { userId: currentUserId, companyId } = await authenticateProjectTeamAdmin(validated.projectId);

    // Get current user name for notification
    const currentUser = await db.user.findUnique({
      where: { id: currentUserId },
      select: { name: true },
    });
    const addedByName = currentUser?.name || "Someone";

    // Verify project exists and get project name
    const project = await db.project.findUnique({
      where: { id: validated.projectId },
      select: { name: true, unitId: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Verify target user is a member of the unit
    const targetUser = await db.user.findUnique({
      where: { id: validated.userId },
      select: { name: true, unitId: true },
    });

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    if (targetUser.unitId !== project.unitId) {
      return { success: false, error: "User must be a member of this unit to be added to the project team" };
    }

    // Get or create Team for the project
    let team = await db.team.findUnique({
      where: { projectId: validated.projectId },
    });

    if (!team) {
      team = await db.team.create({
        data: { projectId: validated.projectId },
      });
    }

    // Check if user is already a team member
    const existingMember = await db.teamMember.findFirst({
      where: {
        teamId: team.id,
        userId: validated.userId,
      },
    });

    if (existingMember) {
      return { success: false, error: "User is already a member of this project team" };
    }

    // Create the team member
    await db.teamMember.create({
      data: {
        role: validated.role,
        teamId: team.id,
        userId: validated.userId,
      },
    });

    // Send notification to the added user
    await createTeamAddedNotification(
      validated.userId,
      project.name,
      validated.role,
      addedByName,
      companyId
    );

    // Invalidate cache
    updateTag(TAGS.PROJECT_TEAM(validated.projectId));
    updateTag(TAGS.USER_PROJECTS(validated.userId));
    updateTag(TAGS.UNIT(project.unitId));

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Add Team Member Error:", message);
    return { success: false, error: message };
  }
}

/**
 * Removes a user from the project's team.
 * - Validates user is ADMIN of unit or OWNER of company
 * - Removes TeamMember record
 * - Invalidates cache
 */
export async function removeTeamMember(projectId: string, userId: string) {
  try {
    // Authenticate as admin/owner
    const { companyId } = await authenticateProjectTeamAdmin(projectId);

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { name: true, unitId: true },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Find the team
    const team = await db.team.findUnique({
      where: { projectId },
    });

    if (!team) {
      return { success: false, error: "Team not found for this project" };
    }

    // Find and remove the team member
    const member = await db.teamMember.findFirst({
      where: {
        teamId: team.id,
        userId,
      },
    });

    if (!member) {
      return { success: false, error: "User is not a member of this project team" };
    }

    await db.teamMember.delete({
      where: { id: member.id },
    });

    // Invalidate cache
    updateTag(TAGS.PROJECT_TEAM(projectId));
    updateTag(TAGS.USER_PROJECTS(userId));
    updateTag(TAGS.UNIT(project.unitId));

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Remove Team Member Error:", message);
    return { success: false, error: message };
  }
}
