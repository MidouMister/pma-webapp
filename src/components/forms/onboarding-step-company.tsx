"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSetAtom } from "jotai";
import {
  onboardingStepAtom,
  onboardingCompanyAtom,
  type CompanyData,
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
import { UploadDropzone } from "@/lib/uploadthing";
import { Building2, ArrowRight, ImagePlus, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  nif: z.string().optional(),
  formJur: z.string().optional(),
  sector: z.string().optional(),
  state: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const algerianStates = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
  "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
  "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda",
  "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem",
  "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi",
  "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla",
  "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun",
  "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah",
  "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa",
];

const legalForms = [
  "SARL", "SPA", "SNC", "EURL", "Auto-entrepreneur", "GIE", "SCS", "SCA",
];

const sectors = [
  "Construction & BTP", "Technologie & IT", "Commerce & Distribution",
  "Industrie & Manufacturing", "Services & Consulting", "Santé & Pharma",
  "Éducation & Formation", "Agriculture & Agroalimentaire",
  "Énergie & Mines", "Transport & Logistique", "Immobilier",
  "Finance & Assurance", "Tourisme & Hôtellerie", "Autre",
];

export function OnboardingStepCompany() {
  const setStep = useSetAtom(onboardingStepAtom);
  const setCompanyData = useSetAtom(onboardingCompanyAtom);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      nif: "",
      formJur: "",
      sector: "",
      state: "",
    },
  });

  function onSubmit(values: CompanyFormValues) {
    const data: CompanyData = {
      ...values,
      logoUrl,
    };
    setCompanyData(data);
    setStep(2);
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Company Profile</h2>
          <p className="text-sm text-muted-foreground">
            Tell us about your organization
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Company Logo
            </label>
            {logoUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border/50 group"
              >
                <Image
                  src={logoUrl}
                  alt="Company logo"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setLogoUrl(undefined)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </motion.div>
            ) : (
              <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.ufsUrl) {
                    setLogoUrl(res[0].ufsUrl);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error.message);
                }}
                appearance={{
                  container:
                    "border-dashed border-2 border-border/40 bg-muted/20 rounded-2xl p-6 hover:border-primary/40 transition-colors cursor-pointer",
                  label: "text-muted-foreground text-sm",
                  allowedContent: "text-muted-foreground/60 text-xs",
                  button:
                    "bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg",
                  uploadIcon: "text-muted-foreground/50",
                }}
                content={{
                  uploadIcon: <ImagePlus className="w-8 h-8 text-muted-foreground/40" />,
                  label: "Drop your logo here or click to browse",
                  allowedContent: "PNG, JPG, SVG up to 4MB",
                }}
              />
            )}
          </div>

          {/* Row 1: Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Company Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Acme Corp"
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
                  <FormLabel>Company Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="contact@acme.dz"
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

          {/* Row 2: Legal Form + NIF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="formJur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal Form</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors">
                        <SelectValue placeholder="Select legal form" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {legalForms.map((lf) => (
                        <SelectItem key={lf} value={lf}>
                          {lf}
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
              name="nif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIF</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tax ID number"
                      {...field}
                      className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Sector + State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors">
                        <SelectValue placeholder="Select your sector" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sectors.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
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
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wilaya</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-muted/20 border-border/40 focus:border-primary/60 transition-colors">
                        <SelectValue placeholder="Select wilaya" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {algerianStates.map((w) => (
                        <SelectItem key={w} value={w}>
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 4: Address + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Full office address"
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
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
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
