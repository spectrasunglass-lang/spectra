import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "spectra_admin_session";

// Fallback values if not set in .env
const DEFAULT_EMAIL = "spectrasunglass@gmail.com";
const DEFAULT_PASSWORD = "admin@spectra2026";
const DEFAULT_SECRET = "spectra_luxury_eyewear_admin_secret_key_2026";

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || DEFAULT_EMAIL,
    password: process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD,
    secret: process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET,
  };
}

export function verifyAdminCredentials(inputEmail: string, inputPass: string): boolean {
  const { email, password } = getAdminCredentials();
  return (
    inputEmail.trim().toLowerCase() === email.trim().toLowerCase() &&
    inputPass.trim() === password.trim()
  );
}

export function generateSessionToken(email: string): string {
  const { secret } = getAdminCredentials();
  const timestamp = Date.now();
  const payload = `${email}:${timestamp}:${secret}`;
  // Simple Base64 signature for lightweight session verification
  return Buffer.from(payload).toString("base64");
}

export function isValidSessionToken(token: string): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [tokenEmail, , tokenSecret] = decoded.split(":");
    const { email, secret } = getAdminCredentials();
    return (
      tokenEmail.trim().toLowerCase() === email.trim().toLowerCase() &&
      tokenSecret === secret
    );
  } catch {
    return false;
  }
}

export async function isSessionAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return Boolean(token && isValidSessionToken(token));
  } catch {
    return false;
  }
}
