import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "~/lib/auth.config";
import { isDashboardAccessRevoked } from "~/lib/auth/dashboard-access";

const { auth } = NextAuth(authConfig);

const authPages = ["/login", "/register"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  if (authPages.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (isLoggedIn) {
      const userId = req.auth?.user?.id;
      if (userId && (await isDashboardAccessRevoked(userId))) {
        const login = new URL("/login", req.url);
        login.searchParams.set("error", "access_revoked");
        const signOutUrl = new URL("/api/auth/signout", req.url);
        signOutUrl.searchParams.set("callbackUrl", login.toString());
        return NextResponse.redirect(signOutUrl);
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }

    const userId = req.auth?.user?.id;
    if (userId && (await isDashboardAccessRevoked(userId))) {
      const login = new URL("/login", req.url);
      login.searchParams.set("error", "access_revoked");
      const signOutUrl = new URL("/api/auth/signout", req.url);
      signOutUrl.searchParams.set("callbackUrl", login.toString());
      return NextResponse.redirect(signOutUrl);
    }

    if (
      pathname.startsWith("/dashboard/admin") ||
      pathname.startsWith("/dashboard/messages") ||
      pathname.startsWith("/dashboard/users")
    ) {
      if (req.auth?.user?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
