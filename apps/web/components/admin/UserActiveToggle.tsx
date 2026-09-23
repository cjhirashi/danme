"use client";

import { useRouter } from "next/navigation";

// RF-116
export default function UserActiveToggle({ userId, active }: { userId: string; active: boolean }) {
  const router = useRouter();

  async function toggle() {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <button onClick={toggle} className="text-sm underline">
      {active ? "Desactivar" : "Activar"}
    </button>
  );
}
