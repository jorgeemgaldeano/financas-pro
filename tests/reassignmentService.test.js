// reassignmentService.test.js — v0.3.32
import { describe, it, expect } from "vitest";
import {
  moveCardTransactions,
  moveAccountTransactions,
  recategorizeCategory,
} from "../src/services/reassignmentService.js";

// Cartões com dias de fechamento diferentes, para exercitar o recalc RN012.
const cards = [
  { id: "cardA", nome: "A", fechamento: 5 },
  { id: "cardB", nome: "B", fechamento: 20 },
];

describe("moveCardTransactions", () => {
  it("move compras do cartão A para B recalculando a competência pelo ciclo do destino", () => {
    // Compra dia 10/03: no cartão A (fecha dia 5) cairia em abril; no B (fecha dia 20) cai em março.
    const trans = [
      { id: "t1", origem: "cartao", cartaoId: "cardA", data: "2026-03-10", competencia: "2026-04", valor: 100, tipo: "despesa" },
      { id: "t2", origem: "corrente", contaId: "cc1", data: "2026-03-10", valor: 50, tipo: "despesa" },
    ];
    const res = moveCardTransactions({ trans, cards }, { fromCardId: "cardA", toCardId: "cardB" });
    expect(res.ok).toBe(true);
    expect(res.moved).toBe(1);
    const moved = res.trans.find((t) => t.id === "t1");
    expect(moved.cartaoId).toBe("cardB");
    expect(moved.cardId).toBe("cardB");
    expect(moved.competencia).toBe("2026-03"); // recalculado pelo fechamento 20 do B
    expect(moved.competenceMonth).toBe("2026-03");
    // Lançamento de conta corrente não é tocado.
    expect(res.trans.find((t) => t.id === "t2").contaId).toBe("cc1");
  });

  it("não move a transação de pagamento de fatura (origem corrente)", () => {
    const trans = [
      { id: "pag", origem: "corrente", cartaoId: "cardA", natureza: "fatura_cartao", data: "2026-03-15", valor: 300, tipo: "despesa" },
    ];
    const res = moveCardTransactions({ trans, cards }, { fromCardId: "cardA", toCardId: "cardB" });
    expect(res.ok).toBe(true);
    expect(res.moved).toBe(0);
    expect(res.trans.find((t) => t.id === "pag").cartaoId).toBe("cardA");
  });

  it("bloqueia se o cartão de origem tem fatura fechada", () => {
    const trans = [{ id: "t1", origem: "cartao", cartaoId: "cardA", data: "2026-03-10", valor: 100, tipo: "despesa" }];
    const faturas = [{ id: "inv_cardA_2026-03", cardId: "cardA", competenceMonth: "2026-03", status: "fechada" }];
    const res = moveCardTransactions({ trans, faturas, cards }, { fromCardId: "cardA", toCardId: "cardB" });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("source_invoice_closed");
  });

  it("bloqueia se a competência de destino cai numa fatura fechada do cartão B", () => {
    const trans = [{ id: "t1", origem: "cartao", cartaoId: "cardA", data: "2026-03-10", competencia: "2026-04", valor: 100, tipo: "despesa" }];
    // No B a compra de 10/03 cai em 2026-03; marcamos essa fatura do B como paga.
    const faturas = [{ id: "inv_cardB_2026-03", cardId: "cardB", competenceMonth: "2026-03", status: "paga" }];
    const res = moveCardTransactions({ trans, faturas, cards }, { fromCardId: "cardA", toCardId: "cardB" });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("dest_invoice_closed");
    expect(res.blockedMonths).toContain("2026-03");
  });

  it("repontam despesas compartilhadas e simulações e descarta faturas abertas da origem", () => {
    const trans = [{ id: "t1", origem: "cartao", cartaoId: "cardA", data: "2026-03-10", valor: 100, tipo: "despesa" }];
    const faturas = [{ id: "inv_cardA_2026-03", cardId: "cardA", competenceMonth: "2026-03", status: "aberta" }];
    const despPess = [{ id: "d1", cartaoId: "cardA", valor: 20 }, { id: "d2", cartaoId: "cardB", valor: 30 }];
    const sims = [{ id: "s1", cartaoId: "cardA" }];
    const res = moveCardTransactions({ trans, faturas, despPess, sims, cards }, { fromCardId: "cardA", toCardId: "cardB" });
    expect(res.ok).toBe(true);
    expect(res.despPess.find((d) => d.id === "d1").cartaoId).toBe("cardB");
    expect(res.despPess.find((d) => d.id === "d2").cartaoId).toBe("cardB");
    expect(res.sims.find((s) => s.id === "s1").cartaoId).toBe("cardB");
    expect(res.faturas.some((f) => f.cardId === "cardA")).toBe(false);
  });

  it("rejeita mover para o mesmo cartão ou para cartão inexistente", () => {
    expect(moveCardTransactions({ trans: [], cards }, { fromCardId: "cardA", toCardId: "cardA" }).reason).toBe("same_card");
    expect(moveCardTransactions({ trans: [], cards }, { fromCardId: "cardA", toCardId: "zzz" }).reason).toBe("card_not_found");
  });

  it("não muta o estado de entrada (função pura)", () => {
    const trans = [{ id: "t1", origem: "cartao", cartaoId: "cardA", data: "2026-03-10", valor: 100, tipo: "despesa" }];
    const snapshot = JSON.parse(JSON.stringify(trans));
    moveCardTransactions({ trans, cards }, { fromCardId: "cardA", toCardId: "cardB" });
    expect(trans).toEqual(snapshot);
  });
});

