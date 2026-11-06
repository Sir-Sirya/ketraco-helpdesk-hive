import type { LucideIcon } from "lucide-react";
import {
  Printer,
  Database,
  Network,
  MonitorSmartphone,
  Wrench,
} from "lucide-react";

export type CategoryId = "printing" | "sap" | "network" | "general" | "hardware";

export interface KbCategory {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  /** Only ICT staff (admin role) may open this category and its articles. */
  restricted?: boolean;
}

export const KB_CATEGORIES: KbCategory[] = [
  { id: "printing", label: "Enterprise Printing", icon: Printer },
  { id: "sap", label: "SAP & ERP", icon: Database },
  { id: "network", label: "Network & Infrastructure", icon: Network, restricted: true },
  { id: "general", label: "General IT", icon: MonitorSmartphone },
  { id: "hardware", label: "Hardware", icon: Wrench },
];

export function categoryLabel(id: CategoryId): string {
  return KB_CATEGORIES.find((c) => c.id === id)?.label ?? "General";
}

export interface KbArticle {
  id: string;
  title: string;
  category: CategoryId;
  summary: string;
  views: number;
  helpful: number;
  notHelpful: number;
  updated: string;
  tags: string[];
  /** Restricted to ICT & Telecommunications staff only. */
  restricted?: boolean;
  /** Amber "Internal ICT Runbook" badge (visible to admins). */
  internal?: boolean;
  /** Appears in the Trending Now (last 48 hours) rail. */
  trending?: { spike: string };
  content: string;
}

