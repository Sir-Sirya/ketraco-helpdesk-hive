import { useState } from "react";
import { Check, ChevronDown, PhoneIncoming, ShieldCheck, UserRound } from "lucide-react";
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
  admin: "bg-brand-tint text-brand-dark",
  user: "bg-info-tint text-info",
};

export function TopBar() {
  const { role, setRole, receiveCall, callRinging } = usePortal();
  const [demoHint, setDemoHint] = useState(true);
  const current = DEMO_USERS[role];

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <img src={logoUrl} alt="KETRACO transmission tower" className="h-10 w-10 shrink-0" />
        <div className="min-w-0 leading-tight">
          <h1 className="font-display truncate text-[17px] font-bold tracking-tight text-foreground">
            KETRACO Smart HelpDesk
          </h1>
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            ICT Support & Knowledge Portal
          </p>
        </div>
      </div>

      <span className="ml-2 hidden items-center gap-1.5 rounded-full border bg-brand-tint px-2.5 py-1 text-[11px] font-medium text-brand-dark lg:flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        ICT Line Online
      </span>

      <div className="flex-1" />

      {demoHint && (
        <p
          className="hidden max-w-[300px] truncate text-right text-[11px] text-muted-foreground 2xl:block"
          onClick={() => setDemoHint(false)}
        >
          Demo mode — switch roles to see privileged ICT tools
        </p>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={receiveCall}
        className={cn(
          "gap-2 border-border text-foreground",
          callRinging && "border-energy/40 bg-energy-tint text-energy",
        )}
      >
        <PhoneIncoming className={cn("h-4 w-4", callRinging && "animate-pulse")} />
        <span className="hidden md:inline">
          {callRinging ? "Incoming call…" : "Simulate Incoming Call (Ext: 2045)"}
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border bg-background py-1 pr-2 pl-1 transition-colors hover:bg-muted"
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-primary-foreground",
                role === "admin" ? "bg-brand" : "bg-info",
              )}
            >
              {current.initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-[140px] truncate text-xs font-semibold">{current.name}</span>
              <span className="block max-w-[140px] truncate text-[10px] text-muted-foreground">
                {current.department}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="text-[11px] tracking-wider text-muted-foreground uppercase">
            Switch demo role
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(DEMO_USERS) as Role[]).map((r) => {
            const u = DEMO_USERS[r];
            return (
              <DropdownMenuItem
                key={r}
                onClick={() => setRole(r)}
                className="cursor-pointer gap-3 py-2.5"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground",
                    r === "admin" ? "bg-brand" : "bg-info",
                  )}
                >
                  {u.initials}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-sm font-semibold">{u.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {u.title} · {u.department}
                  </span>
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      ROLE_BADGE[r],
                    )}
                  >
                    {r === "admin" ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <UserRound className="h-3 w-3" />
                    )}
                    {r === "admin" ? "ICT Admin" : "General User"}
                  </span>
                </span>
                {role === r && <Check className="h-4 w-4 shrink-0 text-brand" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
