"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upgradeRequestSchema } from "@/lib/schemas";
import { requestUpgrade } from "@/lib/queries";
import { Loader2, Send } from "lucide-react";

interface UpgradeRequestFormProps {
  companyId: string;
  plans: { id: string; name: string }[];
  selectedPlanId: string;
  initialData?: {
    companyName?: string;
    email?: string;
    phone?: string;
  };
  onSuccess?: () => void;
}

export function UpgradeRequestForm({
  companyId,
  plans,
  selectedPlanId,
  initialData,
  onSuccess,
}: UpgradeRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof upgradeRequestSchema>>({
    resolver: zodResolver(upgradeRequestSchema),
    defaultValues: {
      planId: selectedPlanId,
      companyName: initialData?.companyName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      paymentMethod: "virement",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof upgradeRequestSchema>) {
    setIsLoading(true);
    try {
      const result = await requestUpgrade(values, companyId);
      if (result.success) {
        toast.success("Upgrade request sent successfully!");
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to send request");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="planId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desired Plan</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="glass-morphism border-white/10">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="glass-morphism border-white/10">
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.name}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Payment Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="glass-morphism border-white/10">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="glass-morphism border-white/10">
                    <SelectItem value="virement">Bank Wire (Virement)</SelectItem>
                    <SelectItem value="cheque">Business Check (Chèque)</SelectItem>
                    <SelectItem value="contrat">Service Contract</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Algerian B2B payments are handled offline.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter company name"
                  className="glass-morphism border-white/10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    className="glass-morphism border-white/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+213 ..."
                    className="glass-morphism border-white/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Project Info (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your organization's specific needs..."
                  className="glass-morphism border-white/10 min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full relative overflow-hidden group py-6"
          disabled={isLoading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 group-hover:from-primary/30 group-hover:to-primary/50 transition-all duration-300" />
          <span className="relative flex items-center justify-center gap-2 font-semibold">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Upgrade Request
              </>
            )}
          </span>
        </Button>
      </form>
    </Form>
  );
}
