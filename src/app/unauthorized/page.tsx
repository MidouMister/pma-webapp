"use client";

import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to view this resource. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild className="rounded-xl">
            <Link href="/site">View Marketing Site</Link>
          </Button>
        </div>

        <div className="pt-8 border-t border-border/40">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-50">
            Security Protocol 403
          </p>
        </div>
      </motion.div>
    </div>
  );
}
