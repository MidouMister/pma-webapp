"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2, Boxes, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { navigationContextAtom, NavigationContext } from "@/store/atoms";

interface ModeSwitcherProps {
  collapsed?: boolean;
}

export function ModeSwitcher({ collapsed }: ModeSwitcherProps) {
  const [context, setContext] = useAtom(navigationContextAtom);
  
  const modes = [
    { value: "COMPANY" as NavigationContext, label: "Company View", icon: <Building2 className="w-4 h-4" /> },
    { value: "UNIT" as NavigationContext, label: "Active Unit", icon: <Boxes className="w-4 h-4" /> },
    { value: "USER" as NavigationContext, label: "My Workspace", icon: <User className="w-4 h-4" /> },
  ];

  const currentMode = modes.find((m) => m.value === context) || modes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center gap-2 w-full p-2.5 rounded-xl border border-border/40 bg-accent/30 hover:bg-accent/50 transition-all outline-none",
          collapsed ? "justify-center px-0" : "px-3"
        )}>
          <div className="shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {currentMode.icon}
          </div>
          {!collapsed && (
            <div className="flex-1 flex flex-col items-start min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1 opacity-70">
                Navigation Scope
              </span>
              <span className="text-sm font-bold truncate pr-2">
                {currentMode.label}
              </span>
            </div>
          )}
          {!collapsed && <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-2xl bg-card/80 backdrop-blur-xl border-border/40 shadow-2xl" align="start" sideOffset={10}>
        <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest opacity-60">
          Switch Context
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40 mx-1" />
        {modes.map((mode) => (
          <DropdownMenuItem
            key={mode.value}
            onClick={() => setContext(mode.value)}
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer m-1",
              context === mode.value && "bg-primary/5 text-primary font-bold"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-1.5 rounded-lg", context === mode.value ? "bg-primary/20" : "bg-muted")}>
                {mode.icon}
              </div>
              <span>{mode.label}</span>
            </div>
            {context === mode.value && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border/40 mx-1" />
        <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl focus:bg-primary/10 m-1 text-muted-foreground">
          <Plus className="w-4 h-4" />
          <span>Add New Unit</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
