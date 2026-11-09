export interface CtiCaller {
  name: string;
  department: string;
  location: string;
  extension: string;
  switch: string;
  port: string;
  email: string;
  activeOpenTickets: number;
}

export const CTI_CALLER: CtiCaller = {
  name: "Grace Wambui",
  department: "Finance Department",
  location: "Kawi Complex Block B, 2nd Floor, Room 204",
  extension: "2045",
  switch: "SW-KAWI-B2-C2960 (Port Gi0/14)",
  port: "Gi0/14",
  email: "grace.wambui@ketraco.co.ke",
  activeOpenTickets: 1,
};

export const CTI_OPEN_TICKET_COUNT = 1;
