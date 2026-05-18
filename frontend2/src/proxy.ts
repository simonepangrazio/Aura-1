import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ROUTES = [
  "/dashboard",
  "/tenants",
  "/users",
  "/agents",
  "/devices",
  "/sessions",
  "/workflows",
  "/analytics",
  "/settings",
];

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("dashboard_role")?.value;
  const isTenantRoute = pathname === "/tenant/dashboard" || pathname.startsWith("/tenant/");

  if (pathname === "/login") {
    if (role === "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (role === "tenant_admin") {
      return NextResponse.redirect(new URL("/tenant/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute(pathname)) {
    if (role === "super_admin") {
      return NextResponse.next();
    }
    if (role === "tenant_admin") {
      return NextResponse.redirect(new URL("/tenant/dashboard", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isTenantRoute) {
    if (role === "tenant_admin") {
      return NextResponse.next();
    }
    if (role === "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/tenants/:path*",
    "/users/:path*",
    "/agents/:path*",
    "/devices/:path*",
    "/sessions/:path*",
    "/workflows/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/tenant/:path*",
  ],
};
