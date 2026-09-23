export const SESSION_COOKIE_NAME = "danme_admin_session";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

function secureFlag(): string {
  return process.env.NODE_ENV === "production" ? "; Secure" : "";
}

export function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SEVEN_DAYS_SECONDS}${secureFlag()}`;
}

export function buildClearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag()}`;
}

// Lee el valor de la cookie de sesión directamente de los headers de un Request
// (uso en Route Handlers, que no comparten el contexto de `proxy.ts`).
export function readSessionToken(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  return match?.slice(SESSION_COOKIE_NAME.length + 1);
}
