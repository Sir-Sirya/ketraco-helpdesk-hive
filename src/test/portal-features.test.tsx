import { describe, expect, it } from "vitest";
import {
  KB_ARTICLES,
  KB_CATEGORIES,
  searchArticles,
  categoryLabel,
  POPULAR_IDS,
  TRENDING_IDS,
} from "@/data/kb";
import {
  INITIAL_TICKETS,
  SLA_HOURS,
  STATUS_ORDER,
  OPEN_STATUSES,
  DEPARTMENTS,
} from "@/data/tickets";
import { CTI_CALLER, CTI_OPEN_TICKET_COUNT } from "@/data/cti";
import { DEMO_USERS } from "@/components/portal/portal-context";

describe("KETRACO Smart HelpDesk Data & RBAC Specification", () => {
  it("verifies Demo Users for role switching demo", () => {
    expect(DEMO_USERS.user.name).toBe("Grace Wambui");
    expect(DEMO_USERS.user.department).toBe("Finance");
    expect(DEMO_USERS.user.extension).toBe("2045");

    expect(DEMO_USERS.admin.name).toBe("Victor Sirya");
    expect(DEMO_USERS.admin.department).toBe("ICT & Telecommunications");
    expect(DEMO_USERS.admin.extension).toBe("2001");
  });

  it("verifies CTI telephony simulator caller data", () => {
    expect(CTI_CALLER.name).toBe("Grace Wambui");
    expect(CTI_CALLER.department).toContain("Finance");
    expect(CTI_CALLER.extension).toBe("2045");
    expect(CTI_CALLER.switch).toContain("SW-KAWI-B2-C2960");
    expect(CTI_CALLER.port).toBe("Gi0/14");
    expect(CTI_OPEN_TICKET_COUNT).toBe(1);
  });

  it("enforces RBAC on privileged network and infrastructure articles", () => {
    const networkCat = KB_CATEGORIES.find((c) => c.id === "network");
    expect(networkCat?.restricted).toBe(true);

    const ciscoTrunking = KB_ARTICLES.find((a) => a.id === "cisco-trunking");
    expect(ciscoTrunking).toBeDefined();
    expect(ciscoTrunking?.restricted).toBe(true);
    expect(ciscoTrunking?.internal).toBe(true);

    const switchReboot = KB_ARTICLES.find((a) => a.id === "kawi-switch-reboot");
    expect(switchReboot).toBeDefined();
    expect(switchReboot?.restricted).toBe(true);
    expect(switchReboot?.internal).toBe(true);
  });

  it("verifies SLA hours configuration", () => {
    expect(SLA_HOURS.Critical).toBe(2);
    expect(SLA_HOURS.High).toBe(8);
    expect(SLA_HOURS.Medium).toBe(24);
    expect(SLA_HOURS.Low).toBe(72);
  });

  it("verifies required ticket status progression lifecycle", () => {
    expect(STATUS_ORDER).toEqual([
      "Logged",
      "Assigned",
      "In Progress",
      "Awaiting Parts",
      "Resolved",
      "Closed",
    ]);

    expect(OPEN_STATUSES).toContain("Logged");
    expect(OPEN_STATUSES).toContain("Assigned");
    expect(OPEN_STATUSES).toContain("In Progress");
    expect(OPEN_STATUSES).toContain("Awaiting Parts");
    expect(OPEN_STATUSES).not.toContain("Resolved");
    expect(OPEN_STATUSES).not.toContain("Closed");
  });

  it("verifies KETRACO enterprise departments in data model", () => {
    expect(DEPARTMENTS).toContain("Transmission Operations");
    expect(DEPARTMENTS).toContain("Finance");
    expect(DEPARTMENTS).toContain("SCADA");
    expect(DEPARTMENTS).toContain("Human Capital");
    expect(DEPARTMENTS).toContain("Procurement");
    expect(DEPARTMENTS).toContain("ICT & Telecommunications");
  });

  it("verifies search articles functionality matches SAP and network runbooks", () => {
    const sapResults = searchArticles("sap");
    expect(sapResults.length).toBeGreaterThan(0);
    expect(sapResults.some((a) => a.id === "sap-gui-timeout")).toBe(true);

    const ciscoResults = searchArticles("cisco");
    expect(ciscoResults.length).toBeGreaterThan(0);
    expect(ciscoResults.some((a) => a.id === "cisco-trunking")).toBe(true);
  });

  it("verifies trending and popular articles lists", () => {
    expect(TRENDING_IDS.length).toBeGreaterThanOrEqual(2);
    expect(TRENDING_IDS).toContain("sap-gui-timeout");
    expect(TRENDING_IDS).toContain("kawi-switch-reboot");

    expect(POPULAR_IDS.length).toBeGreaterThanOrEqual(2);
    expect(POPULAR_IDS).toContain("cisco-trunking");
    expect(POPULAR_IDS).toContain("printer-win11");
  });
});
