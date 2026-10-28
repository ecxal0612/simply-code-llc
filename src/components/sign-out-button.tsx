"use client";

import { signOutAction } from "~/components/sign-out-action";
import { Button } from "~/components/ui/button";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant={className ? "default" : "outline"}
        size="sm"
        className={className}
      >
        Sign out
      </Button>
    </form>
  );
}
