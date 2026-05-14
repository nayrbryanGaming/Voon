import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up", "/join", "/api/webhooks"];

function isPublicRoute(req: NextRequest): boolean {
  const { pathname } = req.nextUrl;
  return PUBLIC_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(path + "/") ||
      pathname.startsWith(path + "?")
  );
}

// Check if Clerk is properly configured (real publishable key)
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isClerkConfigured = clerkKey.startsWith("pk_") && clerkKey.length > 20;

export default async function middleware(req: NextRequest) {
  // When Clerk is fully configured, use Clerk middleware for route protection
  if (isClerkConfigured) {
    try {
      // Dynamic import to avoid Edge Runtime crash when keys are empty
      const { clerkMiddleware, createRouteMatcher } = await import(
        "@clerk/nextjs/server"
      );
      const isPublic = createRouteMatcher([
        "/",
        "/sign-in(.*)",
        "/sign-up(.*)",
        "/join(.*)",
        "/api/webhooks(.*)",
      ]);
      const handler = clerkMiddleware(async (auth, request) => {
        if (!isPublic(request)) {
          await auth.protect();
        }
      });
      return handler(req, {} as Parameters<typeof handler>[1]);
    } catch {
      // Fall through to simple handler
    }
  }

  // Fallback: allow public routes, redirect protected routes to sign-in
  if (isPublicRoute(req)) {
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
