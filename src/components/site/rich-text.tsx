import { cn } from "~/lib/utils";

export function RichText({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={cn("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
