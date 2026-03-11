"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { sendInvitation, getCompanyUnits } from "@/lib/queries";
import { Loader2, MailPlus } from "lucide-react";

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "USER"]),
  unitId: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface Unit {
  id: string;
  name: string;
}

interface InviteMemberFormProps {
  companyId: string;
  trigger?: React.ReactNode;
}

export function InviteMemberForm({ companyId, trigger }: InviteMemberFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  const loadUnits = async () => {
    setIsLoadingUnits(true);
    try {
      const fetchedUnits = await getCompanyUnits(companyId);
      setUnits(fetchedUnits);
    } catch (error) {
      console.error("Failed to load units:", error);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && units.length === 0 && !isLoadingUnits) {
      loadUnits();
    }
  };

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "USER",
      unitId: undefined,
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    setIsSubmitting(true);

    try {
      const result = await sendInvitation({
        email: values.email,
        role: values.role,
        companyId,
        unitId: values.unitId,
      });

      if (result.success) {
        toast.success("Invitation sent successfully");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.error || "Failed to send invitation");
      }
    } catch {
      toast.error("An error occurred while sending invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailPlus className="h-5 w-5 text-primary" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your company. The invitee will receive an email to sign up.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="colleague@company.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Unit</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No unit assigned</SelectItem>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingUnits}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
