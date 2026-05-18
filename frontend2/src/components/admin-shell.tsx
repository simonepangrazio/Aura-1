"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  Bot,
  Building2,
  LayoutDashboard,
  LogOut,
  MonitorSmartphone,
  Network,
  Settings,
  Users,
  Workflow,
} from "lucide-react";

import type { UserInfo } from "@/lib/api";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tenants", label: "Tenants", icon: Building2 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/devices", label: "Devices", icon: MonitorSmartphone },
  { href: "/sessions", label: "Sessions", icon: Network },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/analytics", label: "Analytics", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  user,
  onLogout,
  children,
}: {
  user: UserInfo | null;
  onLogout: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black text-zinc-100 lg:flex">
      <aside className="border-b border-zinc-800 bg-zinc-950 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center border-b border-zinc-800 px-5">
          <div>
            <p className="text-sm font-semibold text-zinc-50">Beyond Platform</p>
            <p className="text-xs text-zinc-500">Global Admin</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100",
                  active && "bg-zinc-900 text-zinc-50",
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-800 p-3 lg:absolute lg:inset-x-0 lg:bottom-0">
          <div className="mb-3 rounded-lg border border-zinc-800 bg-black p-3">
            <p className="truncate text-sm text-zinc-100">{user?.email}</p>
            <p className="text-xs text-zinc-500">{user?.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
      <main className="min-h-screen flex-1 px-4 py-6 lg:ml-64 lg:px-8">{children}</main>
    </div>
  );
}

export function TenantShell({
  user,
  onLogout,
  children,
}: {
  user: UserInfo | null;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Tenant Dashboard</p>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-zinc-800 px-3 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
