"use client";

import { useAtomValue } from "jotai";
import { sidebarCollapsedAtom } from "@/store/atoms";
import { cn } from "@/lib/utils";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

import { DashboardBreadcrumbs } from "./breadcrumbs";

export function Header() {
  const collapsed = useAtomValue(sidebarCollapsedAtom);

  return (
    <motion.header
      animate={{ 
        marginLeft: collapsed ? "80px" : "260px",
        width: `calc(100% - ${collapsed ? "80px" : "260px"})`
      }}
      className={cn(
        "h-16 fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out",
        "bg-background/40 backdrop-blur-md border-b border-border/40 px-6 flex items-center justify-between"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger could be here */}
        
        <DashboardBreadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative group hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Quick Search (Ctrl + K)" 
            className="w-64 h-9 pl-9 bg-accent/20 border-border/30 rounded-xl focus-visible:ring-primary/20 transition-all focus-visible:ring-offset-0 focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/40 relative group">
            <Bell size={20} className="text-muted-foreground transition-colors group-hover:text-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background shadow-lg" />
          </Button>
          
          <Badge variant="outline" className="h-8 rounded-xl px-3 font-bold border-primary/20 bg-primary/5 text-primary text-[10px] hidden sm:flex">
            PRO TRIAL
          </Badge>
        </div>
      </div>
    </motion.header>
  );
}
