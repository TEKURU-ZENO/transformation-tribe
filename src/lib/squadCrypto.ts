// Per-squad symmetric crypto. Key never leaves the browser:
// - generated at squad creation, embedded in the invite link's URL fragment (#k=…)
// - fragments aren't sent to the server, so the server only stores ciphertext
// - each member persists the key in localStorage under `squad-key:<squad_id>`

const ENC = "enc:v1:";
const PEND_KEY = "ascend.pendingInviteKey"; // map of { [code]: jwkJson }
const PEND_CODE = "ascend.pendingInviteCode";

function b64encode(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64decode(str: string) {
  const norm = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 === 0 ? "" : "=".repeat(4 - (norm.length % 4));
  const bin = atob(norm + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function generateSquadKey(): Promise<string> {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const jwk = await crypto.subtle.exportKey("jwk", key);
  return b64encode(new TextEncoder().encode(JSON.stringify(jwk)));
}

async function importKey(packed: string): Promise<CryptoKey> {
  const jwk = JSON.parse(new TextDecoder().decode(b64decode(packed)));
  return crypto.subtle.importKey("jwk", jwk, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export function storeSquadKey(squadId: string, packed: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`ascend.squad-key:${squadId}`, packed);
}
export function getSquadKey(squadId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`ascend.squad-key:${squadId}`);
}

export function setPendingInvite(code: string, packed: string | null) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PEND_CODE, code);
  if (packed) {
    const all = JSON.parse(sessionStorage.getItem(PEND_KEY) ?? "{}");
    all[code] = packed;
    sessionStorage.setItem(PEND_KEY, JSON.stringify(all));
  }
}
export function takePendingInvite(): { code: string; key: string | null } | null {
  if (typeof window === "undefined") return null;
  const code = sessionStorage.getItem(PEND_CODE);
  if (!code) return null;
  const all = JSON.parse(sessionStorage.getItem(PEND_KEY) ?? "{}");
  const key = all[code] ?? null;
  delete all[code];
  sessionStorage.setItem(PEND_KEY, JSON.stringify(all));
  sessionStorage.removeItem(PEND_CODE);
  return { code, key };
}
export function readPendingKeyFor(code: string): string | null {
  if (typeof window === "undefined") return null;
  const all = JSON.parse(sessionStorage.getItem(PEND_KEY) ?? "{}");
  return all[code] ?? null;
}

export async function encryptText(squadId: string, plaintext: string): Promise<string> {
  const packed = getSquadKey(squadId);
  if (!packed) throw new Error("No encryption key for this squad on this device");
  const key = await importKey(packed);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext)),
  );
  return `${ENC}${b64encode(iv)}.${b64encode(ct)}`;
}

export async function decryptText(squadId: string, payload: string): Promise<string> {
  if (!payload.startsWith(ENC)) return payload; // legacy plaintext
  const packed = getSquadKey(squadId);
  if (!packed) return "🔒 Encrypted — open this squad's invite link on this device to read.";
  try {
    const [ivB64, ctB64] = payload.slice(ENC.length).split(".");
    const key = await importKey(packed);
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64decode(ivB64) },
      key,
      b64decode(ctB64),
    );
    return new TextDecoder().decode(pt);
  } catch {
    return "🔒 Couldn't decrypt this message.";
  }
}

export function inviteLink(code: string, packed: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/join/${code}#k=${packed}`;
}