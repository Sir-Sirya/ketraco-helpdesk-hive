import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Bot,
  Headphones,
  Lock,
  Send,
  TicketPlus,
  X,
  Zap,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getArticle } from "@/data/kb";
import { usePortal, DEMO_USERS } from "./portal-context";
import { Button } from "@/components/ui/button";

interface Suggestion {
  id: string;
  title: string;
  restricted?: boolean | undefined;
}

interface Msg {
  id: number;
  from: "me" | "bot" | "agent";
  text: string;
  time?: string | undefined;
  suggestions?: Suggestion[] | undefined;
}

interface Rule {
  match: RegExp;
  reply: string;
  articles: string[];
}

const RULES: Rule[] = [
  {
    match: /sap.*(login|password|lock|timeout|gui)|gui|basis/i,
    reply:
      "SAP login and GUI timeouts are currently trending after the October kernel patch. If your GUI hangs on 'Connection to application server broken', exit all sapgui.exe processes via Task Manager and run the SAP Logon shortcut once as administrator. This rebuilds the sapmsg.ini cache and restores connectivity.",
    articles: ["sap-gui-timeout", "sap-password"],
  },
  {
    match: /print|toner|cartridge|scanner|spooler/i,
    reply:
      "For network printing on KETRACO printers, verify you are on KETRACO-Staff Wi-Fi or LAN (not Guest). Connect via Win + R by typing \\\\ktc-print-01\\<printer-queue>, e.g. \\\\ktc-print-01\\FIN-B2-HP404. If jobs are stuck, clear the Windows print spooler cache.",
    articles: ["printer-win11", "toner-request"],
  },
  {
    match: /wifi|wi-?fi|internet|network|slow|cable|lan/i,
    reply:
      "The KETRACO-Guest Wi-Fi network imposes a 2-hour session expiry limit. Staff should always authenticate to KETRACO-Staff using corporate Windows domain credentials with no session disconnection.",
    articles: ["kawi-wifi"],
  },
  {
    match: /cisco|switch|trunk|vlan|port/i,
    reply:
      "Cisco switch trunking and VLAN allocation (VLAN 80 Finance, VLAN 100 Transmission, VLAN 120 VoIP, VLAN 140 SCADA) is documented in the internal network runbook for ICT & Telecommunications staff.",
    articles: ["cisco-trunking", "kawi-switch-reboot"],
  },
  {
    match: /outlook|email|e-mail|mail|office|teams/i,
    reply:
      "If Outlook is stuck on 'Trying to connect…' after the mailbox migration, open Control Panel > Mail > Show Profiles, create a new profile named 'KETRACO-O365', and sign in with modern authentication.",
    articles: ["outlook-profile"],
  },
  {
    match: /card|access|door|turnstile|security/i,
    reply:
      "Turnstile or door access rejections at Kawi House HQ usually indicate a missing security zone profile. ICT staff can reprovision your RFID tag profile within 2 hours.",
    articles: ["access-card"],
  },
  {
    match: /laptop|battery|charger|keyboard|screen|hardware/i,
    reply:
      "Hardware repairs are triaged at Kawi House ICT desk. A temporary loaner laptop from the pool can be issued with your OneDrive files intact while yours undergoes RMA.",
    articles: ["laptop-rma"],
  },
  {
    match: /vpn|remote|substation|suswa|isinya|dandora/i,
    reply:
      "Remote substation engineers (Suswa, Isinya, Dandora) require an approved remote access form signed by their department head and an issued hardware VPN token for SCADA access.",
    articles: ["substation-vpn"],
  },
  {
    match: /ups|power|scada/i,
    reply:
      "SCADA UPS beeping indicates battery operation. Check wall sockets and input breakers immediately. Never power-cycle the SCADA console while RTU telemetry is active.",
    articles: ["scada-ups"],
  },
];

const FALLBACK_RULE: Rule = {
  match: /.*/,
  reply:
    "I am trained on KETRACO ICT policies and runbooks. I can assist with SAP, enterprise printers, staff Wi-Fi, Office 365, VPN tokens, or hardware repairs. You can also transfer to our on-duty engineer at any time.",
  articles: ["printer-win11", "sap-password", "outlook-profile"],
};

