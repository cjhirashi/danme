"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// RF-114, RF-115
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

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.detail ?? "No se pudo crear la cuenta");
      return;
    }

    router.push("/admin/users");
    router.refresh();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-verde-oscuro">Nueva cuenta admin</h1>
      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
          Email
          <input
            type="email"
            className="rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
          Contraseña temporal
          <input
            type="password"
            className="rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-verde-danme py-2 font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Creando…" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
