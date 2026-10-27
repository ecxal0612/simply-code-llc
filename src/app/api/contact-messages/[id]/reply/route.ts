import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { isAdminRole } from "~/lib/auth/roles";
import { contactReplySchema } from "~/lib/contact/schema";
import {
  getContactMessageById,
  saveContactMessageReply,
} from "~/server/contact";
import { sendEmail } from "~/server/email/sendEmail";
import {
  emailTextToHtml,
  escapeEmailHtml,
} from "~/server/email/templates";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactReplySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid reply" },
      { status: 400 },
    );
  }

  const { id } = await params;
  const message = await getContactMessageById(id);
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  let delivered = false;
  try {
    const result = await sendEmail({
      to: message.email,
      subject: "Re: Your inquiry to Simply Code LLC",
      replyTo: session.user.email ?? undefined,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <p>Hi ${escapeEmailHtml(message.name)},</p>
          ${emailTextToHtml(parsed.data.body)}
          <p style="margin-top:24px">Best,<br />Simply Code LLC</p>
        </div>
      `,
    });
    delivered = result.delivered;
  } catch (error) {
    console.error("Could not send contact reply email", error);
    const providerMessage =
      error instanceof Error ? error.message.trim() : "";
    return NextResponse.json(
      {
        error:
          providerMessage ||
          "The reply could not be emailed. Check the email provider configuration and try again.",
      },
      { status: 502 },
    );
  }

  try {
    const updated = await saveContactMessageReply(id, {
      body: parsed.data.body,
      emailSentAt: delivered ? new Date() : null,
      sentByUserId: session.user.id,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: updated, delivered });
  } catch (error) {
    console.error("Could not save contact reply", error);
    return NextResponse.json(
      { error: "Could not save the reply." },
      { status: 500 },
    );
  }
}
