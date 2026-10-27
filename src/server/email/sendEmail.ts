import "server-only";

import { env } from "~/env";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export type SendEmailResult = {
  delivered: boolean;
  reason?: "not-configured";
};

type PostmarkSendResponse = {
  ErrorCode?: number;
  Message?: string;
  MessageID?: string;
};

function getPostmarkConfig() {
  const token = env.POSTMARK_API_KEY;
  const fromEmail = env.POSTMARK_FROM_EMAIL;

  if (!token || !fromEmail) return null;
  return { token, fromEmail };
}

function formatFromAddress(fromEmail: string) {
  const name = env.CONTACT_FROM_NAME ?? "Simply Code LLC";
  return `${name} <${fromEmail}>`;
}

/**
 * Sends transactional email through Postmark.
 * Set POSTMARK_API_KEY and POSTMARK_FROM_EMAIL (verified sender) to enable delivery.
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const config = getPostmarkConfig();

  if (!config) {
    if (env.NODE_ENV !== "production") {
      console.info("[email] Skipped; Postmark is not configured", {
        to: input.to,
        subject: input.subject,
      });
      return { delivered: false, reason: "not-configured" };
    }

    throw new Error(
      "Email is not configured. Set POSTMARK_API_KEY and POSTMARK_FROM_EMAIL.",
    );
  }

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": config.token,
    },
    body: JSON.stringify({
      From: formatFromAddress(config.fromEmail),
      To: input.to,
      Subject: input.subject,
      HtmlBody: input.html,
      MessageStream: "outbound",
      ...(input.replyTo ? { ReplyTo: input.replyTo } : {}),
    }),
  });

  const payload = (await response.json()) as PostmarkSendResponse;

  if (!response.ok || (payload.ErrorCode !== undefined && payload.ErrorCode !== 0)) {
    throw new Error(
      payload.Message ??
        `Postmark could not send the message (HTTP ${response.status}).`,
    );
  }

  return { delivered: true };
}
