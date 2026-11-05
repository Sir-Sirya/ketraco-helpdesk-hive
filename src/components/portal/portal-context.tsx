import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  INITIAL_TICKETS,
  SLA_HOURS,
  type Ticket,
  type TicketRequester,
  type Priority,
  type TicketStatus,
} from "@/data/tickets";
import type { CategoryId } from "@/data/kb";

export type Role = "user" | "admin";

export interface DemoUser {
  role: Role;
  name: string;
  initials: string;
  title: string;
  department: string;
  location: string;
  extension: string;
  email: string;
}

export const DEMO_USERS: Record<Role, DemoUser> = {
  user: {
    role: "user",
    name: "Grace Wambui",
    initials: "GW",
    title: "Senior Accountant",
    department: "Finance",
    location: "Kawi Complex Block B, 2nd Floor, Room 204",
    extension: "2045",
    email: "grace.wambui@ketraco.co.ke",
  },
  admin: {
    role: "admin",
    name: "Victor Sirya",
    initials: "VS",
    title: "ICT Support Engineer",
    department: "ICT & Telecommunications",
    location: "Kawi House HQ, ICT Control Room",
    extension: "2001",
    email: "victor.sirya@ketraco.co.ke",
  },
};

export interface TicketPrefill {
  subject?: string;
  category?: CategoryId;
  priority?: Priority;
  description?: string;
  requester?: TicketRequester;
  source?: string;
}

export interface ChatSeed {
  mode: "bot" | "agent";
  context?: string;
}

interface PortalContextValue {
  role: Role;
  user: DemoUser;
  setRole: (role: Role) => void;
  tickets: Ticket[];
  createTicket: (data: {
    subject: string;
    category: CategoryId;
    priority: Priority;
    description: string;
    requester?: TicketRequester;
    attachments?: string[];
    source?: string;
  }) => Ticket;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  assignToMe: (id: string) => void;
  addInternalNote: (id: string, note: string) => void;
  articleId: string | null;
  openArticle: (id: string) => void;
  closeArticle: () => void;
  ticketDrawer: { open: boolean; prefill: TicketPrefill | null };
  openTicketDrawer: (prefill?: TicketPrefill) => void;
  closeTicketDrawer: () => void;
  callRinging: boolean;
  receiveCall: () => void;
  dismissCall: () => void;
  chat: { open: boolean; mode: "bot" | "agent"; context?: string };
  openChat: (mode: "bot" | "agent", context?: string) => void;
  closeChat: () => void;
}

const PortalContext = createContext<PortalContextValue | null>(null);

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used inside PortalProvider");
  return ctx;
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("admin");
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [ticketDrawer, setTicketDrawer] = useState<{
    open: boolean;
    prefill: TicketPrefill | null;
  }>({ open: false, prefill: null });
  const [callRinging, setCallRinging] = useState(false);
  const [chat, setChat] = useState<{ open: boolean; mode: "bot" | "agent"; context?: string }>({
    open: false,
    mode: "bot",
  });

  const user = DEMO_USERS[role];

  const setRole = useCallback((next: Role) => {
    setRoleState(next);
    toast.success(
      next === "admin"
        ? "Now viewing as ICT Admin — Victor Sirya"
        : "Now viewing as General User — Grace Wambui",
    );
  }, []);

  const createTicket: PortalContextValue["createTicket"] = useCallback(
    (data) => {
      const requester = data.requester ?? DEMO_USERS[role] satisfies TicketRequester;
      const numbers = tickets.map((t) => Number(t.id.replace(/\D/g, "")));
      const nextId = `KTC-${Math.max(...numbers, 2400) + 1}`;
      const ticket: Ticket = {
        id: nextId,
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        status: role === "admin" ? "Assigned" : "Logged",
        requester,
        assignee: role === "admin" ? DEMO_USERS.admin.name : undefined,
        createdAt: new Date().toISOString(),
        slaHours: SLA_HOURS[data.priority],
        description: data.description,
        internalNotes: [],
        attachments: data.attachments ?? [],
      };
      setTickets((prev) => [ticket, ...prev]);
      toast.success(`${nextId} logged`, {
        description: `${data.priority} priority · ${requester.department} · SLA ${ticket.slaHours} h`,
      });
      return ticket;
    },
    [role, tickets],
  );

  const updateTicketStatus = useCallback((id: string, status: TicketStatus) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`${id} → ${status}`);
  }, []);

  const assignToMe = useCallback(
    (id: string) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, assignee: DEMO_USERS.admin.name, status: t.status === "Logged" ? "Assigned" : t.status }
            : t,
        ),
      );
      toast.success(`${id} assigned to Victor Sirya`);
    },
    [],
  );

  const addInternalNote = useCallback((id: string, note: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              internalNotes: [
                ...t.internalNotes,
                { author: DEMO_USERS.admin.name, note, at: "just now" },
              ],
            }
          : t,
      ),
    );
    toast.success(`Internal note added to ${id}`);
  }, []);

  const openArticle = useCallback((id: string) => setArticleId(id), []);
  const closeArticle = useCallback(() => setArticleId(null), []);

  const openTicketDrawer = useCallback((prefill?: TicketPrefill) => {
    setTicketDrawer({ open: true, prefill: prefill ?? null });
  }, []);
  const closeTicketDrawer = useCallback(() => setTicketDrawer((d) => ({ ...d, open: false })), []);

  const receiveCall = useCallback(() => {
    setCallRinging(true);
    toast.info("Incoming call on Ext 2045", { description: "CTI screen-pop identifying caller…" });
  }, []);
  const dismissCall = useCallback(() => setCallRinging(false), []);

  const openChat = useCallback((mode: "bot" | "agent", context?: string) => {
    setChat({ open: true, mode, context });
  }, []);
  const closeChat = useCallback(() => setChat((c) => ({ ...c, open: false, context: undefined })), []);

  const value = useMemo<PortalContextValue>(
    () => ({
      role,
      user,
      setRole,
      tickets,
      createTicket,
      updateTicketStatus,
      assignToMe,
      addInternalNote,
      articleId,
      openArticle,
      closeArticle,
      ticketDrawer,
      openTicketDrawer,
      closeTicketDrawer,
      callRinging,
      receiveCall,
      dismissCall,
      chat,
      openChat,
      closeChat,
    }),
    [
      role,
      user,
      setRole,
      tickets,
      createTicket,
      updateTicketStatus,
      assignToMe,
      addInternalNote,
      articleId,
      openArticle,
      closeArticle,
      ticketDrawer,
      openTicketDrawer,
      closeTicketDrawer,
      callRinging,
      receiveCall,
      dismissCall,
      chat,
      openChat,
      closeChat,
    ],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}
