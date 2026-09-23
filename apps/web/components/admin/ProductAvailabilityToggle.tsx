"use client";

import { useRouter } from "next/navigation";

// RF-108
export default function ProductAvailabilityToggle({
  productId,
  available,
}: {
  productId: string;
  available: boolean;
}) {
  const router = useRouter();

  async function toggle() {
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !available }),
    });
    router.refresh();
  }

  return (
    <button onClick={toggle} className="text-sm underline">
      {available ? "Desactivar" : "Activar"}
    </button>
  );
}
