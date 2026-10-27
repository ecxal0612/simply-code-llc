import Image from "next/image";
import { cn } from "~/lib/utils";

type PostFeaturedImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function PostFeaturedImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: PostFeaturedImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "aspect-[16/9] bg-gradient-to-br from-[#1E90FF]/20 to-transparent",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div className={cn("relative aspect-[16/9] overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
