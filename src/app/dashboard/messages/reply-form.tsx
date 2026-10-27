"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export function ReplyForm({
  messageId,
  email,
}: {
  messageId: string;
  email: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reply = body.trim();
    if (!reply) {
      setError("Write a reply before sending it.");
      return;
    }

    setSending(true);
    setError(null);
    setDeliveryNote(null);

    try {
      const res = await fetch(
        `/api/contact-messages/${messageId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: reply }),
        },
      );
      const data = (await res.json().catch(() => null)) as {
        delivered?: boolean;
        error?: string;
      } | null;

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not send the reply.");
      }

      setBody("");
      if (data?.delivered) {
        toast.success(`Reply sent to ${email}`);
        setDeliveryNote(`Reply sent to ${email}.`);
      } else {
        toast.success("Reply saved");
        setDeliveryNote(
          "Reply saved. Email delivery is not configured in this environment, so the sender did not receive an email.",
        );
      }
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not send the reply.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="contact-reply">Message</Label>
        <Textarea
          id="contact-reply"
          rows={8}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={`Write your reply to ${email}…`}
          maxLength={10_000}
        />
        <p className="text-muted-foreground text-right text-xs">
          {body.length.toLocaleString()} / 10,000
        </p>
      </div>

      {error ? (
        <p
          className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {deliveryNote ? (
        <p
          className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
          role="status"
        >
          {deliveryNote}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={sending}>
        {sending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {sending ? "Sending…" : "Send reply"}
      </Button>
    </form>
  );
}
