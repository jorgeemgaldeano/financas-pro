// simulationService.test.js — v0.3.37 (Fase 4, DEC-0038)
// Extração pura de App.jsx (sem mudança de comportamento) — testes escritos
// no momento da extração para dar cobertura a uma lógica que não tinha
// nenhuma antes.
import { describe, it, expect } from "vitest";
import {
  safeMoneyAmount,
  normalizeSimulationInstallments,
  getSimulationInstallmentValue,
  expandSim,
} from "../src/services/simulationService.js";

describe("safeMoneyAmount", () => {
  it("aceita número finito diretamente", () => {
    expect(safeMoneyAmount(150.5)).toBe(150.5);
  });
  it("trata string monetária BR via moneyToNumber", () => {
    expect(safeMoneyAmount("1.234,56")).toBe(1234.56);
  });
  it("trata NaN/Infinity/vazio como 0", () => {
    expect(safeMoneyAmount(NaN)).toBe(0);
    expect(safeMoneyAmount(Infinity)).toBe(0);
    expect(safeMoneyAmount("")).toBe(0);
  });
});

describe("normalizeSimulationInstallments", () => {
  it("aceita inteiro positivo", () => {
    expect(normalizeSimulationInstallments(12)).toBe(12);
  });
  it("cai para 1 em valores inválidos (0, negativo, não numérico)", () => {
    expect(normalizeSimulationInstallments(0)).toBe(1);
    expect(normalizeSimulationInstallments(-3)).toBe(1);
    expect(normalizeSimulationInstallments("abc")).toBe(1);
    expect(normalizeSimulationInstallments(undefined)).toBe(1);
  });
});

describe("getSimulationInstallmentValue", () => {
  it("modo 'total': divide o valor total pelas parcelas", () => {
    const sim = { valor: 1200, parcelas: 12, modoParc: "total" };
    expect(getSimulationInstallmentValue(sim)).toBe(100);
  });
  it("modo 'parcela': usa o valor informado como já sendo o da parcela", () => {
    const sim = { valor: 250, parcelas: 6, modoParc: "parcela" };
    expect(getSimulationInstallmentValue(sim)).toBe(250);
  });
  it("arredonda para 2 casas decimais", () => {
    const sim = { valor: 1000, parcelas: 3, modoParc: "total" };
    expect(getSimulationInstallmentValue(sim)).toBe(333.33);
  });
});

describe("expandSim", () => {
  const cards = [{ id: "c1", nome: "Nubank" }];

  it("retorna array vazio sem data", () => {
    expect(expandSim({ cartaoId: "c1", parcelas: 3 }, cards, [])).toEqual([]);
  });

  it("expande em N parcelas com valor/data/competência corretos, marcadas como simul:true", () => {
    const sim = { id: "sim1", data: "2026-08-10", parcelas: 3, valor: 300, modoParc: "total", cartaoId: "c1", catId: "cat1", descricao: "Notebook", faturaCompetencia: "2026-08" };
    const rows = expandSim(sim, cards, []);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ id: "sim1_0", simId: "sim1", tipo: "despesa", origem: "cartao", parcela: 1, totalParcelas: 3, simul: true, competencia: "2026-08" });
    expect(rows[0].valor).toBe(100);
    expect(rows[1].competencia).toBe("2026-09");
    expect(rows[2].competencia).toBe("2026-10");
    expect(rows[1].data).toBe("2026-09-10");
  });

  it("usa min. 1 parcela mesmo com parcelas inválidas", () => {
    const sim = { id: "sim2", data: "2026-08-10", parcelas: 0, valor: 50, cartaoId: "c1", faturaCompetencia: "2026-08" };
    expect(expandSim(sim, cards, [])).toHaveLength(1);
  });
});
