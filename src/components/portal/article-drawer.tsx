import { useEffect, useState } from "react";
import {
  BookOpen,
  Clock,
  Eye,
  Headphones,
  Lock,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { categoryLabel, KB_CATEGORIES } from "@/data/kb";
import { renderKbMarkdown } from "@/lib/kb-markdown";
import { usePortal } from "./portal-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ArticleDrawer() {
  const { articleId, closeArticle, role, openChat } = usePortal();
  const article = KB_ARTICLES.find((a) => a.id === articleId);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  useEffect(() => setVote(null), [articleId]);

  const category = article ? KB_CATEGORIES.find((c) => c.id === article.category) : undefined;
  const locked = article?.restricted && role === "user";

  return (
    <Sheet open={!!article} onOpenChange={(o) => !o && closeArticle()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {article && (
          <>
            <SheetHeader className="space-y-3 border-b p-6 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-transparent bg-brand-tint text-brand-dark hover:bg-brand-tint">
                  {category && <category.icon className="mr-1 h-3 w-3" />}
                  {categoryLabel(article.category)}
                </Badge>
                {article.internal && role === "admin" && (
                  <Badge className="border-transparent bg-warning-tint text-warning hover:bg-warning-tint">
                    <TriangleAlert className="mr-1 h-3 w-3" />
                    Internal ICT Runbook
                  </Badge>
                )}
                {article.restricted && role === "admin" && (
                  <Badge variant="outline" className="gap-1 border-brand/40 text-brand-dark">
                    <ShieldCheck className="h-3 w-3" />
                    ICT Staff Only
                  </Badge>
                )}
              </div>
              <SheetTitle className="font-display text-xl leading-snug font-bold tracking-tight">
                {article.title}
              </SheetTitle>
              <SheetDescription className="sr-only">{article.summary}</SheetDescription>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {article.views.toLocaleString()} views
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Updated {article.updated}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" /> {article.helpful} found this helpful
                </span>
              </p>
            </SheetHeader>

            {locked ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-energy-tint">
                  <Lock className="h-7 w-7 text-energy" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold">Restricted Article</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    This runbook contains privileged network diagnostics and VLAN tables. It is limited
                    to <strong>ICT & Telecommunications</strong> staff. Switch to the ICT Admin role to
                    view it.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success("Access request sent", {
                      description: "The ICT Admin on duty has been notified of your request.",
                    })
                  }
                >
                  Request Access
                </Button>
              </div>
            ) : (
              <>
                <div className="px-6 py-4">
                  {renderKbMarkdown(article.content)}
                </div>

                <div className="mt-auto border-t p-6 pt-4">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">Was this helpful?</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVote("up");
                        toast.success("Thanks for the feedback!");
                      }}
                      className={cnVote(vote === "up")}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> Yes ({article.helpful + (vote === "up" ? 1 : 0)})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVote("down");
                        toast.success("Feedback noted — this article will be reviewed.");
                      }}
                      className={cnVote(vote === "down")}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" /> No
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-brand-tint p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-dark">Still need help?</p>
                      <p className="text-xs text-brand-dark/70">
                        Chat with the ICT agent on duty — usually replies in under a minute.
                      </p>
                    </div>
                    <Button
                      onClick={() => openChat("agent", article.title)}
                      className="shrink-0 gap-2"
                    >
                      <Headphones className="h-4 w-4" />
                      Escalate to Live Chat
                    </Button>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    Knowledge Base · KETRACO ICT & Telecommunications
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function cnVote(active: boolean): string {
  return active ? "border-brand bg-brand-tint text-brand-dark" : "";
}
