"use client";

import { useRouter } from "next/navigation";
import { mutate } from "@/lib/admin/mutate";
import { setFlash } from "@/lib/admin/flash";

// RF-116, RF-121, RF-122
export default function UserActiveToggle({ userId, email, active }: { userId: string; email: string; active: boolean }) {
  const router = useRouter();

  async function toggle() {
    const result = await mutate(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    const action = active ? "desactivar" : "activar";
    setFlash(
      result.ok
        ? { variant: "success", message: `Cuenta ${email} ${active ? "desactivada" : "activada"}` }
        : { variant: "error", message: `No se pudo ${action} la cuenta ${email}: ${result.error}` },
    );
    if (result.ok) router.refresh();
  }

  return (
    <button onClick={toggle} className="text-sm underline">
      {active ? "Desactivar" : "Activar"}
    </button>
  );
}
