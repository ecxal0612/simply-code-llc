import { NextResponse } from "next/server";
import { contactMessageSchema } from "~/lib/contact/schema";
import { env } from "~/env";
import { createContactMessage } from "~/server/contact";
import { sendEmail } from "~/server/email/sendEmail";
import {
  emailTextToHtml,
  escapeEmailHtml,
} from "~/server/email/templates";

function notificationHtml(input: {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget?: string;
  details: string;
}) {
  const rows = [
    ["Name", input.name],
    ["Email", input.email],
    ["Company", input.company || "Not provided"],
    ["Project type", input.projectType],
    ["Budget", input.budget || "Not provided"],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${escapeEmailHtml(
          label ?? "",
        )}</td><td style="padding:4px 0">${escapeEmailHtml(value ?? "")}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h1 style="font-size:20px">New contact form message</h1>
      <table>${rows}</table>
      <hr style="border:0;border-top:1px solid #ddd;margin:20px 0" />
      ${emailTextToHtml(input.details)}
    </div>
  `;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactMessageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const message = await createContactMessage(parsed.data);

    if (env.CONTACT_TO_EMAIL) {
      try {
        await sendEmail({
          to: env.CONTACT_TO_EMAIL,
          replyTo: parsed.data.email,
          subject: `New contact message from ${parsed.data.name}`,
          html: notificationHtml(parsed.data),
        });
      } catch (error) {
        console.error("Could not send contact notification email", error);
      }
    }

    return NextResponse.json(
      { message: { id: message.id } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not store contact message", error);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 },
    );
  }
}
