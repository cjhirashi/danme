"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// RF-101, RF-102
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.detail ?? "No se pudo iniciar sesión");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-crema px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm"
      >
        <h1 className="mb-6 text-center text-2xl font-bold text-verde-oscuro">
          Panel DanMe
        </h1>

        <label className="mb-1 block text-sm font-medium text-verde-oscuro" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-verde-danme/30 px-3 py-2"
        />

        <label className="mb-1 block text-sm font-medium text-verde-oscuro" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-verde-danme/30 px-3 py-2"
        />

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-verde-danme py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
