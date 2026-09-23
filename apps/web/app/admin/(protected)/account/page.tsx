"use client";

import { useState, type FormEvent } from "react";

// RF-117, RF-120
export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const res = await fetch("/api/admin/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.detail ?? "No se pudo cambiar la contraseña");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setMessage("Contraseña actualizada.");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-verde-oscuro">Mi cuenta</h1>
      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
          Contraseña actual
          <input
            type="password"
            className="rounded border px-3 py-2"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
          Contraseña nueva
          <input
            type="password"
            className="rounded border px-3 py-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-verde-danme">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-verde-danme py-2 font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
