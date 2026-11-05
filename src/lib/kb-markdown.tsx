import { Fragment, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) {
      return (
        <code
          key={i}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.82em] text-foreground"
        >
          {p.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  const [done, setDone] = useState(checked);
  return (
    <li>
      <button
        type="button"
        onClick={() => setDone((d) => !d)}
        className="group flex w-full items-start gap-2.5 py-1 text-left"
      >
        <span
          className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
            done
              ? "border-brand bg-brand text-primary-foreground"
              : "border-border bg-background group-hover:border-brand"
          }`}
        >
          {done && <Check className="h-3 w-3" />}
        </span>
        <span
          className={`text-sm leading-relaxed ${
            done ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {renderInline(label)}
        </span>
      </button>
    </li>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="my-2 space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <span>{renderInline(it)}</span>
        </li>
      ))}
    </ul>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="my-2 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-bold text-brand-dark">
            {i + 1}
          </span>
          <span>{renderInline(it)}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Small purpose-built renderer for KB article content: ## headings, paragraphs,
 * - bullets, 1. steps, - [x] checklists, **bold** and `code`.
 */
export function renderKbMarkdown(content: string): ReactNode {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let bullets: string[] = [];
  let steps: string[] = [];
  let checks: { label: string; checked: boolean }[] = [];

  const flush = () => {
    if (para.length) {
      blocks.push(
        <p key={`p${blocks.length}`} className="my-2 text-sm leading-relaxed text-foreground/90">
          {renderInline(para.join(" "))}
        </p>,
      );
      para = [];
    }
    if (bullets.length) {
      blocks.push(<Bullets key={`b${blocks.length}`} items={bullets} />);
      bullets = [];
    }
    if (steps.length) {
      blocks.push(<Steps key={`s${blocks.length}`} items={steps} />);
      steps = [];
    }
    if (checks.length) {
      blocks.push(
        <ul key={`c${blocks.length}`} className="my-2 rounded-xl bg-muted/50 p-3">
          {checks.map((c, i) => (
            <CheckItem key={i} label={c.label} checked={c.checked} />
          ))}
        </ul>,
      );
      checks = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push(
        <h3
          key={`h${blocks.length}`}
          className="mt-5 mb-1 font-display text-[15px] font-semibold tracking-tight text-foreground first:mt-0"
        >
          {line.slice(3)}
        </h3>,
      );
      continue;
    }
    const check = line.match(/^- \[( |x)\] (.*)$/);
    if (check) {
      flush();
      checks.push({ label: check[2], checked: check[1] === "x" });
      continue;
    }
    const bullet = line.match(/^- (.*)$/);
    if (bullet) {
      if (steps.length || checks.length) flush();
      bullets.push(bullet[1]);
      continue;
    }
    const step = line.match(/^\d+\. (.*)$/);
    if (step) {
      if (bullets.length || checks.length) flush();
      steps.push(step[1]);
      continue;
    }
    para.push(line.trim());
  }
  flush();
  return <div>{blocks}</div>;
}
