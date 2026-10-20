import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Providers } from "~/providers/providers";
import "~/styles/globals.css";
import { env } from "~/env";

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: "Simply Code LLC — custom software development.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
