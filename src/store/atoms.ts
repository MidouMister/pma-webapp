import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Sidebar collapse state with persistence
export const sidebarCollapsedAtom = atomWithStorage<boolean>("pma_sidebar_collapsed", false);

// Current active context (Company, Unit, or Personal Profile)
export type NavigationContext = "COMPANY" | "UNIT" | "USER";
export const navigationContextAtom = atom<NavigationContext>("COMPANY");

// Global loading state for dashboard transitions
export const dashboardLoadingAtom = atom<boolean>(false);
