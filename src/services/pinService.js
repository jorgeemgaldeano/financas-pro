// pinService.js — v0.3.39 (proposta T7/DEC-0047)
//
// Gate de PIN local: impede que qualquer pessoa com acesso ao navegador (ou à
// URL pública, se a sessão do SO já estiver aberta) veja o app sem digitar um
// PIN antes. Roda 100% no cliente — não é proteção contra um atacante técnico
// com DevTools, é proporcional a "impedir uma olhada casual" (limitação
// documentada e aceita na proposta original).
//
// Deliberadamente FORA de BACKUP_STORAGE_KEYS e do payload de sync
// (buildSyncPayload em App.jsx é uma lista explícita de campos, não itera
// esta chave): o PIN é por instalação de navegador, não por conta financeira.
// Restaurar um backup do cônjuge não deve trocar o PIN deste dispositivo
// (decisão de Jorge, 2026-08-19).

import { lsGet, lsSave, lsRemove } from "../hooks/useLocalStorage.js";

const PIN_KEY = "pinHash";
const SESSION_UNLOCK_KEY = "fpro_pin_unlocked";

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function isPinConfigured() {
  return Boolean(lsGet(PIN_KEY, null));
}

export async function setPin(pin) {
  const value = String(pin || "").trim();
  if (!value) throw new Error("PIN vazio.");
  const hash = await sha256Hex(value);
  lsSave(PIN_KEY, hash);
}

export async function verifyPin(pin) {
  const stored = lsGet(PIN_KEY, null);
  if (!stored) return false;
  const hash = await sha256Hex(String(pin || "").trim());
  return hash === stored;
}

export function clearPin() {
  lsRemove(PIN_KEY);
}

// Sessão destravada "até fechar a aba" (decisão de Jorge, 2026-08-19):
// sessionStorage é limpo pelo navegador ao fechar a aba/janela, mas
// sobrevive a F5/reload da mesma aba — exatamente a semântica pedida.
export function isSessionUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSessionUnlocked() {
  try {
    sessionStorage.setItem(SESSION_UNLOCK_KEY, "1");
  } catch { /* sessionStorage indisponível (ex.: modo privado restrito) — degrada para sempre pedir PIN */ }
}