describe("moveAccountTransactions", () => {
  const contas = [{ id: "cc1" }, { id: "cc2" }];

  it("move lançamentos e reponta cartões e faturas para a conta destino", () => {
    const trans = [
      { id: "t1", contaId: "cc1", valor: 100 },
      { id: "t2", contaId: "cc2", valor: 50 },
    ];
    const cards = [{ id: "cardA", contaPagamentoId: "cc1", accountId: "cc1" }];
    const faturas = [{ id: "inv1", accountId: "cc1", contaPagamentoId: "cc1" }];
    const res = moveAccountTransactions({ trans, cards, faturas, contas }, { fromAccountId: "cc1", toAccountId: "cc2" });
    expect(res.ok).toBe(true);
    expect(res.moved).toBe(1);
    expect(res.trans.find((t) => t.id === "t1").contaId).toBe("cc2");
    expect(res.trans.find((t) => t.id === "t1").accountId).toBe("cc2");
    expect(res.cards[0].contaPagamentoId).toBe("cc2");
    expect(res.faturas[0].accountId).toBe("cc2");
    expect(res.faturas[0].contaPagamentoId).toBe("cc2");
  });

  it("rejeita mesma conta e conta inexistente", () => {
    expect(moveAccountTransactions({ trans: [], contas }, { fromAccountId: "cc1", toAccountId: "cc1" }).reason).toBe("same_account");
    expect(moveAccountTransactions({ trans: [], contas }, { fromAccountId: "cc1", toAccountId: "zzz" }).reason).toBe("account_not_found");
  });
});

describe("recategorizeCategory", () => {
  it("move catId de lançamentos e despesas compartilhadas, incluindo descendentes", () => {
    const trans = [
      { id: "t1", catId: "catPai" },
      { id: "t2", catId: "catFilho" },
      { id: "t3", catId: "outra" },
    ];
    const despPess = [{ id: "d1", catId: "catFilho" }];
    const res = recategorizeCategory({ trans, despPess }, { fromCatIds: new Set(["catPai", "catFilho"]), toCatId: "destino" });
    expect(res.ok).toBe(true);
    expect(res.moved).toBe(3);
    expect(res.trans.find((t) => t.id === "t1").catId).toBe("destino");
    expect(res.trans.find((t) => t.id === "t2").catId).toBe("destino");
    expect(res.trans.find((t) => t.id === "t3").catId).toBe("outra");
    expect(res.despPess[0].catId).toBe("destino");
  });

  it("aceita array além de Set em fromCatIds", () => {
    const res = recategorizeCategory({ trans: [{ id: "t1", catId: "a" }] }, { fromCatIds: ["a"], toCatId: "b" });
    expect(res.trans[0].catId).toBe("b");
  });

  it("rejeita destino dentro da própria origem e origem/destino vazios", () => {
    expect(recategorizeCategory({ trans: [] }, { fromCatIds: ["a"], toCatId: "a" }).reason).toBe("same_category");
    expect(recategorizeCategory({ trans: [] }, { fromCatIds: [], toCatId: "b" }).reason).toBe("no_source");
    expect(recategorizeCategory({ trans: [] }, { fromCatIds: ["a"] }).reason).toBe("no_target");
  });
});
