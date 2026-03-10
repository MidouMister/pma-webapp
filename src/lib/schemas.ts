import { z } from "zod";

export const companyUpdateSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  companyEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  nif: z.string().optional(),
  formJur: z.string().optional(),
  secteur: z.string().optional(),
  logo: z.string().optional(),
});

export const upgradeRequestSchema = z.object({
  planId: z.string().min(1, "Please select a plan"),
  companyName: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number is required"),
  paymentMethod: z.enum(["virement", "cheque", "contrat"]),
  message: z.string().optional(),
});
