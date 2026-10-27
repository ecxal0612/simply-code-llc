"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { ResolvedContactFormContent } from "~/lib/contact/form-content";
import {
  contactMessageSchema,
  type ContactMessageInput,
} from "~/lib/contact/schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

export function ContactForm({
  content,
}: {
  content: ResolvedContactFormContent;
}) {
  const form = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      projectType: "",
      budget: "",
      details: "",
    },
  });
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(values: ContactMessageInput) {
    setServerError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not send your message.");
      }

      form.reset();
      setSent(true);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Could not send your message. Please try again.",
      );
    }
  }

  if (sent) {
    return (
      <div
        className="border border-emerald-500/30 bg-emerald-500/10 px-6 py-12 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto size-11 text-emerald-400" />
        <h2 className="mt-4 text-xl font-semibold text-zinc-100">
          {content.successTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          {content.successMessage}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 rounded-none"
          onClick={() => setSent(false)}
        >
          {content.sendAnotherLabel}
        </Button>
      </div>
    );
  }

  const errors = form.formState.errors;

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">{content.nameLabel}</Label>
          <Input
            id="contact-name"
            placeholder={content.namePlaceholder}
            autoComplete="name"
            className="rounded-none"
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">{content.emailLabel}</Label>
          <Input
            id="contact-email"
            type="email"
            placeholder={content.emailPlaceholder}
            autoComplete="email"
            className="rounded-none"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-company">{content.companyLabel}</Label>
        <Input
          id="contact-company"
          placeholder={content.companyPlaceholder}
          autoComplete="organization"
          className="rounded-none"
          aria-invalid={Boolean(errors.company)}
          {...form.register("company")}
        />
        <FieldError message={errors.company?.message} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-project-type">
            {content.projectTypeLabel}
          </Label>
          <select
            id="contact-project-type"
            className="border-input focus-visible:ring-ring h-9 w-full rounded-none border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            aria-invalid={Boolean(errors.projectType)}
            {...form.register("projectType")}
          >
            <option value="">{content.projectTypePlaceholder}</option>
            {content.projectTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError message={errors.projectType?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-budget">{content.budgetLabel}</Label>
          <select
            id="contact-budget"
            className="border-input focus-visible:ring-ring h-9 w-full rounded-none border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            {...form.register("budget")}
          >
            <option value="">{content.budgetPlaceholder}</option>
            {content.budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError message={errors.budget?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-details">{content.detailsLabel}</Label>
        <Textarea
          id="contact-details"
          rows={6}
          placeholder={content.detailsPlaceholder}
          className="rounded-none"
          aria-invalid={Boolean(errors.details)}
          {...form.register("details")}
        />
        <FieldError message={errors.details?.message} />
      </div>

      {serverError ? (
        <p
          className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {serverError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="rounded-none"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {content.submitLabel}
      </Button>

      <p className="text-xs text-zinc-500">
        {content.privacyText} See our{" "}
        <Link
          href="/privacy-policy"
          className="underline hover:text-zinc-300"
        >
          {content.privacyLinkLabel}
        </Link>{" "}
        for details.
      </p>
    </form>
  );
}
