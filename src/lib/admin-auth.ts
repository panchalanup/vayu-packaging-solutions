import { ADMIN_AUTH_CONFIG } from "@/config/adminAuth";

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

export const hashAdminPassword = async (password: string) => {
  const digest = await window.crypto.subtle.digest("SHA-256", encoder.encode(password));
  return toHex(digest);
};

export const isAdminAuthenticated = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return sessionStorage.getItem(ADMIN_AUTH_CONFIG.storageKey) === "true";
};

export const getAuthenticatedAdminEmail = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return sessionStorage.getItem(ADMIN_AUTH_CONFIG.emailStorageKey) ?? "";
};

export const loginAdmin = async (email: string, password: string) => {
  const normalizedEmail = email.trim();
  const hashedPassword = await hashAdminPassword(password);

  const isValid =
    normalizedEmail === ADMIN_AUTH_CONFIG.email && hashedPassword === ADMIN_AUTH_CONFIG.passwordHash;

  if (!isValid) {
    return false;
  }

  sessionStorage.setItem(ADMIN_AUTH_CONFIG.storageKey, "true");
  sessionStorage.setItem(ADMIN_AUTH_CONFIG.emailStorageKey, normalizedEmail);

  return true;
};

export const logoutAdmin = () => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(ADMIN_AUTH_CONFIG.storageKey);
  sessionStorage.removeItem(ADMIN_AUTH_CONFIG.emailStorageKey);
};