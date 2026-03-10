"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { UploadDropzone } from "@/lib/uploadthing";
import { Save, ImagePlus, X, Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { updateCompany } from "@/lib/queries";
import { companyUpdateSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";

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

interface CompanySettingsFormProps {
  company: {
    id: string;
    name: string;
    companyEmail: string | null;
    logo: string | null;
    nif: string | null;
    formJur: string | null;
    secteur: string | null;
  };
}

export function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(company.logo || undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof companyUpdateSchema>>({
    resolver: zodResolver(companyUpdateSchema),
    defaultValues: {
      name: company.name,
      companyEmail: company.companyEmail || "",
      nif: company.nif || "",
      formJur: company.formJur || "",
      secteur: company.secteur || "",
      logo: company.logo || "",
    },
  });

  async function onSubmit(values: z.infer<typeof companyUpdateSchema>) {
    setIsSubmitting(true);
    try {
      const result = await updateCompany(company.id, {
        ...values,
        logo: logoUrl,
      });

      if (result.success) {
        router.refresh();
        // Feedback via console for now as toast is not standard yet
        console.log("Company updated successfully");
      } else {
        console.error("Update failed:", result.error);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Logo Section */}
          <Card className="glass-morphism border-white/5 bg-white/2">
            <CardHeader>
              <CardTitle className="text-lg">Brand Identity</CardTitle>
              <CardDescription>Update your company logo and public branding.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                {logoUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-32 h-32 rounded-2xl overflow-hidden border border-border/50 group shadow-xl"
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
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="w-full">
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
                          "border-dashed border-2 border-border/40 bg-muted/10 rounded-2xl p-8 hover:border-primary/40 transition-colors cursor-pointer w-full h-32",
                        label: "text-muted-foreground text-sm",
                        allowedContent: "text-muted-foreground/60 text-xs",
                        button: "hidden",
                      }}
                      content={{
                        uploadIcon: <ImagePlus className="w-8 h-8 text-muted-foreground/40 mb-2" />,
                        label: "Upload new logo",
                        allowedContent: "PNG, JPG up to 4MB",
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* General Information */}
          <Card className="glass-morphism border-white/5 bg-white/2">
            <CardHeader>
              <CardTitle className="text-lg">General Information</CardTitle>
              <CardDescription>Core company details used for invoices and reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Corp"
                          {...field}
                          className="bg-muted/10 border-border/40 focus:border-primary/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Official Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="contact@acme.dz"
                          type="email"
                          {...field}
                          className="bg-muted/10 border-border/40 focus:border-primary/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <SelectTrigger className="bg-muted/10 border-border/40 focus:border-primary/60">
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
                      <FormLabel>NIF (Fiscal ID)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000XXXXXXXXXXXX"
                          {...field}
                          className="bg-muted/10 border-border/40 focus:border-primary/60"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="secteur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Sector</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted/10 border-border/40 focus:border-primary/60">
                          <SelectValue placeholder="Select your industry" />
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="glass-morphism border-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
