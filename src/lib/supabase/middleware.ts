import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isUserRole, panelPath } from "@/lib/auth/roles";

const AUTH_PATHS = new Set(["/login", "/registro"]);

function isPublicPath(pathname: string) {
  return (
    pathname === "/api/health" ||
    pathname.startsWith("/certificado") ||
    pathname.startsWith("/_next")
  );
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!hasPublicSupabaseEnv()) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return response;
  }

  if (!user && (pathname === "/" || AUTH_PATHS.has(pathname))) {
    return response;
  }

  if (!user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    return NextResponse.redirect(login);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role =
    profile && isUserRole(profile.role) ? profile.role : "estudiante";
  const home = panelPath(role);

  if (pathname === "/" || AUTH_PATHS.has(pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = home;
    return NextResponse.redirect(target);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    const target = request.nextUrl.clone();
    target.pathname = home;
    return NextResponse.redirect(target);
  }

  if (pathname.startsWith("/instructor") && role !== "instructor") {
    const target = request.nextUrl.clone();
    target.pathname = home;
    return NextResponse.redirect(target);
  }

  if (pathname.startsWith("/estudiante") && role !== "estudiante") {
    const target = request.nextUrl.clone();
    target.pathname = home;
    return NextResponse.redirect(target);
  }

  return response;
}
