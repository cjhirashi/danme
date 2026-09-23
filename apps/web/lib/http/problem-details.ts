// RFC 9457 — Problem Details for HTTP APIs (Constitución Art. 6)
export function problemResponse(status: number, title: string, detail?: string): Response {
  return new Response(
    JSON.stringify({
      type: "about:blank",
      title,
      status,
      ...(detail ? { detail } : {}),
    }),
    {
      status,
      headers: { "Content-Type": "application/problem+json" },
    },
  );
}
