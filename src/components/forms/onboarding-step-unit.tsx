"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSetAtom, useAtomValue } from "jotai";
import {
  onboardingStepAtom,
  onboardingUnitAtom,
  onboardingCompanyAtom,
  type UnitData,
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
import { Landmark, ArrowRight, ArrowLeft } from "lucide-react";

const unitSchema = z.object({
  name: z.string().min(2, "Unit name must be at least 2 characters"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type UnitFormValues = z.infer<typeof unitSchema>;

export function OnboardingStepUnit() {
  const setStep = useSetAtom(onboardingStepAtom);
  const setUnitData = useSetAtom(onboardingUnitAtom);
  const companyData = useAtomValue(onboardingCompanyAtom);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  function onSubmit(values: UnitFormValues) {
    const data: UnitData = { ...values };
    setUnitData(data);
    setStep(3);
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
          <Landmark className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">First Unit</h2>
          <p className="text-sm text-muted-foreground">
            {companyData?.name
              ? `Set up the first operational unit for ${companyData.name}`
              : "Set up your first operational unit"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Unit Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Unit Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Headquarters, Branch A, Production Site"
                    {...field}
                    className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row: Address + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Unit address"
                      {...field}
                      className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="unit@acme.dz"
                      type="email"
                      {...field}
                      className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+213 XXX XXX XXX"
                    {...field}
                    className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="gap-2 rounded-xl px-6"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              className="gap-2 rounded-xl px-8 font-semibold tracking-wide"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
