# KETRACO Smart HelpDesk & Knowledge Portal

An enterprise-grade ICT Support Helpdesk, Knowledge Portal, CTI Telephony Simulator, and AI Chatbot designed for **Kenya Electricity Transmission Company (KETRACO)**.

---

## ⚡ Overview

KETRACO Smart HelpDesk streamlines ICT support operations across KETRACO's headquarters at Kawi House and high-voltage transmission substations (Suswa, Isinya, Dandora, Olkaria, Rabai, and Lessos).

Built with **React**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and **shadcn/ui**, it provides:

- **Interactive Knowledge Portal**: Instant autocomplete search, service category filters, real-time flame spike indicators (Last 48 Hours), and all-time popular inquiries with helpful ratings.
- **Role-Based Access Control (RBAC)**: Dynamic persona switching between **General User** (*Grace Wambui — Finance*) and **ICT Admin** (*Victor Sirya — ICT & Telecommunications*).
- **Incident & Ticket Tracking**:
  - *General Users*: Visual SLA progress timeline across Logged, Assigned, In Progress, and Resolved lifecycle stages.
  - *ICT Admins*: Enterprise Kanban board and Data Table with multi-factor filters (Status, Department, Assignee, Priority) and an internal technician notes modal.
- **CTI Telephony / Screen-Pop Simulator**: Simulated incoming VoIP calls (Ext: 2045) with automatic caller matching, switch port telemetry, and 1-click incident logging.
- **Integrated AI HelpBot & Live Agent Handoff**: Conversational AI assistant with 1-click transfer to human technicians and admin ticket conversion.

---

## 🎨 Brand Guidelines & Palette

| Token | Hex Code | Role |
| :--- | :--- | :--- |
| **Primary Brand Green** | `#2E6B34` | Headers, primary actions, active navigation, active tabs |
| **Dark Accent Green** | `#235227` | Hover states, sidebar accents, active badges |
| **Light Green Tint** | `#EAF3EB` | Active pill highlights, background tints, notification banners |
| **Energy Accent Red** | `#D81E27` | Critical priority badges, electricity spark accents, live call indicator |
| **Light Red Tint** | `#FDEDEE` | Critical alerts background, flame spike badge |
| **Neutral Canvas** | `#F8FAFC` | Main canvas background |
| **Card Surface** | `#FFFFFF` | Card backgrounds and elevated surfaces |
| **Ink** | `#0F172A` | Primary text and headings |
| **Muted Ink** | `#64748B` | Subtitles, labels, and secondary metadata |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ketraco-helpdesk-hive

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Type check and build
npx tsc --noEmit
npm run build

# Preview build
npm run preview
```

### Run Tests

```bash
npm test
```

---

## 🏛️ Architecture & Structure

```
src/
├── assets/             # KETRACO transmission tower motifs and logos
├── components/
│   ├── portal/         # TopBar, Sidebar, CtiCallCard, ChatWidget, Drawers
│   └── ui/             # shadcn/ui components (Dialog, Sheet, Button, Input, etc.)
├── data/
│   ├── kb.ts           # Certified KETRACO runbooks, SOPs, and category data
│   ├── tickets.ts      # Substation and HQ incident tickets and SLA configuration
│   └── cti.ts          # VoIP directory and CTI screen-pop profiles
├── lib/
│   ├── kb-markdown.tsx # Custom markdown renderer with CLI copy buttons
│   ├── utils.ts        # Class merging and utility helpers
│   └── error-reporting.ts # Application telemetry
├── routes/
│   ├── __root.tsx      # Root shell with responsive desktop/mobile layouts
│   ├── index.tsx       # Page A: Knowledge Portal & FAQ landing page
│   └── tickets.tsx     # Page B: Ticket Tracker & Logging Console
└── styles.css          # Design system tokens and brand palettes
```

---

© Kenya Electricity Transmission Company Limited (KETRACO). All Rights Reserved.
