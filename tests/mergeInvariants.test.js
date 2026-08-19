// mergeInvariants.test.js — v0.3.38 Fase 4 (DEC-0045)
//
// Testa validarInvariantesFinanceiros isoladamente, com payloads já
// mesclados (não passa pelo mergeService) — cobre os cenários concretos
// levantados pelo especialista-financas na revisão de 2026-08-18.
import { describe, it, expect } from "vitest";
import { validarInvariantesFinanceiros } from "../src/services/mergeInvariants.js";

describe("transações", () => {
  it("aceita status pago com valorPago igual ao valor", () => {
    const payload = { trans: [{ id: "t1", valor: 500, status: "pago", valorPago: 500 }] };
    expect(validarInvariantesFinanceiros(payload)).toEqual([]);
  });

  it("acusa status pago com valorPago divergente do valor", () => {
    const payload = { trans: [{ id: "t1", valor: 800, status: "pago", valorPago: 500 }] };
    const violacoes = validarInvariantesFinanceiros(payload);
    expect(violacoes).toHaveLength(1);
    expect(violacoes[0].tipo).toBe("transacao_paga_incoerente");
  });

  it("acusa status parcial com valorPago fora do intervalo (0, valor)", () => {
    const payload = { trans: [{ id: "t1", valor: 500, status: "parcial", valorPago: 500 }] };
    const violacoes = validarInvariantesFinanceiros(payload);
    expect(violacoes.some((v) => v.tipo === "transacao_parcial_incoerente")).toBe(true);
  });

  it("acusa pendingAmount que não bate com valor menos pago", () => {
    const payload = { trans: [{ id: "t1", valor: 800, status: "pago", valorPago: 800, pendingAmount: 300 }] };
    const violacoes = validarInvariantesFinanceiros(payload);
    expect(violacoes.some((v) => v.tipo === "pendingAmount_incoerente")).toBe(true);
  });
});

describe("transferências", () => {
  it("aceita as duas pernas presentes e coerentes", () => {
    const payload = {
      trans: [
        { id: "t1", transferId: "x1", tipo: "despesa", valor: 700 },
        { id: "t2", transferId: "x1", tipo: "receita", valor: 700 },
      ],
    };
    expect(validarInvariantesFinanceiros(payload)).toEqual([]);
  });

  it("acusa transferência com apenas uma perna sobrevivente", () => {
    const payload = {
      trans: [{ id: "t2", transferId: "x1", tipo: "receita", valor: 300 }],
    };
    const violacoes = validarInvariantesFinanceiros(payload);
    expect(violacoes.some((v) => v.tipo === "transferencia_incompleta")).toBe(true);
  });
});

describe("faturas", () => {
  const cards = [{ id: "c1", nome: "Cartão", vencimento: 10 }];

  it("ignora faturas ainda abertas", () => {
    const payload = {
      cards,
      trans: [],
      faturas: [{ id: "inv1", cardId: "c1", competenceMonth: "2026-08", status: "aberta", finalAmount: 999 }],
    };
    expect(validarInvariantesFinanceiros(payload)).toEqual([]);
  });

  it("acusa fatura fechada cujo finalAmount não bate com o total recalculado das despesas", () => {
    const payload = {
      cards,
      trans: [
        { id: "d1", cartaoId: "c1", origem: "cartao", competencia: "2026-08", tipo: "despesa", valor: 300, natureza: "despesa" },
        { id: "d2", cartaoId: "c1", origem: "cartao", competencia: "2026-08", tipo: "despesa", valor: 300, natureza: "despesa" },
        { id: "d3", cartaoId: "c1", origem: "cartao", competencia: "2026-08", tipo: "despesa", valor: 300, natureza: "despesa" },
      ],
      faturas: [{ id: "inv1", cardId: "c1", competenceMonth: "2026-08", status: "fechada", finalAmount: 1000 }],
    };
    const violacoes = validarInvariantesFinanceiros(payload);
    expect(violacoes.some((v) => v.tipo === "fatura_total_incoerente")).toBe(true);
  });
});

describe("cofrinhos", () => {
  it("acusa saldo negativo após retiradas concorrentes somadas", () => {
    const payload = {
      cofrinhos: [
        {
          id: "cof1",
          aportes: [
            { id: "a1", valor: 1000, tipo: "aporte" },
            { id: "a2", valor: 700, tipo: "retirada" },
            { id: "a3", valor: 600, tipo: "retirada" },
          ],
        },
      ],
    };
    const violacoes = validarInvariantesFinanceiros(payload);
    expect(violacoes.some((v) => v.tipo === "cofrinho_saldo_negativo")).toBe(true);
  });

  it("aceita saldo não-negativo", () => {
    const payload = {
      cofrinhos: [{ id: "cof1", aportes: [{ id: "a1", valor: 1000, tipo: "aporte" }, { id: "a2", valor: 400, tipo: "retirada" }] }],
    };
    expect(validarInvariantesFinanceiros(payload)).toEqual([]);
  });
});

describe("dívidas", () => {
  it("acusa status desatualizado quando a soma de amortizações já quita o total", () => {
    const payload = {
      dividas: [{ id: "d1", total: 1000, status: "aberta", amortizacoes: [{ id: "a1", valor: 600 }, { id: "a2", valor: 400 }] }],
    };
    const violacoes = validarInvariantesFinanceiros(payload);
    expect(violacoes.some((v) => v.tipo === "divida_status_desatualizado")).toBe(true);
  });

  it("acusa status quitada sem soma de amortizações suficiente", () => {
    const payload = {
      dividas: [{ id: "d1", total: 1000, status: "quitada", amortizacoes: [{ id: "a1", valor: 300 }] }],
    };
    const violacoes = validarInvariantesFinanceiros(payload);
    expect(violacoes.some((v) => v.tipo === "divida_status_inconsistente")).toBe(true);
  });

  it("aceita status coerente com a soma de amortizações", () => {
    const payload = {
      dividas: [{ id: "d1", total: 1000, status: "quitada", amortizacoes: [{ id: "a1", valor: 1000 }] }],
    };
    expect(validarInvariantesFinanceiros(payload)).toEqual([]);
  });
});
