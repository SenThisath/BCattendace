import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isRoute = createRouteMatcher([
    "/developer(.*)",
    "/class-management(.*)",
    "/teacher-management(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    // Restrict dashboard routes to signed in users
    if (isRoute(req)) await auth.protect();
    const role = (await auth()).sessionClaims?.metadata.role;
    if (
        role === "developer" &&
        !req.nextUrl.pathname.startsWith("/developer")
    ) {
        const url = req.nextUrl.clone();
        url.pathname = "/developer";
        return NextResponse.redirect(url);
    } else if (role === "admin" && !req.nextUrl.pathname.startsWith("/admin")) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
    } else if (
        role === "superadmin" &&
        !req.nextUrl.pathname.startsWith("/superadmin")
    ) {
        const url = req.nextUrl.clone();
        url.pathname = "/superadmin";
        return NextResponse.redirect(url);
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
