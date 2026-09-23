import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

// Todo lo que cuelga de (protected) requiere sesión (proxy.ts) y lee Postgres —
// nunca debe pre-renderizarse en build time (mismo caso que SPEC-001 RF-001/§Renderizado).
export const dynamic = "force-dynamic";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-crema">
      <header className="flex items-center justify-between bg-verde-oscuro px-6 py-4 text-crema">
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/admin/products">Productos</Link>
          <Link href="/admin/settings">Configuración</Link>
          <Link href="/admin/users">Usuarios</Link>
          <Link href="/admin/account">Mi cuenta</Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
