import { describe, it, expect } from "vitest";
import { signedCardAmount } from "../src/services/cardInvoiceService.js";

describe("signedCardAmount — regressão v0.3.30.0 (campo creditoTipo)", () => {
  it("despesa de cartão soma normalmente, com ou sem creditoTipo", () => {
    const antiga = { tipo: "despesa", valor: 100 };
    const nova = { tipo: "despesa", valor: 100, creditoTipo: null };
    expect(signedCardAmount(antiga)).toBe(100);
    expect(signedCardAmount(nova)).toBe(signedCardAmount(antiga));
  });

  it("receita (crédito) de cartão reduz a fatura da mesma forma, com ou sem creditoTipo", () => {
    const antiga = { tipo: "receita", valor: 50 };
    const nova = { tipo: "receita", valor: 50, creditoTipo: "estorno" };
    expect(signedCardAmount(antiga)).toBe(-50);
    expect(signedCardAmount(nova)).toBe(signedCardAmount(antiga));
  });

  it("ajuste de redução de fatura continua inalterado", () => {
    const t = { tipo: "despesa", natureza: "ajuste_fatura_cartao", ajusteFaturaTipo: "reducao", valor: 30 };
    expect(signedCardAmount(t)).toBe(-30);
  });
});
