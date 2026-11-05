import { Network, PhoneIncoming, PhoneOff, Zap } from "lucide-react";
import { usePortal } from "./portal-context";
import { CTI_CALLER, CTI_OPEN_TICKET_COUNT } from "@/data/cti";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Simulated CTI screen-pop: floating card identifying the caller on the
 * incoming VoIP call before the agent picks up.
 */
export function CtiCallCard() {
  const { callRinging, dismissCall, openTicketDrawer } = usePortal();
  if (!callRinging) return null;

  const answer = () => {
    openTicketDrawer({
      subject: `Incoming call — Ext ${CTI_CALLER.extension} (${CTI_CALLER.name})`,
      description: `Caller identified via CTI screen-pop:\n${CTI_CALLER.name} · ${CTI_CALLER.department}\n${CTI_CALLER.location}\nSwitch: ${CTI_CALLER.switch}`,
      requester: {
        name: CTI_CALLER.name,
        department: CTI_CALLER.department,
        location: CTI_CALLER.location,
        extension: CTI_CALLER.extension,
      },
      source: "cti",
    });
    dismissCall();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 zoom-in-95 fixed right-6 bottom-24 z-50 w-[min(92vw,370px)] overflow-hidden rounded-2xl border bg-card shadow-float duration-300">
      <div className="flex items-center gap-3 bg-energy px-4 py-3 text-primary-foreground">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/25" />
          <PhoneIncoming className="h-4.5 w-4.5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold">Incoming Call — Ext {CTI_CALLER.extension}</p>
          <p className="text-[11px] opacity-80">KETRACO VoIP · Screen-Pop CTI</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <p className="font-display text-base font-semibold text-foreground">{CTI_CALLER.name}</p>
          <p className="text-xs text-muted-foreground">{CTI_CALLER.department}</p>
        </div>
        <div className="space-y-1.5 rounded-xl bg-muted/60 p-3 text-xs text-foreground/80">
          <p className="flex items-start gap-2">
            <span className="w-14 shrink-0 font-medium text-muted-foreground">Location</span>
            {CTI_CALLER.location}
          </p>
          <p className="flex items-start gap-2">
            <span className="w-14 shrink-0 font-medium text-muted-foreground">Switch</span>
            <span className="font-mono text-[11px]">{CTI_CALLER.switch}</span>
          </p>
        </div>
        <Badge className="border-transparent bg-energy-tint text-energy hover:bg-energy-tint">
          Active Open Tickets: {CTI_OPEN_TICKET_COUNT}
        </Badge>

        <div className="flex gap-2 pt-1">
          <Button onClick={answer} className="flex-1 gap-2 bg-brand hover:bg-brand-dark">
            <Zap className="h-4 w-4" />
            One-Click Open Ticket
          </Button>
          <Button variant="outline" onClick={dismissCall} className="gap-2">
            <PhoneOff className="h-4 w-4" />
            Dismiss
          </Button>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Network className="h-3 w-3" />
          Caller auto-matched to the corporate directory by extension 2045
        </p>
      </div>
    </div>
  );
}
