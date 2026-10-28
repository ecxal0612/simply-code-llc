import Link from "next/link";
import { RegisterForm } from "~/app/(auth)/register/register-form";
import { AuthPageShell } from "~/components/auth/auth-page-shell";
import { authPageCopy } from "~/lib/auth/copy";
import { getSiteLogoUrl } from "~/server/site-header";

export default async function RegisterPage() {
  const logoUrl = await getSiteLogoUrl();
  const copy = authPageCopy.register;

  return (
    <AuthPageShell
      logoUrl={logoUrl}
      title={copy.title}
      description={copy.description}
      footer={
        <>
          {copy.footerPrompt}{" "}
          <Link href="/login">{copy.footerLink}</Link>
        </>
      }
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
