import { redirect } from "next/dist/server/api-utils";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/signup", "/password/reset", "/reset-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAuthenticated =
    req.cookies.has("access_token") && req.cookies.has("refresh_token");
  
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
