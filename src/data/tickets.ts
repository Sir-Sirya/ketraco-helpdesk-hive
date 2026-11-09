import type { CategoryId } from "./kb";

export type Priority = "Low" | "Medium" | "High" | "Critical";
export type TicketStatus =
  | "Logged"
  | "Assigned"
  | "In Progress"
  | "Awaiting Parts"
  | "Resolved"
  | "Closed";

export interface TicketRequester {
  name: string;
  department: string;
  location: string;
  extension: string;
}

export interface InternalNote {
  author: string;
  note: string;
  at: string;
}

export interface Ticket {
  id: string;
  subject: string;
  category: CategoryId;
  priority: Priority;
  status: TicketStatus;
  requester: TicketRequester;
  assignee?: string | undefined;
  createdAt: string;
  slaHours: number;
  description: string;
  internalNotes: InternalNote[];
  attachments: string[];
}

export const SLA_HOURS: Record<Priority, number> = {
  Critical: 2,
  High: 8,
  Medium: 24,
  Low: 72,
};

export const STATUS_ORDER: TicketStatus[] = [
  "Logged",
  "Assigned",
  "In Progress",
  "Awaiting Parts",
  "Resolved",
  "Closed",
];

export const OPEN_STATUSES: TicketStatus[] = ["Logged", "Assigned", "In Progress", "Awaiting Parts"];

export const STAFF = [
  { name: "Victor Sirya", role: "ICT & Telecommunications", initials: "VS" },
  { name: "Mercy Achieng", role: "ICT Support", initials: "MA" },
  { name: "Dennis Kiprotich", role: "Networks & Infrastructure", initials: "DK" },
] as const;

