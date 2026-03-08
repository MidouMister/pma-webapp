"use server";

import { db } from "./db";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { CompanyOnboardingData, UnitOnboardingData, TeamInviteData } from "./types";
import { Role } from "@prisma/client";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

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
    const result = await db.$transaction(async (tx) => {
      // 1. Get the Starter plan for initial subscription
      const starterPlan = await tx.plan.findUnique({
        where: { name: "Starter" },
      });

      if (!starterPlan) {
        throw new Error("Starter plan not found in database. Please run seeding.");
      }

      // 2. Create the Company
      const newCompany = await tx.company.create({
        data: {
          name: company.name,
          companyEmail: company.email,
          logo: company.logoUrl,
          formJur: company.formJur,
          nif: company.nif,
          secteur: company.sector,
          ownerId: userId,
        },
      });

      // 3. Update the User with the new companyId and set their role to OWNER
      await tx.user.update({
        where: { id: userId },
        data: {
          companyId: newCompany.id,
          role: Role.OWNER,
        },
      });

      // 4. Create the first Unit and assign user as its admin
      const newUnit = await tx.unit.create({
        data: {
          name: unit.name,
          address: unit.address,
          phone: unit.phone,
          email: unit.email,
          companyId: newCompany.id,
          adminId: userId,
        },
      });

      // 5. Create a 2-month Starter trial subscription
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

      // 6. Handle Team Invitations in DB
      if (invites && invites.length > 0) {
        // First create invitations in DB
        const dbInvitations = await Promise.all(
          invites.map(async (invite) => {
            return tx.invitation.create({
              data: {
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
            const clerkInvitation = await clerkClient.invitations.createInvitation({
              emailAddress: inv.email,
              redirectUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/company/sign-up`,
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
          } catch (clerkError) {
            console.error(`[Queries] Failed to send Clerk invitation to ${inv.email}:`, clerkError);
          }
        })
      );
    }

    // 8. Update Clerk User Metadata for fast redirection in middleware
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: Role.OWNER,
        companyId: result.companyId,
      },
    });

    return { success: true, companyId: result.companyId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("[Queries] Onboarding Error:", message);
    return { success: false, error: message };
  }
}
