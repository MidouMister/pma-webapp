import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as Algerian Dinar (DA) following FR locale rules.
 * Format: 1 234 567,89 DA
 */
export function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    currencyDisplay: "code",
  }).format(amount)
    .replace("DZD", "DA")
    .trim();
}

/**
 * Formats a date to DD MMM YYYY (e.g., 15 Jan 2026).
 */
export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