export const KB_ARTICLES: KbArticle[] = [
  {
    id: "sap-gui-timeout",
    title: "SAP GUI Connection Timeout after Patch",
    category: "sap",
    summary:
      "Finance and Transmission Operations users get 'Connection to application server broken' after the October kernel patch.",
    views: 1840,
    helpful: 156,
    notHelpful: 9,
    updated: "6 hours ago",
    tags: ["SAP GUI", "PRD", "timeout", "kernel patch"],
    trending: { spike: "312%" },
    content: `## Summary
After the October SAP kernel patch, several Finance and Transmission Operations users cannot log in — the GUI hangs on **Connection to application server broken** and then times out.

## Quick fix (works for most users)
- Close SAP GUI completely. Check Task Manager and end any remaining \`sapgui.exe\` process.
- Launch the SAP Logon shortcut **once as administrator** so the rebuilt \`sapmsg.ini\` is picked up.
- Reopen SAP GUI normally and log in to client **100 (PRD)**.

## If the quick fix does not work
1. Ping the production server \`sap-prd-01.ketraco.local\` — expect replies under 5 ms from HQ.
2. Capture a screenshot of the error, including the **return code** in the status bar.
3. Log a ticket under **SAP & ERP** and attach the screenshot. ICT escalates to the BASIS team with the trace file.

## Checklist
- [x] Close all sapgui.exe instances
- [x] Relaunch once as administrator
- [ ] Confirm login to PRD client 100
- [ ] Escalate to BASIS if still failing`,
  },
  {
    id: "kawi-switch-reboot",
    title: "Kawi 2nd Floor Network Switch Reboot (SW-KAWI-B2-C2960)",
    category: "network",
    summary:
      "Runbook for the managed reboot of SW-KAWI-B2-C2960 covering Finance and Human Capital desks on the 2nd floor.",
    views: 940,
    helpful: 71,
    notHelpful: 2,
    updated: "48 minutes ago",
    tags: ["Catalyst 2960", "SW-KAWI-B2", "Gi0/14", "reboot", "VLAN 80"],
    restricted: true,
    internal: true,
    trending: { spike: "187%" },
    content: `## Impact window
SW-KAWI-B2-C2960 serves **Finance and Human Capital** desks on the 2nd floor of Kawi Complex Block B, plus the Gi0/14 uplink used by the 204-series extensions. Expect a 90-second outage per stack member.

## Pre-checks
- Confirm no SAP batch job is running from Finance (check SM37 for active jobs on \`sap-prd-01\`).
- Announce the reboot on the ICT Teams channel **#kawi-operations**.
- Note current port errors: \`show interfaces Gi0/14 | include errors\`.

## Controlled reboot
1. SSH to \`10.20.2.11\` with your ICT operator credentials.
2. \`write mem\` then \`reload in 1\` — never reload at the moment, allow the 1-minute grace period.
3. Verify stack recovery: \`show version\` and \`show ip interface brief\`.

## VLAN table (trunk ports)
- VLAN 80 — Finance user segment — 10.20.8.0/23
- VLAN 120 — VoIP (204-series extensions) — 10.20.12.0/24
- VLAN 160 — Building management — 10.20.16.0/22

## Escalation
If the stack fails to recover in 5 minutes, call the NOC duty phone (Ext 2002) and raise a **Critical** ticket referencing the switch hostname.`,
  },
  {
    id: "printer-win11",
    title: "Map a Network Printer on Windows 11 (HP LaserJet M404)",
    category: "printing",
    summary:
      "Step-by-step guide to connect a KETRACO network printer by queue name, including the driver cache fix.",
    views: 2980,
    helpful: 244,
    notHelpful: 21,
    updated: "2 days ago",
    tags: ["printing", "Windows 11", "HP LaserJet", "print queue"],
    content: `## Find the queue name
Every KETRACO printer is named after its location, e.g. \\\\ktc-print-01\\\\FIN-B2-HP404 for the Finance open-area printer on Kawi Complex Block B.

## Add the printer
1. Press **Win + R**, paste the queue path and press Enter — Windows installs the driver automatically.
2. If asked for a driver, choose **HP Universal Printing PCL 6**.
3. Print a test page from **Settings > Bluetooth & devices > Printers & scanners**.

## If nothing prints
- Clear the driver cache: stop the **Print Spooler** service, delete everything in \`C:\\\\Windows\\\\System32\\\\spool\\\\PRINTERS\`, start the service again.
- Confirm you are on the corporate network or VPN — guest Wi-Fi cannot reach the print servers.

## Checklist
- [x] Queue path pasted in Win + R
- [x] Test page printed
- [ ] Spooler cache cleared if still stuck`,
  },
  {
    id: "cisco-trunking",
    title: "Cisco Switch Trunking Configuration — KETRACO VLAN Table",
    category: "network",
    summary:
      "Internal runbook for 802.1Q trunk ports between Kawi House distribution and substation access switches.",
    views: 4120,
    helpful: 312,
    notHelpful: 14,
    updated: "3 days ago",
    tags: ["Cisco", "trunk", "802.1Q", "VLAN", "Catalyst"],
    restricted: true,
    internal: true,
    content: `## Standard trunk template (Gi0/1 example)
- \`switchport mode trunk\`
- \`switchport trunk allowed vlan 80,120,160\`
- \`switchport trunk native vlan 999\`
- \`spanning-tree port type network\`
- Description line: **Trunk-to-Distribution-SW-KAWI-B1**

## KETRACO VLAN allocation
- VLAN 80 — Finance & Admin users — Kawi House / Complex
- VLAN 100 — Transmission Operations — substation LANs
- VLAN 120 — VoIP handsets — 2xxx extensions
- VLAN 140 — SCADA — routed to substation RTUs only
- VLAN 160 — Building management & CCTV

## Diagnostics
1. \`show interfaces trunk\` — confirm VLANs are being carried, not pruned.
2. \`show spanning-tree vlan 80 root\` — HQ distribution must be root for user VLANs.
3. \`show cdp neighbors\` — verify the far end is the expected switch before config changes.

## Escalation
Any trunk change on a **SCADA-linked** switch requires a change request approved by the SCADA lead. Raise it at least 24 hours before the window.`,
  },
  {
    id: "sap-password",
    title: "Unlock or Reset Your SAP Password",
    category: "sap",
    summary:
      "Self-service unlock steps, and what to do when your SAP user is locked out after failed logons.",
    views: 2605,
    helpful: 198,
    notHelpful: 11,
    updated: "1 week ago",
    tags: ["SAP", "password", "lockout", "SU01"],
    content: `## Locked after failed logons
SAP locks a user after **3 failed attempts**. The lock usually clears itself after 30 minutes — wait, then log in once with the correct password.

## Need it faster (ICT staff / user with ticket)
1. Verify the requester's identity against the staff register — never reset by email request alone.
2. ICT unlocks via transaction **SU01** > Unlock, or issues a temporary password valid for one logon.
3. The user changes it immediately via **System > User Profile > Own Data**.

## Password rules
- Minimum 10 characters, must mix upper case, lower case and a digit.
- Cannot repeat any of your last 5 passwords.
- Do **not** reuse your network/Office 365 password — SAP is a separate credential.

## Checklist
- [x] Identity verified against staff register
- [x] Temporary password issued
- [ ] User changed password at first logon`,
  },
  {
    id: "outlook-profile",
    title: "Repair a Broken Outlook Profile (Office 365)",
    category: "general",
    summary:
      "Fix syncing failures, stuck signatures and 'Trying to connect…' after the mailbox migration.",
    views: 2310,
    helpful: 175,
    notHelpful: 18,
    updated: "4 days ago",
    tags: ["Outlook", "Office 365", "profile", "migration"],
    trending: { spike: "41%" },
    content: `## Symptoms
Outlook shows **Trying to connect…**, mail stops syncing, or the signature resets every launch — common after the Office 365 mailbox migration.

## Repair steps
1. Close Outlook fully, then open **Control Panel > Mail (Microsoft Outlook) > Show Profiles**.
2. Remove the old profile, click **Add**, name it \`KETRACO-O365\` and let autodiscover configure it.
3. When prompted, accept the modern authentication prompt with your KETRACO email and MFA.
4. Let the mailbox index rebuild — large mailboxes take 20–40 minutes.

## Still failing?
- Test webmail at \`outlook.office365.com\`. If webmail works, it is a desktop profile issue; if it does not, log a ticket under **General IT**.

## Checklist
- [x] Old profile removed
- [x] New profile created and signed in
- [ ] Webmail tested as fallback`,
  },
  {
    id: "kawi-wifi",
    title: "Wi-Fi Keeps Dropping on Kawi Guest Network",
    category: "general",
    summary:
      "Why guest Wi-Fi drops between floors, and how staff Wi-Fi differs from the guest SSID.",
    views: 1290,
    helpful: 88,
    notHelpful: 25,
    updated: "5 days ago",
    tags: ["Wi-Fi", "guest", "Kawi House"],
    content: `## Known cause
The **KETRACO-Guest** SSID has a 2-hour session limit and hands you between floor access points. Drops after exactly 2 hours are the session limit, not a fault.

## Move to staff Wi-Fi
1. Staff devices should use **KETRACO-Staff** with your network account — it has no session limit.
2. Select the SSID, choose **Use my Windows account** when prompted and sign in.
3. Delete the saved Guest profile to stop your laptop auto-reconnecting to it.

## When to log a ticket
If **KETRACO-Staff** also drops, note your floor and nearest meeting room — that identifies the access point. Log the ticket under **General IT** with those details.`,
  },
  {
    id: "scada-ups",
    title: "UPS Alarm on a SCADA Workstation — First Response",
    category: "hardware",
    summary:
      "Immediate actions when the UPS behind a SCADA operator console beeps — protect the RTU link first.",
    views: 620,
    helpful: 52,
    notHelpful: 1,
    updated: "2 days ago",
    tags: ["UPS", "SCADA", "power", "Suswa", "Dandora"],
    restricted: true,
    internal: true,
    trending: { spike: "96%" },
    content: `## Priority
A SCADA console losing power can drop the **RTU telemetry link** to the substation. Treat every UPS alarm in a control room as urgent until proven otherwise.

## First response (under 10 minutes)
1. Identify the alarm type on the UPS front panel: **On battery**, **Battery low**, or **Internal fault**.
2. If on battery: check the wall socket and the UPS input breaker — a tripped breaker is the usual culprit.
3. Do **not** power-cycle the workstation while the RTU link is live. Notify the shift operator before any restart.
4. Log the battery model and serial — units older than 3 years get a battery replacement, not a reset.

## Escalation
Raise a **Critical** hardware ticket and phone the ICT control room (Ext 2001). If the RTU link drops, also notify Transmission Operations shift supervisor immediately.`,
  },
  {
    id: "laptop-rma",
    title: "Laptop Hardware Fault — RMA and Loaner Process",
    category: "hardware",
    summary:
      "How hardware faults are assessed, the loaner laptop pool, and what happens during an RMA.",
    views: 880,
    helpful: 63,
    notHelpful: 8,
    updated: "1 week ago",
    tags: ["laptop", "RMA", "loaner", "hardware"],
    content: `## Step 1 — Book a hardware assessment
Log a ticket under **Hardware** with a photo of the fault if it is physical (cracked hinge, dead pixels). ICT does triage at the Kawi House ICT desk within one working day.

## Step 2 — Loaner laptop
- If your device must leave for repair, ICT issues a **loaner from the pool** (subject to availability) with your data restored from your OneDrive profile.
- Keep working from OneDrive — locally-stored files do not follow you to the loaner.

## Step 3 — RMA
- ICT ships the device to the vendor; typical turnaround is **5–10 working days**.
- You keep the loaner until the RMA closes. Track progress through your ticket.`,
  },
  {
    id: "toner-request",
    title: "Printer Toner and Consumables Request",
    category: "printing",
    summary:
      "How to request toner, and what the 'Awaiting Parts' status on your ticket means.",
    views: 1120,
    helpful: 74,
    notHelpful: 6,
    updated: "2 weeks ago",
    tags: ["toner", "consumables", "printing"],
    content: `## How to request toner
1. Log a ticket under **Enterprise Printing** with the printer's location tag (e.g. \`FIN-B2-HP404\`).
2. ICT checks the consumables store at Kawi House and dispatches within 2 working days for stocked items.
3. Replace the cartridge yourself — the used one goes back to ICT for vendor recycling.

## Why your ticket shows 'Awaiting Parts'
Non-stocked consumables (fuser kits, drum units) are ordered from the vendor. Your ticket moves to **Awaiting Parts** until delivery — typical lead time is **7 working days**.`,
  },
  {
    id: "substation-vpn",
    title: "VPN Access for Remote Substation Engineers (Suswa / Isinya / Dandora)",
    category: "network",
    summary:
      "Provisioning VPN tokens for commissioning teams and the SCADA split-tunnel rules.",
    views: 540,
    helpful: 47,
    notHelpful: 2,
    updated: "1 week ago",
    tags: ["VPN", "substation", "SCADA", "token"],
    restricted: true,
    internal: true,
    content: `## Who qualifies
Commissioning and maintenance engineers assigned to **Suswa, Isinya or Dandora** with an approved remote-access request signed by their head of department.

## Provisioning steps (ICT staff)
1. Verify the signed request and the engineer's staff number.
2. Issue a hardware token from the vault and register it against their account.
3. Apply the **SCADA split-tunnel group** only for SCADA engineers — standard engineers get corporate LAN access only.
4. Confirm the first connection while on a call with the engineer.

## SCADA split-tunnel rules
- 10.140.0.0/16 (substation RTU VLANs) — SCADA group only
- 10.20.0.0/16 (corporate LAN) — all VPN engineers
- Internet — via corporate proxy, no direct egress

## Checklist
- [x] Signed request on file
- [x] Token issued and registered
- [ ] First connection supervised`,
  },
  {
    id: "access-card",
    title: "Building Access Card Not Working at Kawi House",
    category: "general",
    summary:
      "Common reasons a KETRACO access card stops opening turnstiles and how to get it fixed.",
    views: 1610,
    helpful: 121,
    notHelpful: 14,
    updated: "3 days ago",
    tags: ["access card", "turnstile", "security"],
    content: `## Quick checks
- Try the card slowly on the reader — access cards fail when waved too fast.
- If it works at other doors but not one, your **zone profile** is missing that area — log a ticket under **General IT** naming the door.
- If it fails everywhere, the card is likely demagnetised or deactivated.

## Replacement
1. ICT deactivates the old card so a lost card cannot be reused by someone else.
2. A new card is printed at the ICT desk, Kawi House HQ, within one working day.
3. Bring your staff ID — cards are only issued against ID verification.`,
  },
];

export const TRENDING_IDS = ["sap-gui-timeout", "kawi-switch-reboot", "scada-ups", "outlook-profile"];

export const POPULAR_IDS = ["cisco-trunking", "printer-win11", "sap-password", "outlook-profile", "sap-gui-timeout"];

export function getArticle(id: string): KbArticle | undefined {
  return KB_ARTICLES.find((a) => a.id === id);
}

export function searchArticles(query: string): KbArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return KB_ARTICLES.filter((a) =>
    [a.title, a.summary, a.tags.join(" ")].join(" ").toLowerCase().includes(q),
  ).slice(0, 6);
}
