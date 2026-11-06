import { useEffect, useRef, useState } from "react";
import { Building2, MapPin, Phone, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { KB_CATEGORIES, type CategoryId } from "@/data/kb";
import type { Priority } from "@/data/tickets";
import { cn } from "@/lib/utils";
import { usePortal, type TicketPrefill } from "./portal-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRIORITIES: { value: Priority; hint: string }[] = [
  { value: "Low", hint: "72 h SLA" },
  { value: "Medium", hint: "24 h SLA" },
  { value: "High", hint: "8 h SLA" },
  { value: "Critical", hint: "2 h SLA" },
];

const PRIORITY_STYLES: Record<Priority, { selected: string; dot: string }> = {
  Low: { selected: "border-brand bg-brand-tint text-brand-dark", dot: "bg-muted-foreground" },
  Medium: { selected: "border-info bg-info-tint text-info", dot: "bg-info" },
  High: { selected: "border-warning bg-warning-tint text-warning", dot: "bg-warning" },
  Critical: { selected: "border-energy bg-energy-tint text-energy", dot: "bg-energy" },
};

export function TicketDrawer() {
  const { ticketDrawer, closeTicketDrawer, createTicket, user, role } = usePortal();
  const { open, prefill } = ticketDrawer;
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<CategoryId>("general");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-seed the form whenever the drawer opens with fresh prefill data.
  useEffect(() => {
    if (!open) return;
    setSubject(prefill?.subject ?? "");
    setCategory(prefill?.category ?? "general");
    setPriority(prefill?.priority ?? "Medium");
    setDescription(prefill?.description ?? "");
    setFiles([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefill]);

  const who = prefill?.requester ?? {
    name: user.name,
    department: user.department,
    location: user.location,
    extension: user.extension,
  };

  const submit = () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject for the ticket.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe the issue so ICT can act on it.");
      return;
    }
    createTicket({
      subject: subject.trim(),
      category,
      priority,
      description: description.trim(),
      requester: prefill?.requester,
      attachments: files,
      source: prefill?.source,
    });
    if (prefill?.source === "cti") {
      toast.info(`One-click ticket for ${who.name} (Ext ${who.extension}) created`, {
        description: "Caller details pre-filled from the CTI screen-pop.",
      });
    }
    closeTicketDrawer();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && closeTicketDrawer()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[540px]">
        <SheetHeader className="border-b p-6 pb-4">
          <SheetTitle className="font-display text-lg font-bold tracking-tight">
            {prefill?.source === "cti" ? "Open Ticket from Incoming Call" : "Report an ICT Issue"}
          </SheetTitle>
          <SheetDescription>
            {prefill?.source === "cti"
              ? "All caller details are pre-filled from the CTI screen-pop."
              : "Your ticket goes straight to the ICT & Telecommunications queue."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-6">
          {/* Context banner */}
          <div className="flex items-start gap-3 rounded-xl bg-brand-tint p-4">
            <Building2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
            <div className="space-y-1 text-xs leading-relaxed text-brand-dark">
              <p className="text-sm font-semibold">
                {who.name} {prefill?.source === "cti" && <span className="font-normal">(caller)</span>}
              </p>
              <p className="flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> {who.department}
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {who.location}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> Desk Extension {who.extension}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-category">Issue Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
              <SelectTrigger id="ticket-category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {KB_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-subject">Subject</Label>
            <Input
              id="ticket-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary, e.g. 'SAP GUI keeps timing out'"
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => {
                const active = priority === p.value;
                const style = PRIORITY_STYLES[p.value];
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all",
                      active
                        ? style.selected
                        : "border-border bg-background text-muted-foreground hover:border-brand hover:text-foreground",
                    )}
                  >
                    {p.value}
                    <span className="flex items-center gap-1 text-[10px] font-normal opacity-80">
                      <span className={cn("h-1.5 w-1.5 rounded-full", active ? style.dot : "bg-border")} />
                      {p.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-description">Description</Label>
            <Textarea
              id="ticket-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened, when it started, and any error messages…"
              className="resize-none"
            />
          </div>

          {/* Attachment upload zone */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-brand hover:bg-brand-tint/40 hover:text-brand-dark"
            >
              <Upload className="h-5 w-5" />
              <span>
                Drop files here or <span className="font-semibold underline">click to attach</span>
              </span>
              <span className="text-[11px]">Screenshots speed up diagnosis (max 10 MB)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const names = Array.from(e.target.files ?? []).map((f) => f.name);
                if (names.length) setFiles((prev) => [...prev, ...names]);
                e.target.value = "";
              }}
            />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {files.map((f, i) => (
                  <span
                    key={`${f}-${i}`}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-tint py-1 pr-1 pl-2.5 text-[11px] font-medium text-brand-dark"
                  >
                    {f}
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="rounded-full p-0.5 hover:bg-brand/10"
                      aria-label={`Remove ${f}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 mt-auto flex justify-end gap-2 border-t bg-card p-4">
          <Button variant="outline" onClick={closeTicketDrawer}>
            Cancel
          </Button>
          <Button onClick={submit} className="bg-brand hover:bg-brand-dark">
            {role === "admin" && prefill?.source ? "Open Ticket" : "Submit Ticket"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
