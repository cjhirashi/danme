import AdminSidebar from "@/components/admin/AdminSidebar";

// Todo lo que cuelga de (protected) requiere sesión (proxy.ts) y lee Postgres —
// nunca debe pre-renderizarse en build time (mismo caso que SPEC-001 RF-001/§Renderizado).
export const dynamic = "force-dynamic";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-crema lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