const QUICK_CHIPS = [
  "SAP GUI connection timeout",
  "Printer shows offline",
  "Staff Wi-Fi keeps dropping",
  "Unlock my SAP password",
];

const AGENT_SCRIPT = [
  "Hello Grace, I am monitoring the Kawi House queue and can see your station on SW-KAWI-B2-C2960 Gi0/14. How can I assist?",
  "Understood. Let me check the switch port and queue status on our side.",
  "I have verified the diagnostics. I can convert this chat into an official ticket for you right away so our dispatch team can action it.",
];

function toSuggestion(id: string): Suggestion | null {
  const a = getArticle(id);
  if (!a) return null;
  return { id: a.id, title: a.title, restricted: a.restricted };
}

const getCurrentTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function ChatWidget() {
  const { chat, openChat, closeChat, openArticle, role, user, openTicketDrawer } = usePortal();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const nextId = () => ++idRef.current;

  // Initialize conversation whenever widget opens or mode changes
  useEffect(() => {
    if (!chat.open) return;
    setMessages([]);
    setAgentStep(0);

    if (chat.mode === "agent") {
      setConnecting(true);
      setTyping(true);
      const timer = setTimeout(() => {
        setConnecting(false);
        setTyping(false);
        setMessages([
          {
            id: nextId(),
            from: "agent",
            time: getCurrentTime(),
            text: `Hello ${user.name}! Victor Sirya here, on duty at the Kawi House ICT Control Room.${
              chat.context ? ` I see you were reading "${chat.context}".` : ""
            } How can I assist you today?`,
          },
        ]);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setConnecting(false);
      setTyping(true);
      const timer = setTimeout(() => {
        setTyping(false);
        setMessages([
          {
            id: nextId(),
            from: "bot",
            time: getCurrentTime(),
            text: `Habari! I am KETRACO HelpBot. How can I assist with your SAP, network, hardware, or printing setup today?${
              chat.context ? ` I noticed you were looking at "${chat.context}".` : ""
            }`,
          },
        ]);
      }, 600);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.open, chat.mode, chat.context]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  if (!chat.open) {
    return (
      <button
        type="button"
        onClick={() => openChat("bot")}
        aria-label="Open KETRACO HelpBot chat"
        className="group fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-float transition-all duration-300 hover:scale-105 hover:bg-brand-dark"
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-25" />
        <Zap className="relative h-6 w-6 text-primary-foreground" />
      </button>
    );
  }

  const isAgent = chat.mode === "agent";

  const pushBotAnswer = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const rule = RULES.find((r) => r.match.test(text)) ?? FALLBACK_RULE;
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          from: "bot",
          time: getCurrentTime(),
          text: rule.reply,
          suggestions: rule.articles
            .map(toSuggestion)
            .filter((s): s is Suggestion => s !== null),
        },
      ]);
    }, 700);
  };

  const pushAgentAnswer = () => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          from: "agent",
          time: getCurrentTime(),
          text: AGENT_SCRIPT[agentStep % AGENT_SCRIPT.length] ?? "I will review this right away.",
        },
      ]);
      setAgentStep((s) => s + 1);
    }, 1200);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: nextId(), from: "me", time: getCurrentTime(), text }]);
    setInput("");
    if (isAgent) pushAgentAnswer();
    else pushBotAnswer(text);
  };

  const convertChatToTicket = () => {
    const userTurns = messages
      .filter((m) => m.from === "me")
      .map((m) => `• [${m.time || "turn"}] User: ${m.text}`);
    const firstUserText = messages.find((m) => m.from === "me")?.text ?? "Live Chat Escalation";

    openTicketDrawer({
      subject: `Live Chat — ${firstUserText.slice(0, 60)}`,
      description: `Incident escalated from live agent chat with ${DEMO_USERS.admin.name}.\n\nChat Transcript:\n${
        userTurns.join("\n") || "(no messages logged)"
      }`,
      source: "chat",
    });

    toast.success("Chat converted to incident ticket", {
      description: "Transcript attached — please review and submit the ticket.",
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 fixed right-4 bottom-4 z-50 flex h-[min(600px,82vh)] w-[min(94vw,400px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float duration-200">
      {/* Header */}
      {isAgent ? (
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 shadow-sm">
          <div className="relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xs font-bold text-primary-foreground shadow-sm">
              {DEMO_USERS.admin.initials}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-success ring-2 ring-card" />
            </span>
          </div>

          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-foreground truncate">
                {DEMO_USERS.admin.name}
              </p>
              <span className="rounded-full bg-brand-tint px-1.5 py-0.5 text-[10px] font-bold text-brand-dark">
                On Duty
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {connecting
                ? "Connecting to Victor Sirya - On Duty ICT Support..."
                : typing
                ? "Victor is typing..."
                : "ICT Support Engineer · HQ Control Room"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openChat("bot")}
              title="Return to AI HelpBot"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => closeChat()}
              aria-label="Close chat"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-gradient-to-r from-brand to-brand-dark px-4 py-3 text-primary-foreground shadow-sm">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-5 w-5 text-primary-foreground" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-success ring-2 ring-brand" />
          </div>

          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm">KETRACO HelpBot</p>
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-semibold">
                AI Agent
              </span>
            </div>
            <p className="text-[11px] opacity-90 truncate">
              Instant 24/7 runbooks, SOPs & diagnostics
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => closeChat()}
            className="h-8 w-8 text-primary-foreground hover:bg-white/15"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Messages Body */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas p-3.5">
        {connecting && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand-tint/60 p-3 text-xs font-semibold text-brand-dark animate-pulse">
            <Headphones className="h-4 w-4 text-brand" />
            Connecting to Victor Sirya - On Duty ICT Support...
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="space-y-1.5">
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs",
                m.from === "me" && "ml-auto rounded-br-xs bg-brand text-primary-foreground",
                m.from === "bot" && "rounded-bl-xs border border-border bg-card text-foreground",
                m.from === "agent" && "rounded-bl-xs border border-brand/20 bg-card text-foreground",
              )}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              {m.time && (
                <span
                  className={cn(
                    "mt-1 block text-[9px] text-right",
                    m.from === "me" ? "text-primary-foreground/75" : "text-muted-foreground",
                  )}
                >
                  {m.time}
                </span>
              )}
            </div>

            {/* Related KB Suggestions */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                  Suggested Runbooks:
                </p>
                {m.suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openArticle(s.id)}
                    className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-left text-xs font-medium text-foreground shadow-xs transition-colors hover:border-brand hover:bg-brand-tint hover:text-brand-dark"
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-brand" />
                    <span className="flex-1 truncate">{s.title}</span>
                    {s.restricted && role === "user" && (
                      <Lock className="h-3 w-3 shrink-0 text-energy" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {typing && !connecting && (
          <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-bl-xs border border-border bg-card px-3 py-2.5 shadow-xs">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:300ms]" />
          </div>
        )}

        {/* Quick Chips for Bot */}
        {!isAgent && messages.length <= 2 && !typing && (
          <div className="space-y-1.5 pt-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Common Questions:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      { id: nextId(), from: "me", time: getCurrentTime(), text: chip },
                    ]);
                    pushBotAnswer(chip);
                  }}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-brand hover:bg-brand-tint hover:text-brand-dark"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="space-y-2 border-t border-border bg-card p-3">
        {/* Switch to Human Agent Button */}
        {!isAgent && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openChat("agent", chat.context)}
            className="w-full gap-2 border-brand/40 bg-brand-tint/50 text-xs font-semibold text-brand-dark hover:bg-brand-tint"
          >
            <Headphones className="h-3.5 w-3.5 text-brand" />
            Talk to Human Agent (Victor Sirya)
          </Button>
        )}

        {/* ICT Admin Button: Convert Chat to Incident Ticket */}
        {isAgent && role === "admin" && (
          <Button
            variant="outline"
            size="sm"
            onClick={convertChatToTicket}
            className="w-full gap-2 border-energy/40 bg-energy-tint/50 text-xs font-semibold text-energy hover:bg-energy-tint"
          >
            <TicketPlus className="h-3.5 w-3.5 text-energy" />
            Convert Chat to Incident Ticket
          </Button>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={
              isAgent ? `Message ${DEMO_USERS.admin.name}…` : "Describe your ICT issue…"
            }
            className="flex h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <Button
            onClick={send}
            size="icon"
            className="h-9 w-9 bg-brand hover:bg-brand-dark"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          Logged in as {user.name} ({user.department})
        </p>
      </div>
    </div>
  );
}
