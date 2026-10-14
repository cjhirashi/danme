import { describe, expect, it, vi, beforeEach } from "vitest";
import { mutate, NETWORK_ERROR } from "@/lib/admin/mutate";

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

// RF-121, RF-122
describe("mutate", () => {
  it("2xx → ok con el cuerpo JSON", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: "1" }));
    const result = await mutate("/api/x", { method: "POST" });
    expect(result).toEqual({ ok: true, data: { id: "1" } });
    expect(fetchMock).toHaveBeenCalledWith("/api/x", { method: "POST" });
  });

  it("2xx sin cuerpo JSON → ok con data null", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    expect(await mutate("/api/x", { method: "DELETE" })).toEqual({ ok: true, data: null });
  });

  it("4xx con RFC 9457 → error con el `detail` del servidor", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, { title: "Imagen inválida", status: 400, detail: "El archivo supera el máximo de 5MB" }),
    );
    expect(await mutate("/api/x", { method: "POST" })).toEqual({
      ok: false,
      error: "El archivo supera el máximo de 5MB",
    });
  });

  it("no-2xx con `title` pero sin `detail` → usa el `title`", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(404, { title: "Producto no encontrado", status: 404 }));
    expect(await mutate("/api/x", { method: "POST" })).toEqual({ ok: false, error: "Producto no encontrado" });
  });

  it("no-2xx sin JSON → error genérico con el status", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Internal Server Error", { status: 500 }));
    expect(await mutate("/api/x", { method: "POST" })).toEqual({ ok: false, error: "Error del servidor (500)" });
  });

  it("fetch rechaza (sin red) → mensaje de red", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    expect(await mutate("/api/x", { method: "POST" })).toEqual({ ok: false, error: NETWORK_ERROR });
  });
});
