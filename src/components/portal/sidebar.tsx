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
  Plus,
  Wrench,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortal, DEMO_USERS } from "./portal-context";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { role, receiveCall, openTicketDrawer, openArticle } = usePortal();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isKnowledgeActive = pathname === "/";
  const isTicketsActive = pathname === "/tickets";

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r bg-card transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {!collapsed && (
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            {role === "admin" ? "ICT Admin Operations" : "Service Portal"}
          </p>
        )}

        {/* Knowledge Portal Link */}
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            isKnowledgeActive
              ? "bg-brand-tint text-brand-dark"
              : "text-ink-muted hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <BookOpen className={cn("h-4.5 w-4.5 shrink-0", isKnowledgeActive && "text-brand")} />
          {!collapsed && <span>Knowledge Portal</span>}
        </Link>

        {/* Ticket Link - Dynamic label based on role */}
        <Link
          to="/tickets"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            isTicketsActive
              ? "bg-brand-tint text-brand-dark"
              : "text-ink-muted hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {role === "admin" ? (
            <LayoutGrid className={cn("h-4.5 w-4.5 shrink-0", isTicketsActive && "text-brand")} />
          ) : (
            <Ticket className={cn("h-4.5 w-4.5 shrink-0", isTicketsActive && "text-brand")} />
          )}
          {!collapsed && (
            <span>{role === "admin" ? "Ticket Console & Kanban" : "My Reported Tickets"}</span>
          )}
        </Link>

        {/* Quick Report Issue Button for General Users */}
        {role === "user" && (
          <button
            type="button"
            onClick={() => openTicketDrawer()}
            className={cn(
              "mt-2 flex items-center gap-3 rounded-xl border border-dashed border-brand/40 bg-brand-tint/50 px-3 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-tint hover:border-brand",
              collapsed && "justify-center px-0",
            )}
          >
            <Plus className="h-4.5 w-4.5 shrink-0 text-brand" />
            {!collapsed && <span>Log New Ticket</span>}
          </button>
        )}

        {/* ICT Admin Tools Section */}
        {role === "admin" && (
          <>
            {!collapsed && (
              <p className="px-3 pt-5 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                CTI & Telephony Simulator
              </p>
            )}
            {collapsed && <div className="my-3 border-t" />}

            <button
              type="button"
              onClick={() => receiveCall()}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-energy-tint hover:text-energy",
                collapsed && "justify-center px-0",
              )}
            >
              <PhoneIncoming className="h-4.5 w-4.5 shrink-0 text-energy" />
              {!collapsed && (
                <div className="text-left leading-tight">
                  <span className="block truncate font-semibold">Simulate Call Ext 2045</span>
                  <span className="block text-[10px] text-muted-foreground">Screen-Pop Grace W.</span>
                </div>
              )}
            </button>

            {!collapsed && (
              <p className="px-3 pt-4 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Privileged Runbooks
              </p>
            )}

            <button
              type="button"
              onClick={() => openArticle("kawi-switch-reboot")}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Radio className="h-4 w-4 shrink-0 text-warning" />
              {!collapsed && <span className="truncate">Kawi SW-B2 Reboot</span>}
            </button>

            <button
              type="button"
              onClick={() => openArticle("cisco-trunking")}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Wrench className="h-4 w-4 shrink-0 text-warning" />
              {!collapsed && <span className="truncate">Cisco VLAN Trunk Table</span>}
            </button>
          </>
        )}
      </nav>

      {/* User profile card at bottom of sidebar */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl bg-brand-tint p-3 border border-brand/20">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground",
                role === "admin" ? "bg-brand" : "bg-info",
              )}
            >
              {DEMO_USERS[role].initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-brand-dark">
                {DEMO_USERS[role].name}
              </p>
              <p className="truncate text-[10px] text-brand-dark/70">
                {DEMO_USERS[role].department}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-brand-dark/90">
            {role === "admin" ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-brand" /> ICT Admin Privileges Active
              </>
            ) : (
              <>
                <Users className="h-3.5 w-3.5 text-info" /> General User · Finance
              </>
            )}
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
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
              <span className="text-xs">Collapse Sidebar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
