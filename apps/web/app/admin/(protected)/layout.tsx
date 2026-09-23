import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

// Todo lo que cuelga de (protected) requiere sesión (proxy.ts) y lee Postgres —
// nunca debe pre-renderizarse en build time (mismo caso que SPEC-001 RF-001/§Renderizado).
export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/settings", label: "Configuración" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/account", label: "Mi cuenta" },
];

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-crema">
      <aside className="flex w-56 shrink-0 flex-col bg-verde-oscuro text-crema">
        <div className="px-6 py-6 text-lg font-bold">DanMe Admin</div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm font-medium hover:bg-verde-danme/40"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-crema/20 px-3 py-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
