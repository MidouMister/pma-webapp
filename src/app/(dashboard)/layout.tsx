"use client";

import { Sidebar } from "@/components/global/sidebar";
import { Header } from "@/components/global/header";
import { useAtomValue } from "jotai";
import { sidebarCollapsedAtom } from "@/store/atoms";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed = useAtomValue(sidebarCollapsedAtom);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar - fixed position navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - fixed top navigation */}
        <Header />

        {/* Dynamic Page Content */}
        <motion.main
          animate={{ 
            marginLeft: collapsed ? "80px" : "260px" 
          }}
          className={cn(
            "flex-1 pt-16 transition-all duration-300 ease-in-out px-6 py-6 overflow-y-auto no-scrollbar",
            "bg-[radial-gradient(ellipse_at_top_right,var(--primary-foreground)_0%,transparent_50%)]",
            "dark:bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary-rgb),0.05)_0%,transparent_50%)]"
          )}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
