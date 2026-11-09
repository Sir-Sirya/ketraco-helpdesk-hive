import { useState } from "react";
import {
  Check,
  ChevronDown,
  PhoneIncoming,
  Radio,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";
import logoUrl from "@/assets/ketraco-logo.png";
import { cn } from "@/lib/utils";
import { DEMO_USERS, usePortal, type Role } from "./portal-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ROLE_BADGE: Record<Role, string> = {
  admin: "bg-brand-tint text-brand-dark border-brand/30",
  user: "bg-info-tint text-info border-info/30",
};

export function TopBar() {
  const { role, setRole, receiveCall, callRinging } = usePortal();
  const current = DEMO_USERS[role];

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:px-6 shadow-sm">
      {/* Brand & Transmission Motif */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint border border-brand/20 p-1">
          <img src={logoUrl} alt="KETRACO transmission tower" className="h-8 w-8 object-contain" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-energy opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-energy" />
          </span>
        </div>

        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-2">
            <h1 className="font-display truncate text-base font-extrabold tracking-tight text-foreground sm:text-lg">
              KETRACO Smart HelpDesk
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-bold text-brand-dark border border-brand/20">
              <Radio className="h-2.5 w-2.5 animate-pulse text-brand" /> 220kV NOC Live
            </span>
          </div>
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            Enterprise ICT Support, SCADA Telemetry & Knowledge Portal
          </p>
        </div>
      </div>

      {/* Center / Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* VoIP CTI Call Simulator Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={receiveCall}
          className={cn(
            "relative gap-2 border-border text-foreground transition-all duration-300 font-semibold text-xs",
            callRinging
              ? "border-energy bg-energy-tint text-energy animate-pulse ring-2 ring-energy/30 shadow-md"
              : "hover:border-energy/50 hover:bg-energy-tint/40 hover:text-energy",
          )}
        >
          <span className="relative flex h-3 w-3">
            {callRinging ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-energy opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-energy" />
              </>
            ) : (
              <PhoneIncoming className="h-3.5 w-3.5 text-energy" />
            )}
          </span>
          <span className="hidden lg:inline">
            {callRinging ? "Incoming Ringing (Ext 2045)..." : "Simulate Incoming Call (Ext: 2045)"}
          </span>
          <span className="inline lg:hidden">
            {callRinging ? "Ringing..." : "Simulate Call"}
          </span>
        </Button>

        {/* Quick Role Switcher Pill (Fast toggle for demo evaluator) */}
        <div className="hidden md:flex items-center rounded-full border border-border bg-muted/60 p-0.5">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              role === "user"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            General User
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              role === "admin"
                ? "bg-brand text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            ICT Admin
          </button>
        </div>

        {/* User Profile Dropdown Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pr-2.5 pl-1 transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-brand/20"
              aria-label="User Profile and Role Switcher"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-primary-foreground shadow-sm",
                  role === "admin" ? "bg-brand" : "bg-info",
                )}
              >
                {current.initials}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-[130px] truncate text-xs font-bold text-foreground">
                  {current.name}
                </span>
                <span className="block max-w-[130px] truncate text-[10px] text-muted-foreground">
                  {role === "admin" ? "ICT Admin" : "General User"} · {current.department}
                </span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 p-2 shadow-elevated">
            <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Toggle Demo Persona (RBAC)
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* General User Option */}
            <DropdownMenuItem
              onClick={() => setRole("user")}
              className={cn(
                "cursor-pointer gap-3 rounded-lg p-2.5 transition-colors",
                role === "user" ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info text-xs font-bold text-primary-foreground">
                GW
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">Grace Wambui</span>
                  <span className="rounded-full bg-info-tint px-2 py-0.5 text-[10px] font-semibold text-info">
                    General User
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Senior Accountant · Finance Department
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Kawi Complex Block B · Desk Ext: 2045
                </p>
              </div>
              {role === "user" && <Check className="h-4 w-4 shrink-0 text-brand" />}
            </DropdownMenuItem>

            {/* ICT Admin Option */}
            <DropdownMenuItem
              onClick={() => setRole("admin")}
              className={cn(
                "cursor-pointer gap-3 rounded-lg p-2.5 mt-1 transition-colors",
                role === "admin" ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-primary-foreground">
                VS
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">Victor Sirya</span>
                  <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-semibold text-brand-dark">
                    ICT Admin
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ICT Support Engineer · Telecommunications
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  HQ Control Room · NOC Admin · Ext: 2001
                </p>
              </div>
              {role === "admin" && <Check className="h-4 w-4 shrink-0 text-brand" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
