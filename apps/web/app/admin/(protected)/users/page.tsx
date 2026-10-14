import { listAdmins } from "@/lib/services/admin-users.service";
import UserActiveToggle from "@/components/admin/UserActiveToggle";
import FlashNotice from "@/components/admin/FlashNotice";
import AdminTable from "@/components/admin/AdminTable";
import AdminButton from "@/components/admin/AdminButton";

// RF-114, RF-116, RF-123
export default async function AdminUsersPage() {
  const admins = await listAdmins();

  const headers = ["Email", "Activo"];
  const rows = admins.map((admin) => [
    admin.email,
    admin.active ? "✅ Sí" : "❌ No",
  ]);

  const actions = admins.map((admin) => (
    <UserActiveToggle key={admin.id} userId={admin.id} email={admin.email} active={admin.active} />
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-verde-oscuro">Usuarios admin</h1>
        <AdminButton element="link" href="/admin/users/new" variant="primary">
          ➕ Nueva cuenta
        </AdminButton>
      </div>

      <FlashNotice />

      {admins.length > 0 ? (
        <AdminTable headers={headers} rows={rows} actions={actions} />
      ) : (
        <div className="rounded border border-verde-danme/20 bg-verde-danme/5 p-6 text-center text-verde-oscuro">
          No hay usuarios.{" "}
          <AdminButton element="link" href="/admin/users/new" variant="primary">
            Crear uno
          </AdminButton>
        </div>
      )}
    </div>
  );
}
