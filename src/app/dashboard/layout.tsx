"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Radio, Wand2, Calendar, Settings, User, LogOut, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Radio, label: "Live Trends", href: "/dashboard/trends" },
  { icon: Wand2, label: "Video Remix", href: "/dashboard/remix" },
  { icon: Calendar, label: "Content Calendar", href: "/dashboard/calendar" },
  { icon: BarChart3, label: "Social Insights", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col glass-dark">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary glow flex items-center justify-center font-bold italic">
              SM
            </div>
            <span className="font-bold text-xl tracking-tight">Autopilot</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(99,102,241,0.1)] border border-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass border-white/5 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Business Owner</p>
              <p className="text-[10px] text-muted-foreground truncate">Premium Plan</p>
            </div>
            <LogOut size={14} className="text-muted-foreground group-hover:text-white transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05)_0%,transparent_50%)]">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 glass sticky top-0 z-20">
          <h1 className="text-sm font-medium text-muted-foreground capitalize">
            {pathname.split("/").pop() || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online
            </div>
            <button className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
              <User size={16} />
            </button>
          </div>
        </header>

        <div className="p-8 pb-20 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
