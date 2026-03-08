"use client";

import { cn } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import { sidebarCollapsedAtom, navigationContextAtom } from "@/store/atoms";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Building2, 
  Boxes, 
  Users, 
  Settings, 
  FileText,
  BarChart3,
  Calendar,
  Contact2,
  ListTodo,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { ReactNode } from "react";
import { ModeSwitcher } from "./mode-switcher";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
}

function SidebarItem({ icon, label, href, active, collapsed }: SidebarItemProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 4 }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
          active 
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        <div className={cn("min-w-[20px] transition-transform", active && "scale-110")}>
          {icon}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
            {label}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const context = useAtomValue(navigationContextAtom);
  const pathname = usePathname();
  const { user } = useUser();

  // Define menu items per context
  const companyItems = [
    { icon: <LayoutDashboard size={20} />, label: "Overview", href: "/company/dashboard" },
    { icon: <Building2 size={20} />, label: "Profile", href: "/company/settings" },
    { icon: <Boxes size={20} />, label: "Units", href: "/company/units" },
    { icon: <Users size={20} />, label: "Team", href: "/company/team" },
    { icon: <BarChart3 size={20} />, label: "Financials", href: "/company/billing" },
  ];

  const unitItems = [
    { icon: <LayoutDashboard size={20} />, label: "Unit Dash", href: "/unite/dashboard" },
    { icon: <FileText size={20} />, label: "Projects", href: "/unite/projects" },
    { icon: <Contact2 size={20} />, label: "Clients", href: "/unite/clients" },
    { icon: <ListTodo size={20} />, label: "Tasks", href: "/unite/tasks" },
    { icon: <Users size={20} />, label: "Unit Team", href: "/unite/team" },
  ];

  const userItems = [
    { icon: <LayoutDashboard size={20} />, label: "My Workspace", href: "/user/dashboard" },
    { icon: <ListTodo size={20} />, label: "My Tasks", href: "/user/tasks" },
    { icon: <Timer size={20} />, label: "Time Tracking", href: "/user/time" },
    { icon: <Calendar size={20} />, label: "Schedule", href: "/user/calendar" },
  ];

  const getMenuItems = () => {
    switch (context) {
      case "COMPANY": return companyItems;
      case "UNIT": return unitItems;
      case "USER": return userItems;
      default: return companyItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: collapsed ? "80px" : "260px" 
      }}
      className={cn(
        "h-screen fixed left-0 top-0 z-40 bg-card/60 backdrop-blur-xl border-r border-border/40 flex flex-col transition-all duration-300 ease-in-out",
        "shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)]"
      )}
    >
      <div className="p-4 flex items-center justify-between h-16 shrink-0 transition-all">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20">
                P
              </div>
              <span className="font-bold text-xl tracking-tighter">PMA</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-xl hover:bg-accent/50 text-muted-foreground"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="px-3 mb-6 shrink-0 mt-4">
        <ModeSwitcher collapsed={collapsed} />
      </div>

      <div className="flex-1 px-3 space-y-1.5 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-2">
          {!collapsed && "Main Navigation"}
        </div>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={pathname.startsWith(item.href)}
          />
        ))}
      </div>

      <div className="p-3 space-y-1.5 mb-2 shrink-0 border-t border-border/40 pt-4">
        <SidebarItem
          icon={<Settings size={20} />}
          label="Settings"
          href="/settings"
          collapsed={collapsed}
          active={pathname.startsWith("/settings")}
        />
        
        <div className={cn(
          "mt-4 p-2.5 rounded-2xl bg-muted/30 border border-border/40 flex items-center gap-3 transition-colors hover:bg-muted/50",
          collapsed ? "justify-center px-0 bg-transparent border-none" : "px-3"
        )}>
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8 rounded-xl shadow-md border-2 border-primary/20 hover:border-primary/40 transition-all",
                userButtonTrigger: "focus:shadow-none"
              }
            }}
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold truncate leading-none mb-1">
                {user?.fullName || "Guest Account"}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-widest font-black opacity-80 w-fit">
                {user?.publicMetadata?.role as string || "MEMBER"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
