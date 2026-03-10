/**
 * Single source of truth for ALL cache tags and cacheLife profiles.
 */

// Cache Tags
export const TAGS = {
  COMPANY: (id: string) => `company:${id}`,
  UNIT: (id: string) => `unit:${id}`,
  PROJECT: (id: string) => `project:${id}`,
  TEAM: (id: string) => `team:${id}`,
  TASK: (id: string) => `task:${id}`,
  USER: (id: string) => `user:${id}`,
  CLIENT: (id: string) => `client:${id}`,
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  ACTIVITY: (id: string) => `activity:${id}`,
} as const;

// Cache Life Profiles
// Note: These follow the Next.js 16 cacheLife primitives
export const CACHE_PROFILES = {
  STATIC: "static", // Indefinite until revalidated
  DAYS: "days", // 24h
  HOURS: "hours", // 1h
  MINUTES: "minutes", // 1m
  FAST: "fast", // 15s
} as const;
