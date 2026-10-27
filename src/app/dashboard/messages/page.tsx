import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Inbox, Mail, MessageSquare } from "lucide-react";
import { MessageActions } from "~/app/dashboard/messages/message-actions";
import { MessagesInboxTabs } from "~/app/dashboard/messages/messages-inbox-tabs";
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
import { listContactMessages } from "~/server/contact";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function DashboardMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const showArchived = view === "archived";

  const [inboxMessages, archivedMessages] = await Promise.all([
    listContactMessages({ archived: false }),
    listContactMessages({ archived: true }),
  ]);
  const messages = showArchived ? archivedMessages : inboxMessages;

  const newCount = inboxMessages.filter(
    (message) => getContactMessageListStatus(message) === "new",
  ).length;
  const repliedCount = inboxMessages.filter(
    (message) => getContactMessageListStatus(message) === "replied",
  ).length;
  const readCount = inboxMessages.filter(
    (message) => getContactMessageListStatus(message) === "read",
  ).length;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-sky-500/10 via-background to-background p-6 sm:p-8">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
              Administration
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">Messages</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Contact form submissions. Open a message to read the full inquiry,
              archive it, or reply by email.
            </p>
          </div>
          <div className="bg-background/80 flex size-14 items-center justify-center rounded-xl border shadow-sm">
            <MessageSquare className="text-primary size-7" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New</CardDescription>
            <CardTitle className="text-2xl">{newCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Read</CardDescription>
            <CardTitle className="text-2xl">{readCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Replied</CardDescription>
            <CardTitle className="text-2xl">{repliedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {showArchived ? (
                <Inbox className="size-5" />
              ) : (
                <Mail className="size-5" />
              )}
              {showArchived ? "Archived messages" : "Inbox"}
            </CardTitle>
            <CardDescription>
              {showArchived
                ? "Restore messages to the main inbox or delete them permanently."
                : "Unread messages show a New badge until you open them."}
            </CardDescription>
          </div>
          <Suspense fallback={null}>
            <MessagesInboxTabs
              inboxCount={inboxMessages.length}
              archivedCount={archivedMessages.length}
            />
          </Suspense>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <Mail className="text-muted-foreground mx-auto size-8" />
              <p className="mt-3 font-medium">
                {showArchived ? "No archived messages" : "No messages yet"}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {showArchived
                  ? "Archived inquiries will appear here."
                  : "New contact form submissions will appear here."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {messages.map((message) => {
                const listStatus = getContactMessageListStatus(message);
                return (
                  <div
                    key={message.id}
                    className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <Link
                      href={`/dashboard/messages/${message.id}`}
                      className="flex min-w-0 flex-1 items-center gap-4 transition hover:opacity-90"
                    >
                      <div className="bg-sky-500/15 text-sky-700 dark:text-sky-300 flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                        {getInitials(message.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{message.name}</p>
                          <span
                            className={contactMessageStatusClassName(listStatus)}
                          >
                            {contactMessageStatusLabels[listStatus]}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 truncate text-sm">
                          {message.email}
                          {message.company ? ` · ${message.company}` : ""}
                        </p>
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                          {message.details}
                        </p>
                        <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          <span>{message.projectType}</span>
                          {message.budget ? <span>{message.budget}</span> : null}
                          <span>{dateFormatter.format(message.createdAt)}</span>
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground mt-3 size-4 shrink-0 lg:mt-4" />
                    </Link>
                    <MessageActions
                      messageId={message.id}
                      senderName={message.name}
                      archived={Boolean(message.archivedAt)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
