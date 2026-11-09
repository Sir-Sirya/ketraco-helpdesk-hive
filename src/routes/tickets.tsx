import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDownUp,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Kanban,
  MapPin,
  MessageSquarePlus,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Table as TableIcon,
  UserCheck,
  UserRound,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePortal } from "@/components/portal/portal-context";
import {
  OPEN_STATUSES,
  STATUS_ORDER,
  DEPARTMENTS,
  STAFF,
  type Ticket,
  type TicketStatus,
  type Priority,
} from "@/data/tickets";
import { categoryLabel, type CategoryId } from "@/data/kb";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Ticket Tracker | KETRACO Smart HelpDesk" },
      {
        name: "description",
        content:
          "Manage and monitor KETRACO ICT support requests, SLA timelines, and engineer dispatch.",
      },
      { property: "og:title", content: "Ticket Tracker | KETRACO Smart HelpDesk" },
      {
        property: "og:description",
        content: "Track real-time status and SLA resolution of KETRACO ICT tickets.",
      },
    ],
  }),
  component: TicketTrackerPage,
});

const PRIORITY_STYLE: Record<Priority, string> = {
  Critical: "border-energy/40 bg-energy-tint text-energy font-bold",
  High: "border-warning/40 bg-warning-tint text-warning font-semibold",
  Medium: "border-info/40 bg-info-tint text-info font-medium",
  Low: "border-border bg-muted text-muted-foreground",
};

const STATUS_STYLE: Record<TicketStatus, string> = {
  Logged: "bg-muted text-muted-foreground border-border",
  Assigned: "bg-info-tint text-info border-info/30",
  "In Progress": "bg-progress-tint text-progress border-progress/30",
  "Awaiting Parts": "bg-warning-tint text-warning border-warning/30",
  Resolved: "bg-brand-tint text-brand-dark border-brand/30",
  Closed: "bg-secondary text-secondary-foreground border-border",
};

