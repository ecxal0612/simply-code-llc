"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { homeCopy } from "~/lib/home/content";
import { cobaltClass } from "~/lib/home/cobalt-theme";
import { cn } from "~/lib/utils";

const fieldClass =
  "border-white/15 bg-white/5 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-[#1E90FF]/40";

export function ContactInquiryForm({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);
  const f = homeCopy.contact.form;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    await new Promise((r) => setTimeout(r, 600));
    setPending(false);
    toast.success(f.success);
    e.currentTarget.reset();
  }

  const inputCn = cn("h-11", fieldClass);

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-5", className)}>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="grid gap-2">
          <Label htmlFor="contact-name" className="text-zinc-300">Name</Label>
          <Input id="contact-name" name="name" required placeholder={f.name} className={inputCn} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-email" className="text-zinc-300">Work email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder={f.email}
            className={inputCn}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-company" className="text-zinc-300">Company</Label>
        <Input id="contact-company" name="company" placeholder={f.company} className={inputCn} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-type" className="text-zinc-300">Project type</Label>
        <Input id="contact-type" name="projectType" placeholder={f.projectType} className={inputCn} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-details" className="text-zinc-300">Project details</Label>
        <textarea
          id="contact-details"
          name="details"
          required
          rows={4}
          placeholder={f.details}
          className={cn(
            "flex w-full rounded-[18px] border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2",
            inputCn,
          )}
        />
      </div>
      <Button type="submit" disabled={pending} size="lg" className={cn(cobaltClass.btn, "rounded-[10px]")}>
        {pending ? "Sending…" : f.submit}
      </Button>
    </form>
  );
}
