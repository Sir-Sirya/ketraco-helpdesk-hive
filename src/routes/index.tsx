import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Lock, Plus, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePortal } from "@/components/portal/portal-context";
import {
  KB_ARTICLES,
  KB_CATEGORIES,
  POPULAR_IDS,
  TRENDING_IDS,
  categoryLabel,
  type CategoryId,
} from "@/data/kb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Knowledge Portal | KETRACO Smart HelpDesk" },
      { name: "description", content: "Find practical KETRACO ICT guides for SAP, printing, network, hardware, and everyday support." },
      { property: "og:title", content: "Knowledge Portal | KETRACO Smart HelpDesk" },
      { property: "og:description", content: "Browse KETRACO ICT support guides and get help with common workplace issues." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KnowledgePortal,
});

function KnowledgePortal() {
  const { role, openArticle, openTicketDrawer } = usePortal();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return KB_ARTICLES.filter((article) => {
      const matchesCategory = category === "all" || article.category === category;
      const matchesQuery = !normalized ||
        [article.title, article.summary, article.tags.join(" ")].join(" ").toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const articleById = (id: string) => KB_ARTICLES.find((article) => article.id === id);
  const hasFilters = Boolean(query.trim()) || category !== "all";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <section className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">KETRACO · ICT SUPPORT</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">What can we help you solve?</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Search trusted guides or browse common support topics.</p>
        </div>
        <Button onClick={() => openTicketDrawer()} className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" /> Report an issue
        </Button>
      </section>

      <div className="relative mt-6 max-w-3xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search SAP, printer, Wi-Fi, Outlook…"
          aria-label="Search knowledge articles"
          className="h-12 rounded-lg bg-card pl-12 text-base shadow-sm"
        />
      </div>

      <section className="mt-8" aria-labelledby="category-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 id="category-title" className="font-display text-lg font-semibold">Browse by service</h3>
          {hasFilters && <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setCategory("all"); }}>Clear filters</Button>}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {KB_CATEGORIES.map((item) => {
            const Icon = item.icon;
            const active = category === item.id;
            return (
              <Button
                key={item.id}
                variant="outline"
                onClick={() => setCategory(active ? "all" : item.id)}
                aria-pressed={active}
                className={`h-auto min-h-20 justify-start gap-3 rounded-lg px-3 py-3 text-left whitespace-normal ${active ? "border-brand bg-brand-tint text-brand-dark" : "bg-card"}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-brand"><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 text-sm leading-5">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </section>

      {hasFilters ? (
        <section className="mt-9" aria-live="polite">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="font-display text-lg font-semibold">{query ? "Search results" : categoryLabel(category as CategoryId)}</h3>
            <span className="text-xs text-muted-foreground">{results.length} {results.length === 1 ? "guide" : "guides"}</span>
          </div>
          {results.length ? (
            <div className="divide-y border-y bg-card">
              {results.map((article) => (
                <Button key={article.id} variant="ghost" onClick={() => openArticle(article.id)} className="h-auto w-full justify-start rounded-none px-4 py-4 text-left whitespace-normal">
                  <BookOpen className="mr-3 mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground">{article.title}</span>
                    <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">{article.summary}</span>
                    <span className="mt-2 block text-[11px] font-medium text-brand">{categoryLabel(article.category)}</span>
                  </span>
                  {article.restricted && role === "user" && <Lock className="ml-2 h-4 w-4 shrink-0 text-warning" />}
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
              ))}
            </div>
          ) : (
            <div className="border-y py-10 text-center text-sm text-muted-foreground">No guides found. Try another search or report the issue.</div>
          )}
        </section>
      ) : (
        <div className="mt-9 grid gap-9 lg:grid-cols-[1.35fr_0.85fr]">
          <section aria-labelledby="trending-title">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-energy" />
              <h3 id="trending-title" className="font-display text-lg font-semibold">Trending now</h3>
              <span className="text-xs text-muted-foreground">· Frequently viewed this week</span>
            </div>
            <div className="divide-y border-y bg-card">
              {TRENDING_IDS.map((id) => {
                const article = articleById(id);
                if (!article) return null;
                return (
                  <Button key={id} variant="ghost" onClick={() => openArticle(id)} className="h-auto w-full justify-start rounded-none px-4 py-4 text-left whitespace-normal">
                    <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-energy-tint text-energy"><TrendingUp className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{article.title}</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">{categoryLabel(article.category)} · {article.views.toLocaleString()} views</span>
                    </span>
                    <span className="ml-2 shrink-0 text-xs font-semibold text-energy">+{article.trending?.spike ?? ""}</span>
                  </Button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="popular-title">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand" />
              <h3 id="popular-title" className="font-display text-lg font-semibold">Popular guides</h3>
            </div>
            <div className="divide-y border-y bg-card">
              {POPULAR_IDS.map((id) => {
                const article = articleById(id);
                if (!article) return null;
                return (
                  <Button key={id} variant="ghost" onClick={() => openArticle(id)} className="h-auto w-full justify-start rounded-none px-4 py-3 text-left whitespace-normal">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-foreground">{article.title}</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">{article.views.toLocaleString()} views · {categoryLabel(article.category)}</span>
                    </span>
                    {article.restricted && role === "user" && <Lock className="ml-2 h-4 w-4 shrink-0 text-warning" />}
                    <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  </Button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      <section className="mt-9 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Need help from ICT?</p>
          <p className="text-xs text-muted-foreground">Create a ticket for the support team to follow up.</p>
        </div>
        <Button variant="outline" onClick={() => openTicketDrawer()} className="gap-2"><Plus className="h-4 w-4" /> Create a ticket</Button>
      </section>
    </div>
  );
}