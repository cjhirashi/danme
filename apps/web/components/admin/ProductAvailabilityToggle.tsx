"use client";

import { useRouter } from "next/navigation";
import { mutate } from "@/lib/admin/mutate";
import { setFlash } from "@/lib/admin/flash";

// RF-108, RF-121, RF-122
export default function ProductAvailabilityToggle({
  productId,
  productName,
  available,
}: {
  productId: string;
  productName: string;
  available: boolean;
}) {
  const router = useRouter();

  async function toggle() {
    const result = await mutate(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !available }),
    });
    const action = available ? "desactivar" : "activar";
    setFlash(
      result.ok
        ? { variant: "success", message: `Producto «${productName}» ${available ? "desactivado" : "activado"}` }
        : { variant: "error", message: `No se pudo ${action} «${productName}»: ${result.error}` },
    );
    if (result.ok) router.refresh();
  }

  return (
    <button onClick={toggle} className="text-sm underline">
      {available ? "Desactivar" : "Activar"}
    </button>
  );
}
