import Link from "next/link";
import { Mail, Phone, Linkedin, Github } from "lucide-react";
import { SiteBrandLogo } from "~/components/site/site-brand-logo";
import { cobaltClass } from "~/lib/home/cobalt-theme";
import { cn } from "~/lib/utils";

const socialLinks = [
  { href: "https://www.linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://github.com", label: "GitHub", icon: Github },
];

export function CobaltSiteFooter({
  brand,
  logoUrl,
}: {
  brand: string;
  logoUrl: string | null;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="inline-flex">
            <SiteBrandLogo brand={brand} logoUrl={logoUrl} />
          </Link>
          <p className="max-w-xs text-sm text-zinc-400">
            Simply Code LLC is a team of four developers building modern websites and full-stack web applications for
            businesses worldwide.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 transition hover:text-zinc-100"
                  aria-label={item.label}
                >
                  <Icon className="size-4" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <p className={cn("font-mono text-xs tracking-[0.3em] uppercase", cobaltClass.eyebrowStrong)}>Company</p>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link href="/" className="transition hover:text-zinc-100">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition hover:text-zinc-100">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/services" className="transition hover:text-zinc-100">
                Services
              </Link>
            </li>
            <li>
              <Link href="/work" className="transition hover:text-zinc-100">
                Our Work
              </Link>
            </li>
            <li>
              <Link href="/blog" className="transition hover:text-zinc-100">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-zinc-100">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="transition hover:text-zinc-100">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className={cn("font-mono text-xs tracking-[0.3em] uppercase", cobaltClass.eyebrowStrong)}>Contact</p>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-center gap-3">
              <Mail className="size-4 text-zinc-500" />
              <Link href="mailto:hello@simplycode.com" className="transition hover:text-zinc-100">
                hello@simplycode.com
              </Link>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 text-zinc-500" />
              <span>+1 (555) 123-4567</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className={cn("font-mono text-xs tracking-[0.3em] uppercase", cobaltClass.eyebrowStrong)}>Start a Project</p>
          <p className="text-sm text-zinc-400">
            Have a website, web application, or improvement in mind? We’d love to talk about it.
          </p>
          <Link
            href="/contact"
            className={cn(
              "inline-flex items-center justify-center rounded-none px-5 py-2 text-sm font-medium transition",
              cobaltClass.btn,
            )}
          >
            Tell Us About Your Project
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-center md:flex-row">
          <p className="font-mono text-xs text-zinc-600">© {year} {brand}. All rights reserved.</p>
          <p className="font-mono text-xs text-zinc-600">Built with Next.js, TypeScript & Vercel</p>
        </div>
      </div>
    </footer>
  );
}
