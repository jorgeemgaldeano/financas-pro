// accountingService.test.js — v0.3.33
import { describe, it, expect } from "vitest";
import {
  isMovimentoContabil,
  isReceitaContabil,
  isDespesaContabil,
  somaReceitas,
  somaDespesas,
} from "../src/services/accountingService.js";

// Amostra representativa: receitas/despesas normais, fatura de cartão e um par
// de transferência (natureza "transferencia").
const base = [
  { id: "r1", tipo: "receita", valor: 1000 },
  { id: "r2", tipo: "receita", valor: 250 },
  { id: "d1", tipo: "despesa", valor: 400 },
  { id: "d2", tipo: "despesa", valor: 100, natureza: "fatura_cartao" },
  { id: "d3", tipo: "despesa", valor: 50, natureza: "ajuste_fatura_cartao" },
];

describe("isMovimentoContabil", () => {
  it("aceita lançamentos normais e de cartão", () => {
    expect(isMovimentoContabil({ tipo: "receita", valor: 1 })).toBe(true);
    expect(isMovimentoContabil({ natureza: "fatura_cartao" })).toBe(true);
    expect(isMovimentoContabil({ natureza: "ajuste_fatura_cartao" })).toBe(true);
  });
  it("exclui transferência", () => {
    expect(isMovimentoContabil({ natureza: "transferencia" })).toBe(false);
  });
  it("é robusto a nulos", () => {
    expect(isMovimentoContabil(null)).toBe(false);
    expect(isMovimentoContabil(undefined)).toBe(false);
  });
});

describe("caracterização — sem transferências o comportamento não muda", () => {
  it("somaReceitas soma todas as receitas", () => {
    expect(somaReceitas(base)).toBe(1250);
  });
  it("somaDespesas soma todas as despesas (inclui cartão)", () => {
    expect(somaDespesas(base)).toBe(550);
  });
});

describe("com transferências as pernas são excluídas de receita/despesa", () => {
  const comTransfer = [
    ...base,
    { id: "tf-out", tipo: "despesa", valor: 300, natureza: "transferencia", transferId: "tf1" },
    { id: "tf-in", tipo: "receita", valor: 300, natureza: "transferencia", transferId: "tf1" },
  ];
  it("não contam como receita", () => {
    expect(somaReceitas(comTransfer)).toBe(1250);
    expect(isReceitaContabil({ tipo: "receita", natureza: "transferencia" })).toBe(false);
  });
  it("não contam como despesa", () => {
    expect(somaDespesas(comTransfer)).toBe(550);
    expect(isDespesaContabil({ tipo: "despesa", natureza: "transferencia" })).toBe(false);
  });
});

describe("somaReceitas/somaDespesas com extrator de valor", () => {
  const lista = [
    { id: "a", tipo: "receita", valor: 100, realizado: 80 },
    { id: "b", tipo: "receita", valor: 100, realizado: 0 },
    { id: "c", tipo: "despesa", valor: 100, realizado: 100 },
  ];
  const realizado = (t) => t.realizado;
  it("usa o extrator informado", () => {
    expect(somaReceitas(lista, realizado)).toBe(80);
    expect(somaDespesas(lista, realizado)).toBe(100);
  });
  it("é robusto a listas vazias/nulas", () => {
    expect(somaReceitas(null)).toBe(0);
    expect(somaDespesas(undefined)).toBe(0);
    expect(somaReceitas([])).toBe(0);
  });
});
