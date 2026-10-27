import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import { MessageActions } from "~/app/dashboard/messages/message-actions";
import { ReplyForm } from "~/app/dashboard/messages/reply-form";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  contactMessageStatusClassName,
  contactMessageStatusLabels,
  getContactMessageListStatus,
} from "~/lib/contact/message-status";
import {
  getContactMessageById,
  listContactMessageReplies,
  markContactMessageRead,
} from "~/server/contact";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function DashboardMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await markContactMessageRead(id);
  const message = await getContactMessageById(id);
  if (!message) notFound();

  const replies = await listContactMessageReplies(id);
  const listStatus = getContactMessageListStatus(message);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/dashboard/messages">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to messages
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold sm:text-3xl">{message.name}</h1>
            <span className={contactMessageStatusClassName(listStatus)}>
              {contactMessageStatusLabels[listStatus]}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Submitted {dateFormatter.format(message.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`mailto:${message.email}`}>
              <Mail className="mr-1.5 size-3.5" />
              Email sender
            </a>
          </Button>
          <MessageActions
            messageId={message.id}
            senderName={message.name}
            archived={Boolean(message.archivedAt)}
            redirectAfterDelete="/dashboard/messages"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="size-4" />
                Inquiry details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">Email</dt>
                  <dd className="mt-1 break-all">
                    <a
                      href={`mailto:${message.email}`}
                      className="hover:underline"
                    >
                      {message.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Company</dt>
                  <dd className="mt-1">{message.company ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Project type</dt>
                  <dd className="mt-1">{message.projectType}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Budget</dt>
                  <dd className="mt-1">{message.budget ?? "Not provided"}</dd>
                </div>
              </dl>
              <div className="border-t pt-4">
                <h3 className="text-muted-foreground text-xs">Project details</h3>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                  {message.details}
                </p>
              </div>
            </CardContent>
          </Card>

          {replies.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sent replies</CardTitle>
                <CardDescription>
                  {replies.length} email repl{replies.length === 1 ? "y" : "ies"}{" "}
                  sent from the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="rounded-xl border bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {dateFormatter.format(reply.createdAt)}
                      </p>
                      {reply.replyEmailSentAt ? (
                        <span className="text-muted-foreground text-xs">
                          Delivered by email
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700 dark:text-amber-300">
                          Saved only (email not sent)
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                      {reply.body}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Reply by email</CardTitle>
            <CardDescription>
              Send a reply directly to {message.name} at {message.email}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReplyForm messageId={message.id} email={message.email} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
