"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Notice from "@/components/admin/Notice";
import { mutate } from "@/lib/admin/mutate";
import { setFlash } from "@/lib/admin/flash";

// RF-114, RF-115, RF-121, RF-122
export default function NewAdminUserPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const result = await mutate("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setFlash({ variant: "success", message: `Cuenta ${email} creada` });
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-verde-oscuro">Nueva cuenta admin</h1>
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4 rounded border border-verde-danme/20 bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-2">
          <span className="font-medium text-verde-oscuro">Email</span>
          <input
            type="email"
            className="rounded border border-verde-danme/20 px-3 py-2 focus:border-verde-danme focus:outline-none focus:ring-1 focus:ring-verde-danme"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-medium text-verde-oscuro">Contraseña temporal</span>
          <input
            type="password"
            className="rounded border border-verde-danme/20 px-3 py-2 focus:border-verde-danme focus:outline-none focus:ring-1 focus:ring-verde-danme"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <Notice variant="error" message={error} onClose={() => setError(null)} />}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded bg-verde-danme py-2 font-semibold text-white transition-all duration-200 hover:bg-verde-danme/90 hover:shadow-md disabled:opacity-60"
        >
          {saving ? "Creando…" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
