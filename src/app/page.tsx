import Link from "next/link";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { auth } from "~/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{env.NEXT_PUBLIC_APP_NAME}</h1>
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground leading-relaxed">
        We design and build reliable software for growing businesses. This site is the home for Simply Code LLC —
        services, work, and client tools will live here.
      </p>
      <div className="flex flex-wrap gap-3">
        {session?.user ? (
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Create account</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
