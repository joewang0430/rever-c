// Utilities to encode/decode SetupData into/from URL hash for pure-frontend navigation

import { SetupData, PlayerConfig, BoardSize, PlayerType, CustomType } from "@/data/types/setup";

// base64url encode/decode helpers that support Unicode strings
function toBase64Url(input: string): string {
  // Encode to UTF-8 bytes via encodeURIComponent trick, then btoa
  const base64 = btoa(unescape(encodeURIComponent(input)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // pad with '=' to multiples of 4
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  const decoded = atob(base64);
  return decodeURIComponent(escape(decoded));
}

function isPlayerType(v: any): v is PlayerType {
  return v === "custom" || v === "archive" || v === "human" || v === "ai" || v === null;
}

function isCustomType(v: any): v is CustomType {
  return v === "candidate" || v === "cache";
}

function isBoardSize(v: any): v is BoardSize {
  return v === 6 || v === 8 || v === 12;
}

function isPlayerConfig(cfg: any): cfg is PlayerConfig {
  if (!cfg || typeof cfg !== "object") return false;
  if (!isPlayerType(cfg.type)) return false;
  if (cfg.config && typeof cfg.config !== "object") return false;

  if (cfg.type === "custom") {
    const cc = cfg.config || {};
    if (!isCustomType(cc.customType)) return false;
    if (typeof cc.customCodeId !== "string" || cc.customCodeId.length < 8) return false;
    if (typeof cc.customName !== "string" || cc.customName.length === 0) return false;
  } else if (cfg.type === "archive") {
    const ac = cfg.config || {};
    if (typeof ac.archiveGroup !== "string" || ac.archiveGroup.length === 0) return false;
    if (typeof ac.archiveId !== "string" || ac.archiveId.length === 0) return false;
  } else if (cfg.type === "human") {
    // humanName is optional; no strict requirements
  } else if (cfg.type === "ai") {
    const ai = cfg.config || {};
    if (typeof ai.aiId !== "string" || ai.aiId.length === 0) return false;
  }
  return true;
}

export function isValidSetupData(obj: any): obj is SetupData {
  if (!obj || typeof obj !== "object") return false;
  if (typeof obj.matchId !== "string" || obj.matchId.length === 0) return false;
  if (!isBoardSize(obj.boardSize)) return false;
  if (!isPlayerConfig(obj.black)) return false;
  if (!isPlayerConfig(obj.white)) return false;
  if (typeof obj.createAt !== "string") return false;
  return true;
}

// Build the token string for URL hash from SetupData
export function buildSetupToken(setup: SetupData): string {
  const json = JSON.stringify(setup);
  return toBase64Url(json);
}

// Parse SetupData from the URL hash string. Accepts formats like '#s=TOKEN' or '#TOKEN'.
export function parseSetupFromHash(hash: string): SetupData | null {
  if (!hash) return null;
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;
  let token = raw;
  if (raw.includes("=")) {
    // support style 's=TOKEN&x=y'
    const params = new URLSearchParams(raw);
    const s = params.get("s");
    token = s || "";
  }
  if (!token) return null;
  try {
    const json = fromBase64Url(token);
    const data = JSON.parse(json);
    if (isValidSetupData(data)) return data;
    return null;
  } catch {
    return null;
  }
}

// Optional guard for token length to avoid pathological URLs
export function isTokenLengthReasonable(token: string, maxChars: number = 1800): boolean {
  return token.length <= maxChars;
}
