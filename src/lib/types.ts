import { Prisma } from '@prisma/client'

export type UnitWithDetails = Prisma.UnitGetPayload<{
  include: {
    admin: true
    company: true
  }
}>

export type ProjectWithDetails = Prisma.ProjectGetPayload<{
  include: {
    client: true
    phases: {
      include: {
        subPhases: true
        product: true
      }
    }
    team: {
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    }
  }
}>

export type ProjectWithPhases = Prisma.ProjectGetPayload<{
  include: {
    phases: true
  }
}>

export type PhaseWithDetails = Prisma.PhaseGetPayload<{
  include: {
    product: {
      include: {
        productions: true
      }
    }
    subPhases: true
  }
}>

export type TaskWithDetails = Prisma.TaskGetPayload<{
  include: {
    assignedUser: true
    tags: true
  }
}>

export type LaneWithTasks = Prisma.LaneGetPayload<{
  include: {
    tasks: {
      include: {
        assignedUser: true
        tags: true
      }
    }
  }
}>

export type UserWithDetails = Prisma.UserGetPayload<{
  include: {
    unit: true
    company: true
  }
}>

export type CompanyWithDetails = Prisma.CompanyGetPayload<{
  include: {
    units: true
    subscriptions: true
  }
}>

export interface CompanyOnboardingData {
  name: string
  email?: string
  logoUrl?: string
  formJur?: string
  nif?: string
  sector?: string
  state?: string
  address?: string
  phone?: string
}

export interface UnitOnboardingData {
  name: string
  address?: string
  phone?: string
  email?: string
}

export interface TeamInviteData {
  email: string
  role: 'ADMIN' | 'USER'
}

export type CompanyDashboardData = Prisma.CompanyGetPayload<{
  include: {
    units: {
      include: {
        _count: {
          select: {
            projects: true
            users: true
          }
        }
      }
    }
    subscriptions: {
      include: {
        plan: true
      }
    }
  }
}>


export interface BillingData {
  company: Prisma.CompanyGetPayload<{
    include: {
      subscriptions: {
        include: { plan: true }
      }
      _count: {
        select: {
          units: true
          users: true
        }
      }
    }
  }>
  subscription: (Prisma.SubscriptionGetPayload<{ include: { plan: true } }>) | null
  plans: Prisma.PlanGetPayload<object>[]
  usage: {
    units: number
    projects: number
    members: number
    tasks: number
  }
}
