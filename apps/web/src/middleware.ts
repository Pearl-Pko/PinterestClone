import { redirect } from "next/dist/server/api-utils";
import { NextRequest, NextResponse } from "next/server";
import { isPublic } from "./lib/utils";


export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("pathname", pathname);

  const isAuthenticated =
    req.cookies.has("access_token") && req.cookies.has("refresh_token");
  
  if (!isAuthenticated && !isPublic(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated && isPublic(pathname)) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next();
}
//  s mod da dksasa

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

