import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BookOpen, Ticket } from "lucide-react";

import appCss from "../styles.css?url";
import { reportAppError } from "../lib/error-reporting";
import { PortalProvider, usePortal } from "@/components/portal/portal-context";
import { Sidebar } from "@/components/portal/sidebar";
import { TopBar } from "@/components/portal/top-bar";
import { ArticleDrawer } from "@/components/portal/article-drawer";
import { TicketDrawer } from "@/components/portal/ticket-drawer";
import { ChatWidget } from "@/components/portal/chat-widget";
import { CtiCallCard } from "@/components/portal/cti-call-card";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportAppError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KETRACO Smart HelpDesk" },
      { name: "description", content: "KETRACO ICT support, knowledge articles, and ticket tracking." },
      { property: "og:title", content: "KETRACO Smart HelpDesk" },
      { property: "og:description", content: "KETRACO ICT support, knowledge articles, and ticket tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@KETRACO1" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppShell() {
  const { role } = usePortal();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <TopBar />
      <nav
        aria-label="Main mobile navigation"
        className="flex items-center gap-2 border-b border-border bg-card px-4 py-2 md:hidden shadow-xs"
      >
        <Link
          to="/"
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            pathname === "/"
              ? "bg-brand-tint text-brand-dark font-bold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Knowledge
        </Link>
        <Link
          to="/tickets"
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            pathname.startsWith("/tickets")
              ? "bg-brand-tint text-brand-dark font-bold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Ticket className="h-4 w-4" />
          {role === "admin" ? "Ticket Console" : "My Reported Tickets"}
        </Link>
      </nav>
      <div className="flex min-h-0 flex-1">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <main className="min-w-0 flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks child routes. */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <PortalProvider>
        <AppShell />
        <ArticleDrawer />
        <TicketDrawer />
        <CtiCallCard />
        <ChatWidget />
        <Toaster position="top-right" />
      </PortalProvider>
    </QueryClientProvider>
  );
}
