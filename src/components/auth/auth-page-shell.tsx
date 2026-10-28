import type { ReactNode } from "react";
import { SiteBrandLogo } from "~/components/site/site-brand-logo";
import { authMarketingCopy } from "~/lib/auth/copy";
import { env } from "~/env";

export function AuthPageShell({
  logoUrl,
  title,
  description,
  children,
  footer,
}: {
  logoUrl: string | null;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const appName = env.NEXT_PUBLIC_APP_NAME;

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <aside className="auth-panel-promo" aria-hidden>
          <div className="auth-panel-promo-inner">
            <h2>{authMarketingCopy.headline}</h2>
            <p>{authMarketingCopy.subline}</p>
          </div>
        </aside>
        <div className="auth-panel-form">
          <div className="auth-brand">
            <SiteBrandLogo
              brand={appName}
              logoUrl={logoUrl}
              showWordmark
              className="justify-center"
              imageClassName="size-9 rounded-[10px] object-cover"
              wordmarkClassName="text-lg font-semibold text-[#0f172a]"
            />
          </div>
          <div className="auth-mobile-tagline md:hidden">
            <p className="auth-mobile-tagline-head">{authMarketingCopy.headline}</p>
            <p className="auth-mobile-tagline-sub">{authMarketingCopy.subline}</p>
          </div>
          <h1 className="auth-heading">{title}</h1>
          <p className="auth-lead">{description}</p>
          <div className="auth-form-body">{children}</div>
          <div className="auth-footer">{footer}</div>
        </div>
      </div>
    </main>
  );
}
