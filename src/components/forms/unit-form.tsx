"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createUnit, updateUnit, getEligibleAdmins } from "@/lib/queries";
import { Loader2, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Schema for unit form
const unitFormSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  adminId: z.string().min(1, "Admin assignment is required"),
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

interface EligibleAdmin {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

interface UnitFormProps {
  companyId: string;
  unit?: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    adminId: string;
  };
  trigger?: React.ReactNode;
}

export function UnitForm({ companyId, unit, trigger }: UnitFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleAdmins, setEligibleAdmins] = useState<EligibleAdmin[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const router = useRouter();
  
  const isEdit = !!unit;
  const title = isEdit ? "Edit Unit" : "Create New Unit";
  const description = isEdit 
    ? "Update the unit details below." 
    : "Add a new operational unit to your company.";

  // Load eligible admins when dialog opens (for create mode)
  useEffect(() => {
    if (open && !isEdit) {
      setIsLoadingAdmins(true);
      getEligibleAdmins(companyId)
        .then(setEligibleAdmins)
        .catch(console.error)
        .finally(() => setIsLoadingAdmins(false));
    }
  }, [open, isEdit, companyId]);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: unit?.name || "",
      address: unit?.address || "",
      phone: unit?.phone || "",
      email: unit?.email || "",
      adminId: unit?.adminId || "",
    },
  });

  const onSubmit = async (values: UnitFormValues) => {
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (isEdit) {
        result = await updateUnit(unit.id, values);
      } else {
        result = await createUnit(companyId, values);
      }
      
      if (result.success) {
        toast.success(isEdit ? "Unit updated successfully" : "Unit created successfully");
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Construction Division A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="unit@company.com" type="email" {...field} />
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
                      <Input placeholder="+213 555 123 456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Unit address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isEdit && (
              <FormField
                control={form.control}
                name="adminId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Admin *</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        disabled={isLoadingAdmins}
                      >
                        <option value="">
                          {isLoadingAdmins ? "Loading..." : "Select an admin..."}
                        </option>
                        {eligibleAdmins.map((admin) => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name || admin.email}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || (isLoadingAdmins && !isEdit)}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Create Unit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
