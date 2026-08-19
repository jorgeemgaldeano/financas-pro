// pinService.test.js — v0.3.39 (proposta T7/DEC-0047)
//
// O ambiente de teste roda em Node puro ("environment: node" no
// vitest.config.js), sem localStorage/sessionStorage globais — diferente do
// navegador. Cada teste injeta um polyfill em memória via vi.stubGlobal,
// espelhando a API real (getItem/setItem/removeItem), e vi.unstubAllGlobals
// no afterEach evita vazar estado entre testes.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
  };
}

let pinService;

beforeEach(async () => {
  vi.stubGlobal("localStorage", memoryStorage());
  vi.stubGlobal("sessionStorage", memoryStorage());
  vi.resetModules();
  pinService = await import("../src/services/pinService.js");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isPinConfigured", () => {
  it("é false antes de qualquer PIN ser definido", () => {
    expect(pinService.isPinConfigured()).toBe(false);
  });

  it("é true depois de setPin", async () => {
    await pinService.setPin("1234");
    expect(pinService.isPinConfigured()).toBe(true);
  });
});

describe("verifyPin", () => {
  it("recusa quando nenhum PIN foi configurado", async () => {
    expect(await pinService.verifyPin("1234")).toBe(false);
  });

  it("aceita o PIN correto e recusa o errado", async () => {
    await pinService.setPin("2468");
    expect(await pinService.verifyPin("2468")).toBe(true);
    expect(await pinService.verifyPin("0000")).toBe(false);
  });

  it("não grava o PIN em texto puro (hash não contém o PIN literal)", async () => {
    await pinService.setPin("135790");
    const stored = JSON.parse(localStorage.getItem("fpro_v1_pinHash"));
    expect(stored).not.toContain("135790");
    expect(stored).toMatch(/^[0-9a-f]{64}$/); // SHA-256 em hex
  });
});

describe("clearPin", () => {
  it("remove o PIN configurado", async () => {
    await pinService.setPin("1111");
    pinService.clearPin();
    expect(pinService.isPinConfigured()).toBe(false);
    expect(await pinService.verifyPin("1111")).toBe(false);
  });
});

describe("sessão destravada", () => {
  it("começa travada", () => {
    expect(pinService.isSessionUnlocked()).toBe(false);
  });

  it("markSessionUnlocked destrava a sessão atual", () => {
    pinService.markSessionUnlocked();
    expect(pinService.isSessionUnlocked()).toBe(true);
  });
});
