import Image from "next/image";
import { cn } from "~/lib/utils";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeamMemberAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={128}
        height={128}
        className={cn(
          "size-14 shrink-0 rounded-full border object-cover",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-semibold",
        className,
      )}
    >
      {getInitials(name) || "?"}
    </div>
  );
}
