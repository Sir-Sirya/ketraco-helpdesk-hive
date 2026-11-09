import { useMemo, useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Database,
  Eye,
  Flame,
  Layers,
  Lock,
  MonitorSmartphone,
  Plus,
  Printer,
  Network,
  Search,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePortal } from "@/components/portal/portal-context";
import {
  KB_ARTICLES,
  KB_CATEGORIES,
  POPULAR_IDS,
  TRENDING_IDS,
  categoryLabel,
  type CategoryId,
  type KbArticle,
} from "@/data/kb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Knowledge Portal | KETRACO Smart HelpDesk" },
      {
        name: "description",
        content:
          "Enterprise ICT Support & Knowledge Portal for Kenya Electricity Transmission Company (KETRACO). Search SAP, network, printing, and hardware runbooks.",
      },
      { property: "og:title", content: "Knowledge Portal | KETRACO Smart HelpDesk" },
      {
        property: "og:description",
        content: "Browse trusted KETRACO ICT standard operating procedures and technical runbooks.",
      },
    ],
  }),
  component: KnowledgePortal,
});

const QUICK_SUGGESTIONS = [
  "SAP GUI Connection Timeout",
  "Kawi 2nd Floor Network Switch Reboot",
  "HP LaserJet M404 Print Queue",
  "Cisco Switch Trunking VLAN Table",
  "SCADA Workstation UPS Alarm",
  "Wi-Fi Drops on Guest SSID",
  "Reset SAP Password",
];

