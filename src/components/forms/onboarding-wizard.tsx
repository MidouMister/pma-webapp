"use client";

import { atom } from "jotai";
import { useAtomValue } from "jotai";
import { OnboardingStepCompany } from "./onboarding-step-company";
import { OnboardingStepUnit } from "./onboarding-step-unit";
import { OnboardingStepInvite } from "./onboarding-step-invite";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

export const onboardingStepAtom = atom<1 | 2 | 3>(1);

export interface CompanyData {
  name: string;
  logoUrl?: string;
  formJur?: string;
  nif?: string;
  sector?: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UnitData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface InviteData {
  invites: Array<{ email: string; role: "ADMIN" | "USER" }>;
}

export const onboardingCompanyAtom = atom<CompanyData | null>(null);
export const onboardingUnitAtom = atom<UnitData | null>(null);
export const onboardingInviteAtom = atom<InviteData | null>(null);

const steps = [
  { id: 1, name: "Company Profile" },
  { id: 2, name: "First Unit" },
  { id: 3, name: "Invite Team" },
];

export function OnboardingWizard() {
  const currentStep = useAtomValue(onboardingStepAtom);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Stepper */}
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li
              key={step.name}
              className={`relative ${
                stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
              }`}
            >
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div
                  className={`h-0.5 w-full ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  currentStep > step.id
                    ? "border-primary bg-primary"
                    : currentStep === step.id
                    ? "border-primary bg-background"
                    : "border-muted bg-background"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                ) : (
                  <span
                    className={`text-sm font-medium ${
                      currentStep === step.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              <span className="hidden sm:block absolute top-10 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                {step.name}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Form Content Shell */}
      <div className="mt-12 p-8 backdrop-blur-xl bg-background/50 border rounded-3xl shadow-xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingStepCompany />
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingStepUnit />
            </motion.div>
          )}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingStepInvite />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
