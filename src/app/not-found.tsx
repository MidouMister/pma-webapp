"use client";

import { Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-10"
      >
        <div className="relative inline-block">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full" 
          />
          <div className="relative w-32 h-32 rounded-[2.5rem] bg-accent/20 border border-border/40 backdrop-blur-xl flex items-center justify-center mx-auto mb-6 transform rotate-12 shadow-2xl">
            <Compass className="w-16 h-16 text-primary -rotate-12" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-8xl font-black tracking-tighter text-muted/20 absolute -top-12 left-1/2 -translate-x-1/2 -z-10 select-none">
            404
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Lost in progress?</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The resource you are looking for has been moved or deleted. Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="rounded-2xl h-14 border border-border/40 backdrop-blur-sm hover:bg-accent/40">
            <Link href="/site">View Site</Link>
          </Button>
        </div>

        <div className="pt-12 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30 select-none">
          Property Management Authority
        </div>
      </motion.div>
    </div>
  );
}