function TicketTrackerPage() {
  const {
    tickets,
    role,
    user,
    updateTicketStatus,
    assignToMe,
    addInternalNote,
    openTicketDrawer,
    openChat,
  } = usePortal();

  // Admin View State
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // General User View State
  const [userTab, setUserTab] = useState<"all" | "open" | "resolved">("all");

  // Internal Note Modal State
  const [noteModalTicket, setNoteModalTicket] = useState<Ticket | null>(null);
  const [noteContent, setNoteContent] = useState("");

  // Filtered tickets for Admin
  const adminFilteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchQuery =
        !q ||
        [t.id, t.subject, t.requester.name, t.requester.department, t.requester.location]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "open" ? OPEN_STATUSES.includes(t.status) : t.status === statusFilter);

      const matchDept = deptFilter === "all" || t.requester.department === deptFilter;
      const matchAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" ? !t.assignee : t.assignee === assigneeFilter);
      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;

      return matchQuery && matchStatus && matchDept && matchAssignee && matchPriority;
    });
  }, [tickets, query, statusFilter, deptFilter, assigneeFilter, priorityFilter]);

  // Filtered tickets for General User (Grace Wambui)
  const userTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Show tickets logged by Grace Wambui or her department
      const isMine =
        t.requester.name.toLowerCase() === user.name.toLowerCase() ||
        t.requester.department.toLowerCase() === user.department.toLowerCase();

      if (userTab === "open") return isMine && OPEN_STATUSES.includes(t.status);
      if (userTab === "resolved")
        return isMine && (t.status === "Resolved" || t.status === "Closed");
      return isMine;
    });
  }, [tickets, user, userTab]);

  // Metrics for Admin Header
  const totalOpen = tickets.filter((t) => OPEN_STATUSES.includes(t.status)).length;
  const criticalOpen = tickets.filter(
    (t) => t.priority === "Critical" && OPEN_STATUSES.includes(t.status)
  ).length;
  const unassignedCount = tickets.filter(
    (t) => !t.assignee && OPEN_STATUSES.includes(t.status)
  ).length;

  const handleSaveNote = () => {
    if (!noteModalTicket || !noteContent.trim()) return;
    addInternalNote(noteModalTicket.id, noteContent.trim());
    setNoteContent("");
    setNoteModalTicket(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      {/* ─────────────────────────────────────────────────────────────
          ROLE: GENERAL USER VIEW (Grace Wambui - Finance)
      ───────────────────────────────────────────────────────────── */}
      {role === "user" ? (
        <div className="space-y-6">
          {/* User Header */}
          <div className="flex flex-col gap-4 rounded-2xl border border-brand/20 bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-tint text-brand-dark">
                  <UserRound className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  My Service Requests · KETRACO Finance
                </span>
              </div>
              <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                My Reported Tickets
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Track real-time dispatch, assigned technician progress, and resolution SLA countdowns.
              </p>
            </div>

            <Button
              onClick={() => openTicketDrawer()}
              className="gap-2 bg-brand text-primary-foreground hover:bg-brand-dark shadow-sm self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />
              Report New Issue
            </Button>
          </div>

          {/* User Context Strip */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <UserRound className="h-3.5 w-3.5 text-brand" /> {user.name} ({user.title})
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {user.department}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {user.location}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Desk Ext: {user.extension}
            </span>
          </div>

          {/* Tab Filter Pills */}
          <div className="flex items-center gap-2 border-b pb-3">
            <Button
              variant={userTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserTab("all")}
              className={userTab === "all" ? "bg-brand text-primary-foreground hover:bg-brand-dark" : ""}
            >
              All Tickets ({userTickets.length})
            </Button>
            <Button
              variant={userTab === "open" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserTab("open")}
              className={userTab === "open" ? "bg-brand text-primary-foreground hover:bg-brand-dark" : ""}
            >
              Active / In Progress (
              {tickets.filter(
                (t) =>
                  (t.requester.name === user.name || t.requester.department === user.department) &&
                  OPEN_STATUSES.includes(t.status)
              ).length}
              )
            </Button>
            <Button
              variant={userTab === "resolved" ? "default" : "ghost"}
              size="sm"
              onClick={() => setUserTab("resolved")}
              className={userTab === "resolved" ? "bg-brand text-primary-foreground hover:bg-brand-dark" : ""}
            >
              Resolved & Closed (
              {tickets.filter(
                (t) =>
                  (t.requester.name === user.name || t.requester.department === user.department) &&
                  !OPEN_STATUSES.includes(t.status)
              ).length}
              )
            </Button>
          </div>

          {/* Ticket List with SLA Progress Timelines */}
          {userTickets.length > 0 ? (
            <div className="space-y-4">
              {userTickets.map((ticket) => {
                // Calculate SLA progress
                const isCritical = ticket.priority === "Critical";
                const isResolved = ticket.status === "Resolved" || ticket.status === "Closed";

                // Step indices: Logged (0), Assigned (1), In Progress (2), Resolved (3)
                const currentStep =
                  ticket.status === "Logged"
                    ? 0
                    : ticket.status === "Assigned"
                    ? 1
                    : ticket.status === "In Progress" || ticket.status === "Awaiting Parts"
                    ? 2
                    : 3;

                return (
                  <div
                    key={ticket.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-brand/40"
                  >
                    {/* Top Row: ID, Badges & Date */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {ticket.id}
                        </span>
                        <Badge variant="outline" className={PRIORITY_STYLE[ticket.priority]}>
                          {isCritical && <Zap className="mr-1 h-3 w-3" />}
                          {ticket.priority} Priority
                        </Badge>
                        <Badge variant="outline" className="border-border bg-muted/60 text-muted-foreground">
                          {categoryLabel(ticket.category)}
                        </Badge>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            STATUS_STYLE[ticket.status]
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Logged: {new Date(ticket.createdAt).toLocaleDateString()} at{" "}
                        {new Date(ticket.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Middle: Subject & Description */}
                    <div className="py-4">
                      <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
                        {ticket.subject}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>

                    {/* SLA Progress Timeline Track */}
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-3">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <Clock className="h-3.5 w-3.5 text-brand" />
                          SLA Resolution Progress ({ticket.slaHours} Hours Standard SLA)
                        </span>
                        <span className={isResolved ? "text-brand font-bold" : "text-foreground"}>
                          {isResolved ? "Target SLA Fulfilled" : `Within ${ticket.slaHours}h SLA Window`}
                        </span>
                      </div>

                      {/* Visual 4-Step Progress Bar */}
                      <div className="relative mt-2">
                        <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-border" />
                        <div
                          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-brand transition-all duration-500"
                          style={{
                            width:
                              currentStep === 0
                                ? "10%"
                                : currentStep === 1
                                ? "40%"
                                : currentStep === 2
                                ? "70%"
                                : "100%",
                          }}
                        />

                        <div className="relative flex justify-between">
                          {["Logged", "Assigned", "In Progress", "Resolved"].map((step, idx) => {
                            const completed = idx <= currentStep;
                            const isCurrent = idx === currentStep;

                            return (
                              <div key={step} className="flex flex-col items-center">
                                <span
                                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                    completed
                                      ? "bg-brand text-primary-foreground ring-4 ring-brand-tint"
                                      : "border-2 border-border bg-card text-muted-foreground"
                                  }`}
                                >
                                  {completed ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                                </span>
                                <span
                                  className={`mt-1.5 text-[11px] font-semibold ${
                                    isCurrent ? "text-brand-dark" : "text-muted-foreground"
                                  }`}
                                >
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* SLA Progress Health Bar */}
                      <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs">
                        <span className="text-muted-foreground">
                          Target Resolution:{" "}
                          <strong className="text-foreground">
                            {new Date(
                              new Date(ticket.createdAt).getTime() + ticket.slaHours * 3600000
                            ).toLocaleDateString()}{" "}
                            ({ticket.slaHours}h target)
                          </strong>
                        </span>
                        <span className="font-semibold text-brand-dark">
                          {isResolved ? "Status: Complete" : "Status: On Track"}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Assignee & Action */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-primary-foreground">
                          {ticket.assignee ? ticket.assignee.slice(0, 2).toUpperCase() : "ICT"}
                        </span>
                        <div className="leading-tight text-xs">
                          <p className="font-semibold text-foreground">
                            {ticket.assignee ? ticket.assignee : "Triage in Queue (Unassigned)"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            ICT & Telecommunications Team
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openChat("agent", `Checking ticket ${ticket.id}: ${ticket.subject}`)}
                          className="gap-1.5 text-xs border-brand/30 text-brand-dark hover:bg-brand-tint"
                        >
                          <MessageSquarePlus className="h-3.5 w-3.5" />
                          Chat with Technician
                        </Button>
                      </div>
                    </div>

                    {/* Internal Notes Display (if user is interested in history) */}
                    {ticket.internalNotes.length > 0 && (
                      <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">Technician Updates:</p>
                        <ul className="mt-1 space-y-1">
                          {ticket.internalNotes.map((note, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="font-semibold text-brand-dark">{note.author}:</span>
                              <span>{note.note}</span>
                              <span className="text-[10px] opacity-70">({note.at})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-brand" />
              <h3 className="mt-3 font-display text-base font-bold text-foreground">
                No active tickets in this view
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                You have no outstanding ICT incidents reported under this filter.
              </p>
              <Button
                onClick={() => openTicketDrawer()}
                className="mt-4 gap-2 bg-brand text-primary-foreground hover:bg-brand-dark"
              >
                <Plus className="h-4 w-4" />
                Report an ICT Issue
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            ROLE: ICT ADMIN ENTERPRISE CONSOLE (Victor Sirya)
        ───────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex flex-col gap-4 rounded-2xl border border-brand/20 bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-tint text-brand-dark">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  Enterprise Operations · Victor Sirya (ICT Admin)
                </span>
              </div>
              <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                ICT Service Desk & Ticket Dispatch Console
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Real-time incident queue, SLA monitoring, and engineer assignment for KETRACO substations and HQ.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className={
                  viewMode === "kanban"
                    ? "bg-brand text-primary-foreground hover:bg-brand-dark gap-1.5"
                    : "gap-1.5"
                }
              >
                <Kanban className="h-4 w-4" /> Kanban Board
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={
                  viewMode === "table"
                    ? "bg-brand text-primary-foreground hover:bg-brand-dark gap-1.5"
                    : "gap-1.5"
                }
              >
                <TableIcon className="h-4 w-4" /> Data Table
              </Button>
              <Button
                onClick={() => openTicketDrawer()}
                className="gap-1.5 bg-brand text-primary-foreground hover:bg-brand-dark shadow-sm"
              >
                <Plus className="h-4 w-4" /> New Ticket
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">Total Open Incidents</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-foreground">{totalOpen}</p>
              <span className="text-[10px] text-muted-foreground">Across all KETRACO nodes</span>
            </div>
            <div className="rounded-xl border border-energy/30 bg-energy-tint/40 p-4 shadow-sm">
              <p className="text-xs font-bold text-energy flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" /> Critical Incidents
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-energy">{criticalOpen}</p>
              <span className="text-[10px] text-energy/80">Requires immediate 2h SLA dispatch</span>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning-tint/40 p-4 shadow-sm">
              <p className="text-xs font-bold text-warning flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Unassigned Tickets
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-warning">{unassignedCount}</p>
              <span className="text-[10px] text-warning/80">Awaiting engineer dispatch</span>
            </div>
            <div className="rounded-xl border border-brand/30 bg-brand-tint/40 p-4 shadow-sm">
              <p className="text-xs font-bold text-brand-dark flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" /> My Active Queue
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-brand-dark">
                {tickets.filter((t) => t.assignee === user.name && OPEN_STATUSES.includes(t.status)).length}
              </p>
              <span className="text-[10px] text-brand-dark/70">Assigned to Victor Sirya</span>
            </div>
          </div>

          {/* Enterprise Filters Toolbar */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Filter className="h-3.5 w-3.5 text-brand" /> Filter Ticket Queue
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ID, subject, requester..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">All Open (Active)</SelectItem>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Department Filter */}
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Filter Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Assignee Filter */}
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Filter Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="Victor Sirya">Victor Sirya (Me)</SelectItem>
                  <SelectItem value="unassigned">Unassigned Only</SelectItem>
                  {STAFF.filter((s) => s.name !== "Victor Sirya").map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name} ({s.initials})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Filter Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical (2h SLA)</SelectItem>
                  <SelectItem value="High">High (8h SLA)</SelectItem>
                  <SelectItem value="Medium">Medium (24h SLA)</SelectItem>
                  <SelectItem value="Low">Low (72h SLA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              VIEW 1: ENTERPRISE KANBAN BOARD
          ───────────────────────────────────────────────────────────── */}
          {viewMode === "kanban" ? (
            <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {STATUS_ORDER.map((status) => {
                const columnTickets = adminFilteredTickets.filter((t) => t.status === status);

                return (
                  <div
                    key={status}
                    className="flex flex-col rounded-xl border border-border bg-muted/40 min-w-[240px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between border-b border-border bg-card p-3 rounded-t-xl">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            status === "Logged"
                              ? "bg-muted-foreground"
                              : status === "Assigned"
                              ? "bg-info"
                              : status === "In Progress"
                              ? "bg-progress"
                              : status === "Awaiting Parts"
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                        />
                        <h3 className="text-xs font-bold text-foreground truncate">{status}</h3>
                      </div>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-bold">
                        {columnTickets.length}
                      </Badge>
                    </div>

                    {/* Column Body Cards */}
                    <div className="flex-1 space-y-2.5 p-2 overflow-y-auto max-h-[70vh]">
                      {columnTickets.map((ticket) => {
                        const isCritical = ticket.priority === "Critical";

                        return (
                          <div
                            key={ticket.id}
                            className={`rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:shadow-md ${
                              isCritical ? "border-energy/40 ring-1 ring-energy/20" : "border-border"
                            }`}
                          >
                            {/* Card Top: ID & Priority */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-foreground">
                                {ticket.id}
                              </span>
                              <Badge variant="outline" className={`text-[10px] py-0 ${PRIORITY_STYLE[ticket.priority]}`}>
                                {isCritical && <Zap className="mr-0.5 h-2.5 w-2.5" />}
                                {ticket.priority}
                              </Badge>
                            </div>

                            {/* Subject */}
                            <h4 className="mt-2 text-xs font-bold text-foreground line-clamp-2 leading-snug">
                              {ticket.subject}
                            </h4>

                            {/* Requester & Location */}
                            <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                              <p className="font-medium text-foreground truncate">
                                {ticket.requester.name} · {ticket.requester.department}
                              </p>
                              <p className="truncate flex items-center gap-1 text-[10px]">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {ticket.requester.location}
                              </p>
                            </div>

                            {/* Assignee & SLA */}
                            <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[10px]">
                              <span className="font-semibold text-brand-dark">
                                {ticket.assignee ? ticket.assignee : "Unassigned"}
                              </span>
                              <span className="text-muted-foreground font-mono">
                                SLA: {ticket.slaHours}h
                              </span>
                            </div>

                            {/* Actions Toolbar */}
                            <div className="mt-3 grid grid-cols-2 gap-1.5 pt-1">
                              {!ticket.assignee && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => assignToMe(ticket.id)}
                                  className="h-7 text-[10px] px-1.5 border-brand/30 text-brand-dark hover:bg-brand-tint col-span-2"
                                >
                                  <UserCheck className="mr-1 h-3 w-3" /> Assign to Me
                                </Button>
                              )}

                              <Select
                                value={ticket.status}
                                onValueChange={(val) => updateTicketStatus(ticket.id, val as TicketStatus)}
                              >
                                <SelectTrigger className="h-7 text-[10px] px-1.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_ORDER.map((s) => (
                                    <SelectItem key={s} value={s} className="text-xs">
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setNoteModalTicket(ticket);
                                  setNoteContent("");
                                }}
                                className="h-7 text-[10px] px-1.5"
                              >
                                <MessageSquarePlus className="mr-1 h-3 w-3" /> Note
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                      {columnTickets.length === 0 && (
                        <div className="p-4 text-center text-[11px] text-muted-foreground/60 italic">
                          No tickets in {status}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
                VIEW 2: ENTERPRISE DATA TABLE
            ───────────────────────────────────────────────────────────── */
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/60 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-4 py-3">Ticket ID</th>
                      <th className="px-4 py-3">Subject & Category</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Requester & Location</th>
                      <th className="px-4 py-3">Assignee</th>
                      <th className="px-4 py-3">SLA Target</th>
                      <th className="px-4 py-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {adminFilteredTickets.map((ticket) => {
                      const isCritical = ticket.priority === "Critical";

                      return (
                        <tr key={ticket.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-foreground">
                            {ticket.id}
                          </td>
                          <td className="px-4 py-3 min-w-[200px]">
                            <p className="font-semibold text-foreground line-clamp-1">{ticket.subject}</p>
                            <span className="text-[10px] font-medium text-brand">
                              {categoryLabel(ticket.category)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-[10px] ${PRIORITY_STYLE[ticket.priority]}`}>
                              {isCritical && <Zap className="mr-0.5 h-2.5 w-2.5" />}
                              {ticket.priority}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                STATUS_STYLE[ticket.status]
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <p className="font-medium text-foreground">{ticket.requester.name}</p>
                            <p className="text-[10px]">
                              {ticket.requester.department} · Ext {ticket.requester.extension}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-foreground">
                              {ticket.assignee ? ticket.assignee : "Unassigned"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <span className="font-mono font-semibold text-foreground">
                              {ticket.slaHours} Hours
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!ticket.assignee && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => assignToMe(ticket.id)}
                                  className="h-7 text-[10px] border-brand/30 text-brand-dark hover:bg-brand-tint"
                                >
                                  Assign
                                </Button>
                              )}
                              <Select
                                value={ticket.status}
                                onValueChange={(val) => updateTicketStatus(ticket.id, val as TicketStatus)}
                              >
                                <SelectTrigger className="h-7 w-28 text-[10px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_ORDER.map((s) => (
                                    <SelectItem key={s} value={s} className="text-xs">
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setNoteModalTicket(ticket);
                                  setNoteContent("");
                                }}
                                className="h-7 text-[10px]"
                              >
                                Note
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {adminFilteredTickets.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No tickets match your filters.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ADMIN MODAL: ADD INTERNAL NOTE
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={!!noteModalTicket} onOpenChange={(open) => !open && setNoteModalTicket(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-bold">
              Add Internal Diagnostic Note
            </DialogTitle>
            <DialogDescription className="text-xs">
              {noteModalTicket && (
                <>
                  Ticket <strong>{noteModalTicket.id}</strong>: {noteModalTicket.subject}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {noteModalTicket && (
            <div className="space-y-4 py-2">
              {/* Existing notes */}
              {noteModalTicket.internalNotes.length > 0 && (
                <div className="rounded-lg bg-muted/60 p-3 text-xs space-y-2 max-h-40 overflow-y-auto">
                  <p className="font-semibold text-foreground">Previous Internal Notes:</p>
                  {noteModalTicket.internalNotes.map((n, i) => (
                    <div key={i} className="border-b border-border/50 pb-1.5 last:border-b-0">
                      <p className="font-medium text-brand-dark">
                        {n.author} <span className="text-[10px] text-muted-foreground font-normal">({n.at})</span>
                      </p>
                      <p className="text-muted-foreground mt-0.5">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  New Internal Technician Note
                </label>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter diagnostic details, equipment serials, vendor dispatch notes..."
                  rows={4}
                  className="text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setNoteModalTicket(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNote}
              disabled={!noteContent.trim()}
              className="bg-brand text-primary-foreground hover:bg-brand-dark"
            >
              Save Internal Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
