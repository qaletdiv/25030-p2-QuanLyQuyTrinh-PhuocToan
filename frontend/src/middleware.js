import { NextResponse } from "next/server";

// Helper giải mã vai trò từ JWT token phòng khi cookie role chưa có
function getRoleFromToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded).role;
  } catch (e) {
    return null;
  }
}

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const roleCookie = request.cookies.get("role")?.value;
  const role = roleCookie || (token ? getRoleFromToken(token) : null);
  const { pathname } = request.nextUrl;

  // 1. Các route cần bảo vệ: chưa đăng nhập (không có cookie token) -> chuyển hướng về /login
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

  // 2. Đã đăng nhập rồi mà cố vào lại /login hoặc /register -> chuyển hướng vào /dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Phân quyền và chuyển hướng theo vai trò (Role-based access control)
  if (token && role) {
    // 3.1. Tuyến đường /admin/* CHỈ dành riêng cho Quản trị viên (admin)
    if (pathname.startsWith("/admin")) {
      if (role !== "admin") {
        // Nếu là approver thì điều hướng về /approvals, nếu là employee thì về /dashboard
        const redirectUrl = role === "approver" ? "/approvals" : "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }

    // 3.2. Tuyến đường /approvals/* CHỈ dành cho Người duyệt (approver) và Admin
    if (pathname.startsWith("/approvals")) {
      if (role !== "approver" && role !== "admin") {
        // Nhân viên gõ thẳng URL /approvals sẽ bị chuyển hướng về /dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg)).*)"],
};
