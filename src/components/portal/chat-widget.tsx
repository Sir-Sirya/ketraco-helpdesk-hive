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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getArticle, KB_ARTICLES } from "@/data/kb";
import { usePortal } from "./portal-context";
import { DEMO_USERS } from "./portal-context";
import { Button } from "@/components/ui/button";

interface Suggestion {
  id: string;
  title: string;
  restricted?: boolean;
}

interface Msg {
  id: number;
  from: "me" | "bot" | "agent";
  text: string;
  suggestions?: Suggestion[];
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
      "SAP login and GUI issues are the top spike this week. If the GUI hangs on 'Connection to application server broken', close all sapgui.exe instances and relaunch once as administrator — that fixes most cases after the kernel patch.",
    articles: ["sap-gui-timeout", "sap-password"],
  },
  {
    match: /print|toner|cartridge|scanner/i,
    reply:
      "For printer trouble, first confirm you're on the corporate network (not guest Wi-Fi) and paste the printer's queue path in Win + R, e.g. \\\\ktc-print-01\\FIN-B2-HP404.",
    articles: ["printer-win11", "toner-request"],
  },
  {
    match: /wifi|wi-?fi|internet|network|slow|cable|lan/i,
    reply:
      "Wi-Fi drops on KETRACO-Guest are usually the 2-hour session limit or a floor-to-floor handover. Staff devices should use KETRACO-Staff with your Windows account instead.",
    articles: ["kawi-wifi"],
  },
  {
    match: /outlook|email|e-mail|mail|office|teams/i,
    reply:
      "Outlook stuck on 'Trying to connect…' after the mailbox migration is fixed by rebuilding the profile. Takes about 5 minutes plus index rebuild time.",
    articles: ["outlook-profile"],
  },
  {
    match: /card|access|door|turnstile|security/i,
    reply:
      "If your access card works on some doors but not others, your zone profile is missing that area. ICT can add it — name the exact door in your ticket.",
    articles: ["access-card"],
  },
  {
    match: /laptop|battery|charger|keyboard|screen|hardware/i,
    reply:
      "Hardware faults are triaged at the Kawi House ICT desk within one working day, and you can get a loaner laptop while yours is repaired. Keep working from OneDrive so your files follow you.",
    articles: ["laptop-rma"],
  },
  {
    match: /vpn|remote|substation|suswa|isinya|dandora/i,
    reply:
      "Remote substation access needs a signed request from your head of department plus a hardware VPN token. SCADA engineers also get the split-tunnel group.",
    articles: ["substation-vpn"],
  },
  {
    match: /ups|power|scada/i,
    reply:
      "A UPS alarm in a SCADA control room is urgent — the RTU telemetry link can drop. Check the input breaker first and never power-cycle the console while the link is live.",
    articles: ["scada-ups"],
  },
];

const FALLBACK_RULE: Rule = {
  match: /.*/,
  reply:
    "I can help with SAP, printing, network, hardware, email and access issues. Describe the problem in a few words and I'll point you to the right runbook — or hand you to a live ICT agent.",
  articles: ["printer-win11", "sap-password", "outlook-profile"],
};

const QUICK_CHIPS = ["SAP login problems", "Printer offline", "Wi-Fi keeps dropping", "Password reset"];

const AGENT_SCRIPT = [
  "Got it — I'm pulling up the ticket queue for your department now.",
  "Thanks. Can you confirm your desk extension so I log the call correctly?",
  "I can take this offline for you. Want me to raise an incident ticket from this chat?",
];

function toSuggestion(id: string): Suggestion | null {
  const a = getArticle(id);
  if (!a) return null;
  return { id: a.id, title: a.title, restricted: a.restricted };
}

