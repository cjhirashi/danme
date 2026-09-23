import Link from "next/link";
import { listAdmins } from "@/lib/services/admin-users.service";
import UserActiveToggle from "@/components/admin/UserActiveToggle";

// RF-114, RF-116
export default async function AdminUsersPage() {
  const admins = await listAdmins();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-verde-oscuro">Usuarios admin</h1>
        <Link href="/admin/users/new" className="rounded bg-verde-danme px-4 py-2 text-white">
          Nueva cuenta
        </Link>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-verde-oscuro/70">
            <th className="py-2">Email</th>
            <th>Activo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id} className="border-b">
              <td className="py-2">{admin.email}</td>
              <td>{admin.active ? "Sí" : "No"}</td>
              <td>
                <UserActiveToggle userId={admin.id} active={admin.active} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