export const DEPARTMENTS = [
  "Transmission Operations",
  "Finance",
  "Human Capital",
  "SCADA",
  "Procurement",
  "ICT & Telecommunications",
] as const;

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: "KTC-2418",
    subject: "UPS alarm on SCADA operator console — control room desk 3",
    category: "hardware",
    priority: "Critical",
    status: "In Progress",
    requester: {
      name: "Peter Maina",
      department: "SCADA",
      location: "Suswa Substation — Control Room",
      extension: "3102",
    },
    assignee: "Victor Sirya",
    createdAt: hoursAgo(1.5),
    slaHours: SLA_HOURS.Critical,
    description:
      "UPS behind SCADA console 3 is beeping continuously and shows 'On Battery'. RTU telemetry link still up but we are on battery power.",
    internalNotes: [
      {
        author: "Victor Sirya",
        note: "Input breaker tripped. Reset and monitoring. Battery reads 11.8V — replacement quote requested.",
        at: "40 min ago",
      },
    ],
    attachments: ["ups-panel-photo.jpg"],
  },
  {
    id: "KTC-2417",
    subject: "SAP GUI connection timeout after kernel patch",
    category: "sap",
    priority: "High",
    status: "In Progress",
    requester: {
      name: "Janet Osewe",
      department: "Transmission Operations",
      location: "Kawi House Block A, 3rd Floor",
      extension: "2210",
    },
    assignee: "Mercy Achieng",
    createdAt: hoursAgo(3),
    slaHours: SLA_HOURS.High,
    description:
      "SAP GUI hangs on 'Connection to application server broken' every second attempt. Other users in my section are fine.",
    internalNotes: [
      {
        author: "Mercy Achieng",
        note: "Admin relaunch fixed it once, user reports recurrence. Collecting GUI trace for BASIS.",
        at: "1 h ago",
      },
    ],
    attachments: [],
  },
  {
    id: "KTC-2416",
    subject: "Dandora SS uplink flapping on SW-DDS-01 (Gi0/24)",
    category: "network",
    priority: "Critical",
    status: "Assigned",
    requester: {
      name: "Robert Kimani",
      department: "Transmission Operations",
      location: "Dandora Substation — Telecom Room",
      extension: "3405",
    },
    assignee: "Victor Sirya",
    createdAt: hoursAgo(0.8),
    slaHours: SLA_HOURS.Critical,
    description:
      "Uplink interface resets every few minutes, remote RTU polls timing out. Suspect fibre patch lead.",
    internalNotes: [],
    attachments: [],
  },
  {
    id: "KTC-2415",
    subject: "New laptop request — HR onboarding (start date Monday)",
    category: "hardware",
    priority: "Low",
    status: "Logged",
    requester: {
      name: "Fatuma Ali",
      department: "Human Capital",
      location: "Kawi House Block B, 1st Floor",
      extension: "2122",
    },
    createdAt: hoursAgo(5),
    slaHours: SLA_HOURS.Low,
    description:
      "New officer reporting Monday needs a standard laptop with SAP access and Office 365.",
    internalNotes: [],
    attachments: [],
  },
  {
    id: "KTC-2414",
    subject: "Printer offline in Finance open area (FIN-B2-HP404)",
    category: "printing",
    priority: "Medium",
    status: "In Progress",
    requester: {
      name: "Grace Wambui",
      department: "Finance",
      location: "Kawi Complex Block B, 2nd Floor, Room 204",
      extension: "2045",
    },
    assignee: "Mercy Achieng",
    createdAt: hoursAgo(26),
    slaHours: SLA_HOURS.Medium,
    description:
      "The finance printer shows offline since this morning. Others can print but my desk cannot.",
    internalNotes: [
      {
        author: "Mercy Achieng",
        note: "Queue cleared, driver cache flushed on user's machine. Monitoring for recurrence.",
        at: "6 h ago",
      },
    ],
    attachments: [],
  },
  {
    id: "KTC-2413",
    subject: "Outlook profile broken after mailbox migration",
    category: "general",
    priority: "Medium",
    status: "Resolved",
    requester: {
      name: "Samuel Otieno",
      department: "Procurement",
      location: "Kawi House Block C, Ground Floor",
      extension: "2301",
    },
    assignee: "Dennis Kiprotich",
    createdAt: hoursAgo(30),
    slaHours: SLA_HOURS.Medium,
    description: "Outlook stuck on 'Trying to connect' since the migration.",
    internalNotes: [
      { author: "Dennis Kiprotich", note: "Rebuilt profile as KETRACO-O365. Sync confirmed.", at: "24 h ago" },
    ],
    attachments: [],
  },
  {
    id: "KTC-2412",
    subject: "Toner replacement — Canon imageRUNNER 2630i (HR printer)",
    category: "printing",
    priority: "Low",
    status: "Awaiting Parts",
    requester: {
      name: "Lucy Wangari",
      department: "Human Capital",
      location: "Kawi House Block B, 1st Floor",
      extension: "2118",
    },
    assignee: "Dennis Kiprotich",
    createdAt: hoursAgo(44),
    slaHours: SLA_HOURS.Low,
    description: "Toner exhausted, print quality faded. Ordered from vendor, awaiting delivery.",
    internalNotes: [
      { author: "Dennis Kiprotich", note: "Vendor ETA 7 working days. LPO KT-LPO-3391.", at: "20 h ago" },
    ],
    attachments: [],
  },
  {
    id: "KTC-2411",
    subject: "VPN token for Isinya substation commissioning team",
    category: "network",
    priority: "High",
    status: "In Progress",
    requester: {
      name: "Ahmed Noor",
      department: "Transmission Operations",
      location: "Isinya Substation — Commissioning Camp",
      extension: "3308",
    },
    assignee: "Victor Sirya",
    createdAt: hoursAgo(6),
    slaHours: SLA_HOURS.High,
    description:
      "Two engineers need VPN with the SCADA split-tunnel group for commissioning next week.",
    internalNotes: [
      { author: "Victor Sirya", note: "Signed request received. Tokens being registered — supervised first connection pending.", at: "2 h ago" },
    ],
    attachments: ["signed-vpn-request.pdf"],
  },
  {
    id: "KTC-2410",
    subject: "Access card not opening Block C turnstile",
    category: "general",
    priority: "Medium",
    status: "Logged",
    requester: {
      name: "Caroline Mutiso",
      department: "Finance",
      location: "Kawi House Block C, 1st Floor",
      extension: "2055",
    },
    createdAt: hoursAgo(2),
    slaHours: SLA_HOURS.Medium,
    description: "Card works on Block B doors but the Block C turnstile rejects it.",
    internalNotes: [],
    attachments: [],
  },
  {
    id: "KTC-2409",
    subject: "SAP FB60 posting rejects with error F5 702",
    category: "sap",
    priority: "High",
    status: "Assigned",
    requester: {
      name: "Brian Kilonzo",
      department: "Finance",
      location: "Kawi Complex Block B, 2nd Floor",
      extension: "2049",
    },
    assignee: "Mercy Achieng",
    createdAt: hoursAgo(4),
    slaHours: SLA_HOURS.High,
    description: "Vendor invoice posting fails with balance in currency error F5 702.",
    internalNotes: [],
    attachments: [],
  },
  {
    id: "KTC-2408",
    subject: "Projector fault — Kawi training room",
    category: "hardware",
    priority: "Low",
    status: "Closed",
    requester: {
      name: "Grace Wambui",
      department: "Finance",
      location: "Kawi Complex Block B, 2nd Floor, Room 204",
      extension: "2045",
    },
    assignee: "Dennis Kiprotich",
    createdAt: hoursAgo(96),
    slaHours: SLA_HOURS.Low,
    description: "Projector no signal over HDMI.",
    internalNotes: [
      { author: "Dennis Kiprotich", note: "HDMI port replaced. Tested with laptop.", at: "72 h ago" },
    ],
    attachments: [],
  },
  {
    id: "KTC-2407",
    subject: "SAP password reset after lockout",
    category: "sap",
    priority: "Low",
    status: "Closed",
    requester: {
      name: "Janet Osewe",
      department: "Transmission Operations",
      location: "Kawi House Block A, 3rd Floor",
      extension: "2210",
    },
    assignee: "Mercy Achieng",
    createdAt: hoursAgo(120),
    slaHours: SLA_HOURS.Low,
    description: "Locked out after 3 failed attempts.",
    internalNotes: [
      { author: "Mercy Achieng", note: "Identity verified on call. Unlocked in SU01, password changed at first logon.", at: "118 h ago" },
    ],
    attachments: [],
  },
];

/** CTI screen-pop caller identity (Ext 2045). */
export const CTI_CALLER = {
  extension: "2045",
  name: "Grace Wambui",
  department: "Finance Department",
  location: "Kawi Complex Block B, 2nd Floor, Room 204",
  switch: "SW-KAWI-B2-C2960 (Port Gi0/14)",
};
