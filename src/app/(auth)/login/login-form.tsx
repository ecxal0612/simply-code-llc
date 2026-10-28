"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { loginSchema, type LoginInput } from "~/schemas/auth";

const accessRevokedMessage =
  "Your dashboard access has been removed. Contact an administrator if you need access again.";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const accessRevoked =
    searchParams.get("error") === "access_revoked";

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (accessRevoked) {
      toast.error(accessRevokedMessage);
    }
  }, [accessRevoked]);

  async function onSubmit(values: LoginInput) {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      if (result.code === "access_revoked") {
        toast.error(accessRevokedMessage);
        return;
      }
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Signed in");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {accessRevoked ? (
        <p className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          {accessRevokedMessage}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Logging in…" : "Log in"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => void signIn("google", { callbackUrl })}
      >
        Sign in with Google
      </Button>
    </form>
  );
}
