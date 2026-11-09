/**
 * Enterprise client-side error capture and reporting for KETRACO Smart HelpDesk.
 */
export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[KETRACO HelpDesk Error]", error, context);
}
