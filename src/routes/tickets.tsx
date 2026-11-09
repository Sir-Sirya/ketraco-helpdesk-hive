import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownUp, ClipboardList, Plus, Search, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePortal } from "@/components/portal/portal-context";
import { OPEN_STATUSES, STATUS_ORDER, type Ticket, type TicketStatus } from "@/data/tickets";
import { categoryLabel } from "@/data/kb";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Ticket Tracker | KETRACO Smart HelpDesk" },
      { name: "description", content: "Review and manage KETRACO ICT support requests by priority, status, and requester." },
      { property: "og:title", content: "Ticket Tracker | KETRACO Smart HelpDesk" },
      { property: "og:description", content: "Track ICT support requests and update ticket status in the KETRACO HelpDesk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TicketTracker,
});

type ViewFilter = "all" | "open" | "closed";

const PRIORITY_STYLE: Record<Ticket["priority"], string> = {
  Critical: "border-energy/30 bg-energy-tint text-energy",
  High: "border-warning/30 bg-warning-tint text-warning",
  Medium: "border-info/30 bg-info-tint text-info",
  Low: "border-border bg-muted text-muted-foreground",
};

const STATUS_STYLE: Record<TicketStatus, string> = {
  Logged: "bg-muted text-muted-foreground",
  Assigned: "bg-info-tint text-info",
  "In Progress": "bg-progress-tint text-progress",
  "Awaiting Parts": "bg-warning-tint text-warning",
  Resolved: "bg-success-tint text-success",
  Closed: "bg-secondary text-secondary-foreground",
};

function TicketTracker() {
  const { tickets, role, updateTicketStatus, assignToMe, openTicketDrawer } = usePortal();
  const [filter, setFilter] = useState<ViewFilter>("open");
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const byStatus = filter === "all" || (filter === "open" ? OPEN_STATUSES.includes(ticket.status) : !OPEN_STATUSES.includes(ticket.status));
      const byText = !q || [ticket.id, ticket.subject, ticket.requester.name, ticket.requester.department].join(" ").toLowerCase().includes(q);
      return byStatus && byText;
    });
  }, [filter, query, tickets]);

  const countFor = (view: ViewFilter) => tickets.filter((ticket) =>
    view === "all" || (view === "open" ? OPEN_STATUSES.includes(ticket.status) : !OPEN_STATUSES.includes(ticket.status)),
  ).length;

  const ticketRow = (ticket: Ticket) => (
    <article key={ticket.id} className="grid gap-3 border-b px-4 py-4 last:border-b-0 md:grid-cols-[minmax(0,1.7fr)_0.7fr_0.7fr_1fr_auto] md:items-center md:gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-muted-foreground">{ticket.id}</span>
          <Badge variant="outline" className={PRIORITY_STYLE[ticket.priority]}>{ticket.priority}</Badge>
        </div>
        <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{ticket.subject}</p>
        <p className="mt-1 text-xs text-muted-foreground">{categoryLabel(ticket.category)} · {ticket.requester.name} · {ticket.requester.department}</p>
      </div>
      <div>
        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${STATUS_STYLE[ticket.status]}`}>{ticket.status}</span>
      </div>
      <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{ticket.assignee ?? "Unassigned"}</span><span className="block mt-1">Assigned to</span></p>
      <p className="text-xs text-muted-foreground">SLA <span className="font-medium text-foreground">{ticket.slaHours} h</span><span className="block mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</span></p>
      <div className="flex items-center gap-2">
        {role === "admin" && !ticket.assignee && <Button variant="outline" size="sm" onClick={() => assignToMe(ticket.id)} aria-label={`Assign ${ticket.id} to me`}><UserRoundCheck className="h-4 w-4" /></Button>}
        <Select value={ticket.status} onValueChange={(value) => updateTicketStatus(ticket.id, value as TicketStatus)}>
          <SelectTrigger aria-label={`Update ${ticket.id} status`} className="h-8 w-[145px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUS_ORDER.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </article>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">ICT SERVICE DESK</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Ticket Tracker</h2>
          <p className="mt-2 text-sm text-muted-foreground">Review incidents, monitor service levels, and update progress.</p>
        </div>
        <Button onClick={() => openTicketDrawer()} className="gap-2"><Plus className="h-4 w-4" /> New ticket</Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter tickets">
          {(["open", "all", "closed"] as const).map((view) => (
            <Button key={view} size="sm" variant={filter === view ? "default" : "ghost"} onClick={() => setFilter(view)} aria-pressed={filter === view} className="gap-2 capitalize">
              {view === "open" ? "Open" : view === "closed" ? "Resolved & closed" : "All tickets"}
              <span className="rounded bg-background/20 px-1.5 py-0.5 text-[11px]">{countFor(view)}</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1 lg:w-72 lg:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tickets" aria-label="Search tickets" className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setBoard((current) => !current)} aria-label={board ? "Show ticket list" : "Show ticket board"} title={board ? "List view" : "Board view"}><ArrowDownUp className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground">
        <span>{filtered.length} requests shown</span>
        <span className="hidden sm:inline">Priority · Status · SLA</span>
      </div>
      {board ? (
        <div className="grid gap-4 py-5 lg:grid-cols-3">
          {(["Logged", "Assigned", "In Progress", "Awaiting Parts", "Resolved", "Closed"] as TicketStatus[]).map((status) => {
            const column = filtered.filter((ticket) => ticket.status === status);
            return (
              <section key={status} className="min-w-0 border-t-2 border-border" aria-label={`${status} tickets`}>
                <header className="flex items-center justify-between py-3">
                  <h3 className="text-sm font-semibold">{status}</h3><span className="text-xs text-muted-foreground">{column.length}</span>
                </header>
                <div className="space-y-2">
                  {column.map((ticket) => (
                    <article key={ticket.id} className="border bg-card p-3">
                      <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-muted-foreground">{ticket.id}</span><Badge variant="outline" className={PRIORITY_STYLE[ticket.priority]}>{ticket.priority}</Badge></div>
                      <p className="mt-2 text-sm font-semibold leading-5">{ticket.subject}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{ticket.requester.name} · {ticket.slaHours} h SLA</p>
                      <Select value={ticket.status} onValueChange={(value) => updateTicketStatus(ticket.id, value as TicketStatus)}>
                        <SelectTrigger aria-label={`Update ${ticket.id} status`} className="mt-3 h-8 w-full text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUS_ORDER.map((nextStatus) => <SelectItem key={nextStatus} value={nextStatus}>{nextStatus}</SelectItem>)}</SelectContent>
                      </Select>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="mt-2 bg-card" aria-label="Tickets">
          {filtered.length ? filtered.map(ticketRow) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No tickets match this view.</p>
              <Button variant="outline" size="sm" onClick={() => { setFilter("all"); setQuery(""); }}>Show all tickets</Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}