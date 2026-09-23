"use client";

import { useRouter } from "next/navigation";

// RF-104
export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-sm underline">
      Cerrar sesión
    </button>
  );
}
