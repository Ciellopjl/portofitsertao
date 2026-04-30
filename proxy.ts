import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Ignorar API e arquivos estáticos
    if (path.startsWith("/api") || path.startsWith("/_next") || path.includes(".")) {
      return NextResponse.next();
    }

    // Se não estiver logado
    if (!token) {
      if (path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin-login", req.url));
      }
      if (path.startsWith("/aluno")) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.next();
    }

    // Se tentar acessar rota admin sem role ADMIN
    if (path.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/aluno/dashboard", req.url));
    }

    // Se tentar acessar rota aluno sendo ADMIN
    if (path.startsWith("/aluno") && token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle all redirects
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/aluno/:path*"],
};
