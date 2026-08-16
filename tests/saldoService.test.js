// saldoService.test.js — v0.3.35 (DEC-0036 / E4)
//
// Testes de caracterização: a referência (`legacyGetSaldoInicialConta`) é
// uma cópia fiel da recursão original de App.jsx (pré-extração), incluindo
// o corte de profundidade em 72. O resolver novo (O(N + C×M)) precisa
// produzir exatamente o mesmo valor para qualquer conta/mês, com ou sem
// saldo inicial manual quebrando a cadeia.
import { describe, it, expect } from "vitest";
import { monthCompare, monthOffset } from "../src/utils/dateUtils.js";
import {
  transMonthKey,
  valorRealizado,
  buildMovimentoIndex,
  movimentoContaMesFromIndex,
  createSaldoInicialResolver,
} from "../src/services/saldoService.js";

// ── Oráculo: réplica da implementação original (App.jsx pré-v0.3.35) ─────
function legacyMovimentoContaMes(trans, ct, monthKey) {
  return trans
    .filter((t) => transMonthKey(t) === monthKey && t.contaId === ct.id && t.origem !== "cartao")
    .reduce((sum, t) => {
      const v = valorRealizado(t);
      return sum + (t.tipo === "receita" ? v : -v);
    }, 0);
}

function legacyGetSaldoInicialConta(trans, saldosIniciais, baseSaldoMonth, ct, monthKey, depth = 0) {
  const manual = saldosIniciais?.[monthKey]?.[ct.id];
  if (manual !== undefined && manual !== null && manual !== "") return Number(manual) || 0;
  if (monthCompare(monthKey, baseSaldoMonth) <= 0 || depth > 72) return Number(ct.saldoInicial) || 0;
  const prevKey = monthOffset(monthKey, -1);
  return (
    legacyGetSaldoInicialConta(trans, saldosIniciais, baseSaldoMonth, ct, prevKey, depth + 1) +
    legacyMovimentoContaMes(trans, ct, prevKey)
  );
}

const contas = [
  { id: "cc1", nome: "Conta A", saldoInicial: 1000 },
  { id: "cc2", nome: "Conta B", saldoInicial: -200 },
];

let seq = 0;
const t = (over) => ({ id: `t${++seq}`, tipo: "despesa", origem: "corrente", status: "pago", ...over });

const trans = [
  t({ contaId: "cc1", tipo: "receita", valor: 500, competencia: "2026-03" }),
  t({ contaId: "cc1", tipo: "despesa", valor: 100, competencia: "2026-03" }),
  t({ contaId: "cc1", tipo: "despesa", valor: 50, competencia: "2026-04" }),
  t({ contaId: "cc1", tipo: "receita", valor: 900, competencia: "2026-05" }),
  t({ contaId: "cc1", tipo: "despesa", valor: 300, competencia: "2026-06", status: "previsto" }), // não conta
  t({ contaId: "cc1", tipo: "despesa", valor: 200, competencia: "2026-06", status: "parcial", valorPago: 80 }),
  t({ contaId: "cc2", tipo: "receita", valor: 400, competencia: "2026-04" }),
  t({ contaId: "cc1", tipo: "despesa", valor: 999, competencia: "2026-04", origem: "cartao" }), // ignorado (cartão)
];

const baseSaldoMonth = "2026-03";
const meses = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-12"];

describe("buildMovimentoIndex", () => {
  it("bate com o filtro/reduce ingênuo para toda conta+mês", () => {
    const index = buildMovimentoIndex(trans);
    for (const ct of contas) {
      for (const mes of meses) {
        expect(movimentoContaMesFromIndex(index, ct.id, mes)).toBe(legacyMovimentoContaMes(trans, ct, mes));
      }
    }
  });

  it("ignora lançamentos de origem cartão e respeita status previsto/parcial", () => {
    const index = buildMovimentoIndex(trans);
    // 2026-04: só a receita de 400 (cc2) conta; a despesa de cartão (cc1) é ignorada.
    expect(movimentoContaMesFromIndex(index, "cc1", "2026-04")).toBe(-50);
    expect(movimentoContaMesFromIndex(index, "cc2", "2026-04")).toBe(400);
    // 2026-06: previsto (300) não conta; parcial conta só o valorPago (80).
    expect(movimentoContaMesFromIndex(index, "cc1", "2026-06")).toBe(-80);
  });
});

