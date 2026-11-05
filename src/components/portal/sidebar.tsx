import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  PhoneIncoming,
  Ticket,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePortal } from "./portal-context";
import { DEMO_USERS } from "./portal-context";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  to: string;
  icon: typeof BookOpen;
  exact?: boolean;
}

const MAIN_NAV: NavItem[] = [
  { label: "Knowledge Portal", to: "/", icon: BookOpen, exact: true },
  { label: "Ticket Tracker", to: "/tickets", icon: Ticket },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Ticket Kanban Board", to: "/tickets", icon: LayoutGrid },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { role, receiveCall } = usePortal();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const item = (nav: NavItem, key: string) => {
    const active = nav.exact ? pathname === nav.to : pathname.startsWith(nav.to);
    const Icon = nav.icon;
    return (
      <Link
        key={key}
        to={nav.to}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-brand-tint text-brand-dark"
            : "text-ink-muted hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon className={cn("h-4.5 w-4.5 shrink-0", active && "text-brand")} />
        {!collapsed && <span className="truncate">{nav.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r bg-card transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {!collapsed && (
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Workspace
          </p>
        )}
        {MAIN_NAV.map((n) => item(n, n.label))}
        {role === "admin" && (
          <>
            {!collapsed && (
              <p className="px-3 pt-5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                ICT Admin Tools
              </p>
            )}
            {collapsed && <div className="my-3 border-t" />}
            {ADMIN_NAV.map((n) => item(n, n.label))}
            <button
              type="button"
              onClick={() => {
                receiveCall();
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <PhoneIncoming className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span className="truncate">Caller Lookup · Ext 2045</span>}
            </button>
          </>
        )}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl bg-brand-tint p-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-primary-foreground",
                role === "admin" ? "bg-brand" : "bg-info",
              )}
            >
              {DEMO_USERS[role].initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-brand-dark">
                {DEMO_USERS[role].name}
              </p>
              <p className="truncate text-[11px] text-brand-dark/70">
                {DEMO_USERS[role].department}
              </p>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-dark/80">
            {role === "admin" ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" /> Full ICT access · internal runbooks unlocked
              </>
            ) : (
              <>
                <Users className="h-3.5 w-3.5" /> Standard user access
              </>
            )}
          </p>
        </div>
      )}

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full justify-center text-muted-foreground", collapsed && "px-0")}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
