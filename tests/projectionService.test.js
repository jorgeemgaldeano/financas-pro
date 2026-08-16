// projectionService.test.js — v0.3.33 (Fase 1 — DEC-0034 / RN031)
//
// Primeiro arquivo de teste para projectionService.js. Cobre o comportamento
// já existente (receita/despesa realizadas, exclusão de fatura_cartao) como
// caracterização, e a exclusão nova de natureza:"transferencia" (RN031),
// escrita ANTES de alterar o filtro em projectionService.js.
import { describe, it, expect } from "vitest";
import { buildRealCashFlowProjection } from "../src/services/projectionService.js";

function projectSingleMonth(transactions) {
  const [month] = buildRealCashFlowProjection({
    transactions,
    selectedMonth: "2026-08",
    numberOfMonths: 1,
    getInitialBalanceForMonth: () => 0,
  });
  return month;
}

describe("buildRealCashFlowProjection — caracterização do comportamento existente", () => {
  it("soma receita e despesa de conta corrente realizadas no mês", () => {
    const month = projectSingleMonth([
      { id: "r1", tipo: "receita", origem: "corrente", valor: 1000, status: "pago", data: "2026-08-05" },
      { id: "d1", tipo: "despesa", origem: "corrente", valor: 300, status: "pago", data: "2026-08-06" },
    ]);
    expect(month.receitas).toBe(1000);
    expect(month.despesas).toBe(300);
    expect(month.saldoProjetado).toBe(700);
  });

  it("exclui pagamento de fatura (natureza:fatura_cartao) do total de despesas", () => {
    const month = projectSingleMonth([
      { id: "pag", tipo: "despesa", origem: "corrente", natureza: "fatura_cartao", valor: 500, status: "pago", data: "2026-08-10" },
    ]);
    expect(month.despesas).toBe(0);
  });

  it("exclui lançamentos de origem cartão dos totais de receita/despesa (entram como fatura)", () => {
    const month = projectSingleMonth([
      { id: "c1", tipo: "despesa", origem: "cartao", cartaoId: "card1", valor: 200, status: "pago", data: "2026-08-10" },
    ]);
    expect(month.despesas).toBe(0);
  });
});

describe("buildRealCashFlowProjection — exclusão de transferência (RN031)", () => {
  it("exclui as duas pernas de uma transferência dos totais de receita e despesa", () => {
    const month = projectSingleMonth([
      { id: "t_out", tipo: "despesa", origem: "corrente", natureza: "transferencia", transferId: "tr1", contaId: "cc1", valor: 400, status: "pago", data: "2026-08-12" },
      { id: "t_in", tipo: "receita", origem: "corrente", natureza: "transferencia", transferId: "tr1", contaId: "cc2", valor: 400, status: "pago", data: "2026-08-12" },
      { id: "r1", tipo: "receita", origem: "corrente", valor: 1000, status: "pago", data: "2026-08-05" },
      { id: "d1", tipo: "despesa", origem: "corrente", valor: 300, status: "pago", data: "2026-08-06" },
    ]);
    // Só a receita/despesa comuns contam — a transferência de 400 não aparece nem como receita nem como despesa.
    expect(month.receitas).toBe(1000);
    expect(month.despesas).toBe(300);
    expect(month.detalhes.receitas.some(d => d.id === "t_in")).toBe(false);
    expect(month.detalhes.despesas.some(d => d.id === "t_out")).toBe(false);
  });

  it("uma transferência isolada não altera nenhum total do mês", () => {
    const semTransferencia = projectSingleMonth([]);
    const comTransferencia = projectSingleMonth([
      { id: "t_out", tipo: "despesa", origem: "corrente", natureza: "transferencia", transferId: "tr1", contaId: "cc1", valor: 999, status: "pago", data: "2026-08-12" },
      { id: "t_in", tipo: "receita", origem: "corrente", natureza: "transferencia", transferId: "tr1", contaId: "cc2", valor: 999, status: "pago", data: "2026-08-12" },
    ]);
    expect(comTransferencia.receitas).toBe(semTransferencia.receitas);
    expect(comTransferencia.despesas).toBe(semTransferencia.despesas);
    expect(comTransferencia.saldoProjetado).toBe(semTransferencia.saldoProjetado);
  });
});
