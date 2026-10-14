"use client";

import { useState, type FormEvent } from "react";
import { mutate } from "@/lib/admin/mutate";

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
    const res = await mutate("/api/admin/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);

    // RF-121, RF-122
    if (!res.ok) {
      setError(`No se pudo cambiar la contraseña: ${res.error}`);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-verde-oscuro">Mi cuenta</h1>
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4 rounded border border-verde-danme/20 bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-2">
          <span className="font-medium text-verde-oscuro">Contraseña actual</span>
          <input
            type="password"
            className="rounded border border-verde-danme/20 px-3 py-2 focus:border-verde-danme focus:outline-none focus:ring-1 focus:ring-verde-danme"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-medium text-verde-oscuro">Contraseña nueva</span>
          <input
            type="password"
            className="rounded border border-verde-danme/20 px-3 py-2 focus:border-verde-danme focus:outline-none focus:ring-1 focus:ring-verde-danme"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-medium text-verde-oscuro">Confirmar contraseña nueva</span>
          <input
            type="password"
            className="rounded border border-verde-danme/20 px-3 py-2 focus:border-verde-danme focus:outline-none focus:ring-1 focus:ring-verde-danme"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        {error && (
          <p role="alert" className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="rounded border border-verde-danme bg-verde-danme/10 px-4 py-3 text-sm font-medium text-verde-danme"
          >
            ✅ Contraseña actualizada correctamente.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded bg-verde-danme py-2 font-semibold text-white transition-all duration-200 hover:bg-verde-danme/90 hover:shadow-md disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