function KnowledgePortal() {
  const { role, openArticle, openTicketDrawer, openChat } = usePortal();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close autocomplete on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setAutocompleteOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return KB_ARTICLES.filter((article) => {
      const matchesCategory = category === "all" || article.category === category;
      const matchesQuery =
        !q ||
        [article.title, article.summary, ...article.tags]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const autocompleteMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return KB_ARTICLES.filter((article) =>
      [article.title, article.summary, ...article.tags]
        .join(" ")
        .toLowerCase()
        .includes(q)
    ).slice(0, 5);
  }, [query]);

  const articleById = (id: string): KbArticle | undefined =>
    KB_ARTICLES.find((a) => a.id === id);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!autocompleteOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setAutocompleteOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < autocompleteMatches.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : autocompleteMatches.length - 1
      );
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && autocompleteMatches[selectedIndex]) {
        e.preventDefault();
        const selected = autocompleteMatches[selectedIndex];
        if (selected) {
          openArticle(selected.id);
          setAutocompleteOpen(false);
        }
      } else {
        setAutocompleteOpen(false);
      }
    } else if (e.key === "Escape") {
      setAutocompleteOpen(false);
    }
  };

  const hasFilterActive = Boolean(query.trim()) || category !== "all";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      {/* Hero / Portal Header */}
      <section className="relative overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-card via-card to-brand-tint/30 p-6 md:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1 text-xs font-bold text-brand-dark">
              <Zap className="h-3.5 w-3.5 text-brand" />
              KETRACO · ICT Support & Knowledge Portal
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground font-medium">
              HQ Kawi House & 220kV/132kV Substations
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            What can we help you solve today?
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Access certified standard operating procedures, SAP workarounds, network diagnostic runbooks,
            and enterprise hardware guides curated by KETRACO ICT.
          </p>

          {/* Search Bar with Instant Autocomplete */}
          <div ref={searchContainerRef} className="relative mt-6 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-brand" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setAutocompleteOpen(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setAutocompleteOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search solutions, SOPs, SAP guides, or network policies..."
                aria-label="Search solutions, SOPs, SAP guides, or network policies"
                className="h-13 rounded-xl border-border bg-card pr-10 pl-12 text-sm shadow-sm transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 sm:text-base"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setAutocompleteOpen(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3.5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear search input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Instant Autocomplete Floating Dropdown */}
            {autocompleteOpen && (
              <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card p-2 shadow-elevated animate-in fade-in slide-in-from-top-2 duration-150">
                {query.trim() ? (
                  autocompleteMatches.length > 0 ? (
                    <div className="space-y-1">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Matching Knowledge Guides
                      </p>
                      {autocompleteMatches.map((article, index) => {
                        const isLocked = article.restricted && role === "user";
                        const isSelected = selectedIndex === index;
                        return (
                          <button
                            key={article.id}
                            type="button"
                            onClick={() => {
                              openArticle(article.id);
                              setAutocompleteOpen(false);
                            }}
                            className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                              isSelected
                                ? "bg-brand-tint text-brand-dark"
                                : "hover:bg-muted"
                            }`}
                          >
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-brand">
                              <BookOpen className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground truncate">
                                  {article.title}
                                </span>
                                {isLocked && (
                                  <span className="inline-flex items-center gap-1 rounded bg-energy-tint px-1.5 py-0.5 text-[10px] font-semibold text-energy">
                                    <Lock className="h-3 w-3" /> Locked
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                {article.summary}
                              </p>
                            </div>
                            <span className="shrink-0 text-[11px] font-medium text-brand">
                              {categoryLabel(article.category)}
                            </span>
                          </button>
                        );
                      })}
                      <div className="border-t border-border pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => setAutocompleteOpen(false)}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Show all {filteredArticles.length} results below
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No matching guides found for "{query}". Try another keyword or create a ticket.
                    </div>
                  )
                ) : (
                  <div className="p-2 space-y-2">
                    <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Frequent Searches
                    </p>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {QUICK_SUGGESTIONS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setQuery(item);
                            setAutocompleteOpen(false);
                          }}
                          className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:border-brand hover:bg-brand-tint hover:text-brand-dark"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Button Top Right */}
        <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-0 sm:absolute sm:top-8 sm:right-8">
          <Button
            onClick={() => openTicketDrawer()}
            className="gap-2 bg-brand text-primary-foreground hover:bg-brand-dark shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Report an Issue
          </Button>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="mt-8" aria-label="Category filters">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">
            Browse by Service Category
          </h2>
          {hasFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="text-xs text-brand hover:bg-brand-tint hover:text-brand-dark"
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {/* "All" Pill */}
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
              category === "all"
                ? "border-brand bg-brand-tint font-bold text-brand-dark shadow-sm"
                : "border-border bg-card text-foreground hover:border-brand/40 hover:bg-muted"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                category === "all" ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Layers className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-semibold truncate">All Services</span>
              <span className="block text-[11px] text-muted-foreground">{KB_ARTICLES.length} Runbooks</span>
            </div>
          </button>

          {/* Dynamic Categories */}
          {KB_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            const isLockedForUser = cat.restricted && role === "user";

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`relative flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-brand bg-brand-tint font-bold text-brand-dark shadow-sm"
                    : "border-border bg-card text-foreground hover:border-brand/40 hover:bg-muted"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-sm font-semibold truncate">{cat.label}</span>
                    {isLockedForUser && (
                      <span title="Restricted to ICT Admin" className="shrink-0 text-energy">
                        <Lock className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] text-muted-foreground">
                    {KB_ARTICLES.filter((a) => a.category === cat.id).length} Guides
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* When filtering or searching, show results list */}
      {hasFilterActive ? (
        <section className="mt-8 space-y-4" aria-live="polite">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                {query ? `Search results for "${query}"` : categoryLabel(category as CategoryId)}
              </h3>
              <p className="text-xs text-muted-foreground">
                Showing {filteredArticles.length} matching {filteredArticles.length === 1 ? "guide" : "guides"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          </div>

          {category === "network" && role === "user" && (
            <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-tint p-4 text-xs text-warning">
              <ShieldAlert className="mt-0.5 h-4.5 w-4.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Restricted Network & Infrastructure Category</p>
                <p className="mt-0.5 text-muted-foreground leading-relaxed">
                  These operational runbooks contain Cisco core switch VLAN mapping and substation telemetry topology.
                  Full diagnostics require <strong>ICT Admin</strong> authorization. Switch to "Victor Sirya (ICT Admin)" in the top-bar role switcher to inspect all details.
                </p>
              </div>
            </div>
          )}

          {filteredArticles.length > 0 ? (
            <div className="divide-y rounded-2xl border border-border bg-card shadow-sm">
              {filteredArticles.map((article) => {
                const isLocked = article.restricted && role === "user";
                return (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => openArticle(article.id)}
                    className="group flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-transparent bg-brand-tint text-brand-dark"
                        >
                          {categoryLabel(article.category)}
                        </Badge>
                        {article.internal && role === "admin" && (
                          <Badge className="border-transparent bg-warning-tint text-warning font-semibold">
                            Internal ICT Runbook
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge className="border-transparent bg-energy-tint text-energy font-semibold gap-1">
                            <Lock className="h-3 w-3" /> Privileged Lock
                          </Badge>
                        )}
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {article.views.toLocaleString()} views
                        </span>
                      </div>
                      <h4 className="font-display text-base font-bold text-foreground group-hover:text-brand transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {article.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-2 text-muted-foreground group-hover:text-brand">
                      <span className="text-xs font-semibold hidden sm:inline">View Guide</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 font-display text-base font-semibold text-foreground">
                No matching articles found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try revising your keywords, or submit an incident ticket directly to the ICT team.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  size="sm"
                  onClick={() => openTicketDrawer({ subject: query })}
                  className="bg-brand text-primary-foreground hover:bg-brand-dark"
                >
                  <Plus className="h-4 w-4 mr-1" /> Create Ticket
                </Button>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Dual Top-Section Grid: Trending Now & Most Popular Inquiries */
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Section 1: Trending Now (Last 48 Hours) */}
          <section aria-labelledby="trending-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-energy-tint text-energy">
                  <Flame className="h-4 w-4 animate-pulse" />
                </span>
                <div>
                  <h3 id="trending-heading" className="font-display text-lg font-bold text-foreground">
                    Trending Now (Last 48 Hours)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Real-time flame indicators reflecting incident spikes
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-energy-tint px-2.5 py-0.5 text-[11px] font-bold text-energy">
                Live Spikes
              </span>
            </div>

            <div className="space-y-3">
              {TRENDING_IDS.map((id) => {
                const article = articleById(id);
                if (!article) return null;
                const isLocked = article.restricted && role === "user";

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openArticle(id)}
                    className="group relative flex w-full items-start gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-brand/50 hover:bg-muted/40 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-energy-tint text-energy">
                      <Flame className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-energy-tint px-2 py-0.5 text-[10px] font-extrabold text-energy">
                          +{article.trending?.spike} Spike
                        </span>
                        <span className="text-[11px] font-medium text-brand">
                          {categoryLabel(article.category)}
                        </span>
                        {isLocked && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-energy">
                            <Lock className="h-3 w-3" /> ICT Only
                          </span>
                        )}
                        {article.internal && role === "admin" && (
                          <span className="rounded bg-warning-tint px-1.5 py-0.2 text-[10px] font-bold text-warning">
                            Runbook
                          </span>
                        )}
                      </div>

                      <h4 className="mt-1 font-display text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                        {article.title}
                      </h4>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {article.summary}
                      </p>

                      <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {article.views.toLocaleString()} views
                        </span>
                        <span>Updated {article.updated}</span>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand mt-3" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Most Popular Inquiries */}
          <section aria-labelledby="popular-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-tint text-brand-dark">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div>
                  <h3 id="popular-heading" className="font-display text-lg font-bold text-foreground">
                    Most Popular Inquiries
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    All-time high-view runbooks with helpful feedback ratings
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-brand-tint px-2.5 py-0.5 text-[11px] font-bold text-brand-dark">
                Top Rated
              </span>
            </div>

            <div className="space-y-3">
              {POPULAR_IDS.map((id) => {
                const article = articleById(id);
                if (!article) return null;
                const isLocked = article.restricted && role === "user";
                const totalVotes = article.helpful + article.notHelpful;
                const percentHelpful =
                  totalVotes > 0 ? Math.round((article.helpful / totalVotes) * 100) : 100;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openArticle(id)}
                    className="group relative flex w-full items-start gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-brand/50 hover:bg-muted/40 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium text-brand">
                          {categoryLabel(article.category)}
                        </span>
                        {isLocked && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-energy">
                            <Lock className="h-3 w-3" /> Restricted
                          </span>
                        )}
                        {article.internal && role === "admin" && (
                          <span className="rounded bg-warning-tint px-1.5 py-0.2 text-[10px] font-bold text-warning">
                            Runbook
                          </span>
                        )}
                      </div>

                      <h4 className="mt-1 font-display text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                        {article.title}
                      </h4>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {article.summary}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Eye className="h-3 w-3 text-brand" /> {article.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-success">
                          <ThumbsUp className="h-3 w-3 text-brand" /> {article.helpful}
                          <span className="text-muted-foreground">/</span>
                          <ThumbsDown className="h-3 w-3 text-muted-foreground" /> {article.notHelpful}
                          <span className="text-brand font-semibold">({percentHelpful}% helpful)</span>
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand mt-3" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Escalation / Help Banner */}
      <section className="mt-12 rounded-2xl border border-brand/20 bg-card p-6 shadow-sm sm:flex sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-ping" />
            <h4 className="font-display text-base font-bold text-foreground">
              Still need assistance from ICT Support?
            </h4>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">
            Our engineers at Kawi House HQ Control Room and regional substation NOCs are ready to resolve your issue.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => openChat("bot")}
            className="gap-2 border-brand/40 text-brand-dark hover:bg-brand-tint"
          >
            <Zap className="h-4 w-4 text-brand" />
            Ask ICT HelpBot
          </Button>
          <Button
            onClick={() => openTicketDrawer()}
            className="gap-2 bg-brand text-primary-foreground hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Log a Support Ticket
          </Button>
        </div>
      </section>
    </div>
  );
}
