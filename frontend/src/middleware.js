import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Các route cần bảo vệ: chưa đăng nhập (không có cookie token) -> đá về /login
  const protectedRoutes = [
    "/dashboard",
    "/requests",
    "/approvals",
    "/admin",
    "/notifications",
  ];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Đã đăng nhập rồi mà cố vào lại /login hoặc /register -> đá vào /dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg)).*)"],
};
