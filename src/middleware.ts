import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple public-path list — no Clerk import to avoid Edge Runtime crash when keys are empty.
// When real Clerk keys are set in Vercel, re-enable Clerk middleware here.
const PUBLIC_PREFIXES = ["/", "/sign-in", "/sign-up", "/join", "/api/webhooks"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(prefix + "/") ||
      pathname.startsWith(prefix + "?") ||
      // root is prefix of everything — handle separately
      (prefix === "/" && pathname === "/")
  );
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/sign-in", req.url));
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
