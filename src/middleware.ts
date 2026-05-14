import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/join",
  "/api/auth",
  "/api/webhooks",
  "/api/integrations", // Bearer-token auth
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(prefix + "/") ||
      pathname.startsWith(prefix + "?") ||
      (prefix === "/" && pathname === "/")
  );
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for NextAuth session token
  const sessionToken =
    req.cookies.get("__Secure-authjs.session-token")?.value ??
    req.cookies.get("authjs.session-token")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