export function ChatWidget() {
  const { chat, openChat, closeChat, openArticle, role, user, openTicketDrawer } = usePortal();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const nextId = () => ++idRef.current;

  // Seed the conversation whenever the widget is (re)opened.
  useEffect(() => {
    if (!chat.open) return;
    setMessages([]);
    setAgentStep(0);
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      if (chat.mode === "bot") {
        setMessages([
          {
            id: nextId(),
            from: "bot",
            text:
              "Hi! I'm the KETRACO HelpBot. Ask me about SAP, printing, network, hardware or email issues — or tap a topic below." +
              (chat.context ? ` I see you were just reading "${chat.context}".` : ""),
            suggestions: QUICK_CHIPS.map((c) => null).length ? undefined : undefined,
          },
        ]);
      } else {
        setMessages([
          {
            id: nextId(),
            from: "agent",
            text:
              `Hi ${chat.context ? "" : ""}— Victor here, ICT Support on duty at Kawi House.` +
              (chat.context ? ` I saw you were viewing "${chat.context}".` : "") +
              " How can I help?",
          },
        ]);
      }
    }, 900);
    return () => clearTimeout(t);
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
        className="group fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-float transition-colors hover:bg-brand-dark"
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-20" />
        <Zap className="relative h-6 w-6" />
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
        { id: nextId(), from: "agent", text: AGENT_SCRIPT[agentStep % AGENT_SCRIPT.length] },
      ]);
      setAgentStep((s) => s + 1);
    }, 1400);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: nextId(), from: "me", text }]);
    setInput("");
    if (isAgent) pushAgentAnswer();
    else pushBotAnswer(text);
  };

  const convertChatToTicket = () => {
    const userTurns = messages.filter((m) => m.from === "me").map((m) => `• ${m.text}`);
    const firstUserText = messages.find((m) => m.from === "me")?.text ?? "Live chat request";
    openTicketDrawer({
      subject: `Live Chat — ${firstUserText.slice(0, 60)}`,
      description:
        `Incident raised from live agent chat with ${DEMO_USERS.admin.name}.\n\nChat transcript:\n${userTurns.join("\n") || "(no user messages)"}`,
      source: "chat",
    });
    toast.success("Chat converted to incident ticket", {
      description: "The transcript was attached — finish the details in the drawer.",
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 fixed right-6 bottom-6 z-50 flex h-[min(560px,72vh)] w-[min(94vw,380px)] flex-col overflow-hidden rounded-2xl border bg-card shadow-float duration-200">
      {/* Header */}
      {isAgent ? (
        <div className="flex items-center gap-3 border-b bg-card px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xs font-bold text-primary-foreground">
            {DEMO_USERS.admin.initials}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              {DEMO_USERS.admin.name}
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-1.5 py-0.5 text-[10px] font-semibold text-brand-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> On Duty
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {typing ? "Victor is typing…" : "ICT Support · Kawi House HQ"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => closeChat()} aria-label="Close chat">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-gradient-to-r from-brand to-brand-dark px-4 py-3 text-primary-foreground">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <Bot className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-sm font-bold">KETRACO HelpBot</p>
            <p className="text-[11px] opacity-85">AI Assistant · Instant answers, 24/7</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => closeChat()}
            className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas p-3">
        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.from === "me" && "ml-auto rounded-br-sm bg-brand text-primary-foreground",
                m.from === "bot" && "rounded-bl-sm border bg-card text-foreground",
                m.from === "agent" && "rounded-bl-sm border bg-card text-foreground",
              )}
            >
              {m.text}
            </div>
            {m.suggestions?.length ? (
              <div className="space-y-1.5">
                {m.suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openArticle(s.id)}
                    className="flex w-full items-center gap-2 rounded-xl border bg-card px-3 py-2 text-left text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-brand-tint hover:text-brand-dark"
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-brand" />
                    <span className="flex-1 truncate">{s.title}</span>
                    {s.restricted && role === "user" && <Lock className="h-3 w-3 shrink-0 text-energy" />}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {typing && (
          <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-bl-sm border bg-card px-3 py-3">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
          </div>
        )}
        {messages.length === 0 && !typing && (
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setMessages((prev) => [...prev, { id: nextId(), from: "me", text: c }]);
                  pushBotAnswer(c);
                }}
                className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-brand-tint hover:text-brand-dark"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="space-y-2 border-t bg-card p-3">
        {!isAgent && (
          <Button
            variant="outline"
            className="w-full gap-2 border-brand/40 text-brand-dark hover:bg-brand-tint hover:text-brand-dark"
            onClick={() => openChat("agent", chat.context)}
          >
            <Headphones className="h-4 w-4" />
            Talk to Human Agent
          </Button>
        )}
        {isAgent && role === "admin" && (
          <Button variant="outline" className="w-full gap-2" onClick={convertChatToTicket}>
            <TicketPlus className="h-4 w-4" />
            Convert Chat to Incident Ticket
          </Button>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={isAgent ? `Message ${DEMO_USERS.admin.name}…` : "Describe your ICT issue…"}
            className="flex h-9 flex-1 rounded-lg border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <Button onClick={send} size="icon" className="bg-brand hover:bg-brand-dark" aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          Signed in as {user.name} · {user.department}
        </p>
      </div>
    </div>
  );
}
