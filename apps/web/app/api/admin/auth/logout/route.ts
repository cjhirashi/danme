import { buildClearSessionCookie } from "@/lib/http/session-cookie";

// RF-104
export async function POST(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: { "Set-Cookie": buildClearSessionCookie() },
  });
}