describe("createSaldoInicialResolver — caracterização vs. recursão original", () => {
  it("sem overrides manuais: bate com o oráculo para toda conta+mês testado", () => {
    const { getSaldoInicialConta } = createSaldoInicialResolver(trans, {}, baseSaldoMonth);
    for (const ct of contas) {
      for (const mes of meses) {
        expect(getSaldoInicialConta(ct, mes)).toBe(
          legacyGetSaldoInicialConta(trans, {}, baseSaldoMonth, ct, mes)
        );
      }
    }
  });

  it("com override manual quebrando a cadeia: bate com o oráculo", () => {
    const saldosIniciais = { "2026-05": { cc1: 5000 } };
    const { getSaldoInicialConta } = createSaldoInicialResolver(trans, saldosIniciais, baseSaldoMonth);
    for (const mes of meses) {
      expect(getSaldoInicialConta(contas[0], mes)).toBe(
        legacyGetSaldoInicialConta(trans, saldosIniciais, baseSaldoMonth, contas[0], mes)
      );
    }
  });

  it("com múltiplos overrides manuais em contas diferentes: bate com o oráculo", () => {
    const saldosIniciais = { "2026-04": { cc2: 999 }, "2026-06": { cc1: -50 } };
    const { getSaldoInicialConta } = createSaldoInicialResolver(trans, saldosIniciais, baseSaldoMonth);
    for (const ct of contas) {
      for (const mes of meses) {
        expect(getSaldoInicialConta(ct, mes)).toBe(
          legacyGetSaldoInicialConta(trans, saldosIniciais, baseSaldoMonth, ct, mes)
        );
      }
    }
  });

  it("mês igual ou anterior ao baseSaldoMonth retorna o saldoInicial da conta", () => {
    const { getSaldoInicialConta } = createSaldoInicialResolver(trans, {}, baseSaldoMonth);
    expect(getSaldoInicialConta(contas[0], "2026-03")).toBe(1000);
    expect(getSaldoInicialConta(contas[0], "2026-01")).toBe(1000);
    expect(getSaldoInicialConta(contas[1], "2026-02")).toBe(-200);
  });

  it("propaga corretamente vários meses à frente (encadeamento de movimento)", () => {
    const { getSaldoInicialConta } = createSaldoInicialResolver(trans, {}, baseSaldoMonth);
    // cc1: saldoInicial(mar)=1000; mar: +500-100=+400 -> abr=1400; abr: -50 -> mai=1350; mai: +900 -> jun=2250
    expect(getSaldoInicialConta(contas[0], "2026-04")).toBe(1400);
    expect(getSaldoInicialConta(contas[0], "2026-05")).toBe(1350);
    expect(getSaldoInicialConta(contas[0], "2026-06")).toBe(2250);
  });

  it("consultas repetidas do mesmo mês retornam o mesmo valor (cache)", () => {
    const { getSaldoInicialConta } = createSaldoInicialResolver(trans, {}, baseSaldoMonth);
    const first = getSaldoInicialConta(contas[0], "2026-06");
    const second = getSaldoInicialConta(contas[0], "2026-06");
    expect(second).toBe(first);
  });

  it("resolver não muta o array de trans nem o objeto saldosIniciais de entrada", () => {
    const saldosIniciais = { "2026-05": { cc1: 5000 } };
    const transCopy = JSON.parse(JSON.stringify(trans));
    const saldosCopy = JSON.parse(JSON.stringify(saldosIniciais));
    const { getSaldoInicialConta } = createSaldoInicialResolver(trans, saldosIniciais, baseSaldoMonth);
    getSaldoInicialConta(contas[0], "2026-12");
    expect(trans).toEqual(transCopy);
    expect(saldosIniciais).toEqual(saldosCopy);
  });
});
