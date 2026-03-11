"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSetAtom, useAtomValue } from "jotai";
import {
  onboardingStepAtom,
  onboardingCompanyAtom,
  onboardingUnitAtom,
} from "./onboarding-wizard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plus, Trash2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const inviteSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email("Invalid email address"),
      role: z.enum(["ADMIN", "USER"]),
    })
  ),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function OnboardingStepInvite() {
  const router = useRouter();
  const setStep = useSetAtom(onboardingStepAtom);
  const setCompanyData = useSetAtom(onboardingCompanyAtom);
  const setUnitData = useSetAtom(onboardingUnitAtom);

  const companyData = useAtomValue(onboardingCompanyAtom);
  const unitData = useAtomValue(onboardingUnitAtom);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invites: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invites",
  });

  async function handleFinish(values: InviteFormValues) {
    if (!companyData || !unitData) {
        setError("Missing company or unit data. Please go back and complete the previous steps.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await completeOnboarding({
        company: companyData,
        unit: unitData,
        invites: values.invites,
      });

      if (result?.success && result.companyId) {
        // Clear onboarding state on success
        setCompanyData(null);
        setUnitData(null);
        setStep(1);
        
        // Ensure localStorage is cleanly wiped (Jotai might just serialize 'null' or '1' otherwise)
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("onboarding_step");
          window.localStorage.removeItem("onboarding_company");
          window.localStorage.removeItem("onboarding_unit");
          window.localStorage.removeItem("onboarding_invite");
        }
        
        router.push(`/company/${result.companyId}`);
      } else {
        setError(result?.error || "Failed to complete onboarding - please try again");
        console.error("Failed to complete onboarding:", result?.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      setError(errorMessage);
      console.error("[Queries] Onboarding Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Invite Team</h2>
          <p className="text-sm text-muted-foreground">Add early team members to your first unit (Optional)</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Onboarding Error</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-2 text-xs opacity-70">
                    If this persists, try refreshing the page or checking your internet connection.
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFinish)} className="space-y-6">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-end gap-3 p-3 rounded-2xl border border-border/40 bg-muted/10 group relative overflow-hidden"
                >
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name={`invites.${index}.email`}
                      render={({ field }) => (
                        <FormItem className="col-span-2 lg:col-span-3">
                          <FormLabel className="text-xs">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="colleague@acme.dz"
                              {...field}
                              className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`invites.${index}.role`}
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-xs">Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors h-9">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USER">User</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg group-hover:opacity-100 transition-opacity"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2 rounded-xl py-5 border-dashed border-2 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
            onClick={() => append({ email: "", role: "USER" })}
          >
            <Plus className="w-4 h-4" />
            Add team member
          </Button>

          <div className="flex justify-between items-center pt-6 border-t border-border/40 mt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={isLoading}
              onClick={() => setStep(2)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Step
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="relative rounded-xl px-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Provisioning...
                </>
              ) : (
                "Finish & Create Dashboard"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
