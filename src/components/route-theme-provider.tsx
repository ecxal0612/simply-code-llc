"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "~/components/theme-provider";

export function RouteThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme={isDashboard ? "light" : "dark"}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
