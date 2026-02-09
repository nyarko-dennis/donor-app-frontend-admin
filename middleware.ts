import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Check for mandatory 2FA setup
        const token = req.nextauth.token;
        const isTwoFactorSetupRequired = token?.isTwoFactorSetupRequired;
        const isOnSetupPage = req.nextUrl.pathname.startsWith("/setup-2fa");

        if (isTwoFactorSetupRequired && !isOnSetupPage) {
            return NextResponse.redirect(new URL("/setup-2fa", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login
         * - forgot-password
         * - reset-password
         * - setup-2fa
         * - images in public public
         */
        "/dashboard/constituencies",
        "/dashboard/sub-constituencies",
        "/((?!api|_next/static|_next/image|favicon.ico|login|forgot-password|reset-password|setup-2fa|images).*)",
    ],
};
