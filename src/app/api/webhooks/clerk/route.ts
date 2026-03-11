import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { InvitationStatus } from '@prisma/client'

async function createInvitationAcceptedNotification(
  companyId: string,
  invitedUserEmail: string,
  invitedUserName: string
) {
  try {
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { ownerId: true, name: true },
    })

    if (company) {
      await db.notification.create({
        data: {
          notification: `${invitedUserName} (${invitedUserEmail}) has accepted your invitation and joined ${company.name}.`,
          type: 'INVITATION',
          companyId,
          userId: company.ownerId,
          read: false,
        },
      })
    }
  } catch (e) {
    console.error('[Webhook] Failed to create invitation accepted notification:', e)
  }
}

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    
    // Fallbacks
    const primaryEmail = email_addresses?.length > 0 ? email_addresses[0].email_address : ''
    const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User'
    
    // Normalize email for case-insensitive lookup
    const normalizedEmail = primaryEmail.toLowerCase()

    try {
      // Check if this user was invited (only for user.created)
      let invitation = null
      if (eventType === 'user.created') {
        invitation = await db.invitation.findFirst({
          where: {
            email: normalizedEmail,
            status: InvitationStatus.PENDING,
          },
          include: {
            company: { select: { ownerId: true, name: true } },
            unit: { select: { id: true, name: true } },
          },
        })
      }

      if (invitation) {
        // Update invitation status to ACCEPTED
        await db.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.ACCEPTED },
        })

        // Create user with companyId, unitId, and role from invitation
        await db.user.upsert({
          where: { id },
          create: {
            id,
            email: primaryEmail,
            name: fullName,
            avatarUrl: image_url || null,
            companyId: invitation.companyId,
            unitId: invitation.unitId,
            role: invitation.role,
          },
          update: {
            email: primaryEmail,
            name: fullName,
            avatarUrl: image_url || null,
            companyId: invitation.companyId,
            unitId: invitation.unitId,
            role: invitation.role,
          },
        })

        // Create notification for the company owner
        await createInvitationAcceptedNotification(
          invitation.companyId,
          primaryEmail,
          fullName
        )

        console.log(`[Webhook] User ${id} created via invitation to unit ${invitation.unitId}`)
      } else {
        // Default behavior: create as USER without company/unit
        await db.user.upsert({
          where: { id },
          create: {
            id,
            email: primaryEmail,
            name: fullName,
            avatarUrl: image_url || null,
            role: 'USER',
          },
          update: {
            email: primaryEmail,
            name: fullName,
            avatarUrl: image_url || null,
          },
        })
        console.log(`[Webhook] User ${id} synchronized.`)
      }
    } catch (e) {
      console.error(`[Webhook] Failed to synchronize user ${id}:`, e)
      return new Response('Database Error', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    if (id) {
      try {
        await db.user.delete({
          where: { id }
        })
        console.log(`[Webhook] User ${id} deleted.`)
      } catch (e) {
        if (e instanceof Error) {
          console.log(`[Webhook] User ${id} not found in database or failed to delete. ${e.message}`)
        } else {
          console.log(`[Webhook] User ${id} not found in database or failed to delete.`)
        }
      }
    }
  }

  return new Response('', { status: 200 })
}
