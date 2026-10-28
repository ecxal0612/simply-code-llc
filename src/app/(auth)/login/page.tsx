import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "~/app/(auth)/login/login-form";
import { AuthPageShell } from "~/components/auth/auth-page-shell";
import { authPageCopy } from "~/lib/auth/copy";
import { getSiteLogoUrl } from "~/server/site-header";

export default async function LoginPage() {
  const logoUrl = await getSiteLogoUrl();
  const copy = authPageCopy.login;

  return (
    <AuthPageShell
      logoUrl={logoUrl}
      title={copy.title}
      description={copy.description}
      footer={
        <>
          {copy.footerPrompt}{" "}
          <Link href="/register">{copy.footerLink}</Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-center text-sm text-[#64748b]">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
