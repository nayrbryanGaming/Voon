import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/join(.*)",
  "/api/webhooks(.*)",
]);

// Graceful fallback: if Clerk keys aren't configured, allow public routes and block protected routes
function fallbackMiddleware(req: NextRequest) {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/sign-in", req.url));
}

// Check if Clerk is properly configured (non-empty keys)
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isClerkConfigured = clerkKey.startsWith("pk_") && clerkKey.length > 20;

const clerkHandler = isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    })
  : fallbackMiddleware;

export default clerkHandler;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
