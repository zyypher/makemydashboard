import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PREFIX = ["/login", "/signup", "/api/auth", "/_next", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PREFIX.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";

    // only add `from` if user tried to access dashboard
    if (pathname.startsWith("/dashboard")) {
      url.searchParams.set("from", pathname);
    }

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
