"use client";

import { useState, type FormEvent } from "react";

const MIN_PASSWORD_LENGTH = 8;

// RF-117, RF-120
export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña nueva debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("La confirmación no coincide con la contraseña nueva");
      return;
    }

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
    setConfirmPassword("");
    setSuccess(true);
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
        <label className="flex flex-col gap-1 text-sm font-medium text-verde-oscuro">
          Confirmar contraseña nueva
          <input
            type="password"
            className="rounded border px-3 py-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        {error && (
          <p role="alert" className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="rounded border border-verde-danme bg-verde-danme/10 px-4 py-3 text-sm font-medium text-verde-danme"
          >
            ✓ Contraseña actualizada correctamente.
          </p>
        )}

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
