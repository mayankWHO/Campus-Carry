import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/login", "/signup", "/faq", "/about"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  if (!isPublicRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  // Redirect authenticated users away from auth pages (login/signup) to feed page
  if (
    (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") &&
    isAuthenticated
  ) {
    return nextjsMiddlewareRedirect(request, "/feed");
  }
});

export const config = {
  // Apply middleware to all paths except static assets (e.g. image files, Next internals)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
