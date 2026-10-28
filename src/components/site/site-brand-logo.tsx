import Image from "next/image";
import { cobaltClass } from "~/lib/home/cobalt-theme";
import { cn } from "~/lib/utils";

type SiteBrandLogoProps = {
  brand: string;
  logoUrl: string | null;
  /** Public marketing site (cobalt) or dashboard chrome. */
  variant?: "site" | "dashboard";
  showWordmark?: boolean;
  className?: string;
  imageClassName?: string;
  wordmarkClassName?: string;
};

export function SiteBrandLogo({
  brand,
  logoUrl,
  variant = "site",
  showWordmark = true,
  className,
  imageClassName,
  wordmarkClassName,
}: SiteBrandLogoProps) {
  const fallbackClassName =
      variant === "dashboard"
      ? "bg-[#1e90ff]/20 text-[#1e90ff] flex size-8 items-center justify-center rounded-[10px] font-mono text-xs font-bold"
      : cn(
          "flex size-8 items-center justify-center rounded-[18px] font-mono text-xs font-bold",
          cobaltClass.logo,
        );

  return (
    <span className={cn("flex items-center gap-2", className)}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`${brand} logo`}
          width={32}
          height={32}
          className={cn("size-8 object-contain", imageClassName)}
        />
      ) : (
        <span className={cn(fallbackClassName, imageClassName)}>SC</span>
      )}
      {showWordmark ? (
        <span
          className={cn(
            "text-sm font-semibold tracking-tight",
            variant === "dashboard" && "text-foreground",
            wordmarkClassName,
          )}
        >
          {brand}
        </span>
      ) : null}
    </span>
  );
}
