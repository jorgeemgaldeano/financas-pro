import { describe, it, expect } from "vitest";
import {
  computeCardInvoice,
  closeInvoice,
  reopenInvoice,
  addInvoiceAdjustment,
  assertInvoiceOpenForEntry,
} from "../src/services/cardInvoiceOperations.js";

// ── Fixtures ─────────────────────────────────────────────────────────────────
const NOW = "2026-01-15T12:00:00.000Z";
let seq = 0;
const uid = () => `uid-${++seq}`;

function baseState() {
  seq = 0;
  return {
    cards: [{ id: "card1", nome: "Nubank", vencimento: 10, contaPagamentoId: "cc1", accountId: "cc1" }],
    contas: [{ id: "cc1", tipo: "corrente", nome: "Conta" }],
    faturas: [],
    trans: [
      { id: "t1", cartaoId: "card1", origem: "cartao", competencia: "2026-01", tipo: "despesa", valor: 100 },
      { id: "t2", cartaoId: "card1", origem: "cartao", competencia: "2026-01", tipo: "despesa", valor: 50 },
    ],
  };
}

// ── computeCardInvoice ───────────────────────────────────────────────────────
describe("computeCardInvoice", () => {
  it("soma itens de cartão do mês", () => {
    const s = baseState();
    const fat = computeCardInvoice(s.trans, s.cards[0], "2026-01");
    expect(fat.total).toBe(150);
    expect(fat.itens).toHaveLength(2);
    expect(fat.ajustes).toBe(0);
  });

  it("ignora itens de outro mês e de outro cartão", () => {
    const s = baseState();
    s.trans.push({ id: "t3", cartaoId: "card1", origem: "cartao", competencia: "2026-02", tipo: "despesa", valor: 999 });
    s.trans.push({ id: "t4", cartaoId: "cardX", origem: "cartao", competencia: "2026-01", tipo: "despesa", valor: 999 });
    expect(computeCardInvoice(s.trans, s.cards[0], "2026-01").total).toBe(150);
  });

  it("nunca retorna total negativo", () => {
    const s = baseState();
    s.trans = [{ id: "r", cartaoId: "card1", origem: "cartao", competencia: "2026-01", tipo: "receita", natureza: "ajuste_fatura_cartao", ajusteFaturaTipo: "reducao", valor: 500 }];
    expect(computeCardInvoice(s.trans, s.cards[0], "2026-01").total).toBe(0);
  });
});

// ── closeInvoice ─────────────────────────────────────────────────────────────
describe("closeInvoice", () => {
  it("cria transação de pagamento previsto E registro de fatura atomicamente", () => {
    const s = baseState();
    const res = closeInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    expect(res.ok).toBe(true);
    // transação de pagamento criada
    const pay = res.trans.find((t) => t.natureza === "fatura_cartao");
    expect(pay).toBeTruthy();
    expect(pay.valor).toBe(150);
    expect(pay.amount).toBe(150); // dual-write preservado
    expect(pay.contaId).toBe("cc1");
    expect(pay.accountId).toBe("cc1");
    expect(pay.competencia).toBe("2026-02"); // vence no mês seguinte
    expect(pay.data).toBe("2026-02-10"); // dia de vencimento
    expect(pay.status).toBe("previsto");
    // registro de fatura criado
    expect(res.faturas).toHaveLength(1);
    const inv = res.faturas[0];
    expect(inv.finalAmount).toBe(150);
    expect(inv.status).toBe("fechada");
    expect(inv.paymentTransactionId).toBe(pay.id);
    expect(inv.closureType).toBe("manual");
  });

  it("não altera o array original (imutabilidade)", () => {
    const s = baseState();
    const originalLen = s.trans.length;
    closeInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    expect(s.trans).toHaveLength(originalLen);
    expect(s.faturas).toHaveLength(0);
  });

  it("bloqueia fatura sem valor", () => {
    const s = baseState();
    s.trans = [];
    const res = closeInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("no_amount");
  });

  it("exige confirmação quando já existe pagamento previsto", () => {
    const s = baseState();
    const first = closeInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    const s2 = { ...s, trans: first.trans, faturas: first.faturas };
    // segunda tentativa sem confirmar
    const res = closeInvoice(s2, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("needs_confirm_update");
    expect(res.requiresConfirm).toBe(true);
  });

  it("atualiza pagamento existente preservando baixas quando confirmado", () => {
    const s = baseState();
    const first = closeInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    // simula baixa parcial de 50
    const paidTrans = first.trans.map((t) =>
      t.natureza === "fatura_cartao" ? { ...t, valorPago: 50, paidAmount: 50 } : t
    );
    // adiciona novo gasto → fatura sobe para 200
    const s2 = {
      ...s,
      trans: [...paidTrans, { id: "t9", cartaoId: "card1", origem: "cartao", competencia: "2026-01", tipo: "despesa", valor: 50 }],
      faturas: first.faturas,
    };
    const res = closeInvoice(s2, { cardId: "card1", monthKey: "2026-01", uid, now: NOW, confirmUpdateExisting: true });
    expect(res.ok).toBe(true);
    const pay = res.trans.find((t) => t.natureza === "fatura_cartao");
    expect(pay.valor).toBe(200);
    expect(pay.valorPago).toBe(50); // baixa preservada
    expect(pay.pendingAmount).toBe(150);
    // não duplicou a transação de pagamento
    expect(res.trans.filter((t) => t.natureza === "fatura_cartao")).toHaveLength(1);
  });

  it("card sem conta usa fallback cc1 (comportamento preservado da v0.3.26.6)", () => {
    const s = baseState();
    s.cards = [{ id: "card1", nome: "X", vencimento: 10 }];
    s.contas = [];
    const res = closeInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    expect(res.ok).toBe(true);
    expect(res.trans.find((t) => t.natureza === "fatura_cartao").contaId).toBe("cc1");
  });
});

// ── reopenInvoice ────────────────────────────────────────────────────────────
describe("reopenInvoice", () => {
  it("marca fatura como aberta e ressincroniza o pagamento", () => {
    const s = baseState();
    const closed = closeInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    const s2 = { ...s, trans: closed.trans, faturas: closed.faturas };
    const res = reopenInvoice(s2, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    expect(res.ok).toBe(true);
    expect(res.faturas[0].status).toBe("aberta");
    expect(res.faturas[0].fechamentoTipo).toBe("reaberta");
  });

  it("não cria transação de pagamento se não existia", () => {
    const s = baseState();
    const res = reopenInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    expect(res.ok).toBe(true);
    expect(res.trans.filter((t) => t.natureza === "fatura_cartao")).toHaveLength(0);
  });
});

// ── addInvoiceAdjustment ─────────────────────────────────────────────────────
describe("addInvoiceAdjustment", () => {
  it("acréscimo entra como despesa de ajuste", () => {
    const s = baseState();
    const res = addInvoiceAdjustment(s, {
      cardId: "card1", monthKey: "2026-01", tipoAjuste: "acrescimo",
      valor: 30, descricao: "Anuidade", uid, now: NOW, day: 15, todayKey: "2025-12-01",
    });
    expect(res.ok).toBe(true);
    const aj = res.trans.find((t) => t.natureza === "ajuste_fatura_cartao");
    expect(aj.tipo).toBe("despesa");
    expect(aj.valor).toBe(30);
    expect(aj.competencia).toBe("2026-01");
    expect(aj.data).toBe("2026-01-15");
    // ajuste entra no cálculo da fatura
    expect(computeCardInvoice(res.trans, s.cards[0], "2026-01").total).toBe(180);
  });

  it("redução entra como receita de ajuste", () => {
    const s = baseState();
    const res = addInvoiceAdjustment(s, {
      cardId: "card1", monthKey: "2026-01", tipoAjuste: "reducao",
      valor: 20, descricao: "Estorno", uid, now: NOW, day: 15, todayKey: "2025-12-01",
    });
    expect(res.trans.find((t) => t.natureza === "ajuste_fatura_cartao").tipo).toBe("receita");
    expect(computeCardInvoice(res.trans, s.cards[0], "2026-01").total).toBe(130);
  });

  it("bloqueia ajuste em fatura fechada", () => {
    const s = baseState();
    const closed = closeInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    const s2 = { ...s, trans: closed.trans, faturas: closed.faturas };
    const res = addInvoiceAdjustment(s2, {
      cardId: "card1", monthKey: "2026-01", tipoAjuste: "acrescimo",
      valor: 30, descricao: "X", uid, now: NOW, day: 15,
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("invoice_closed");
  });

  it("rejeita valor inválido e descrição vazia", () => {
    const s = baseState();
    expect(addInvoiceAdjustment(s, { cardId: "card1", monthKey: "2026-01", tipoAjuste: "acrescimo", valor: 0, descricao: "x", uid, now: NOW, todayKey: "2025-12-01" }).reason).toBe("invalid_amount");
    expect(addInvoiceAdjustment(s, { cardId: "card1", monthKey: "2026-01", tipoAjuste: "acrescimo", valor: 10, descricao: "  ", uid, now: NOW, todayKey: "2025-12-01" }).reason).toBe("missing_description");
  });
});

// ── assertInvoiceOpenForEntry ────────────────────────────────────────────────
describe("assertInvoiceOpenForEntry", () => {
  it("não bloqueia quando fatura está aberta/inexistente", () => {
    const s = baseState();
    expect(assertInvoiceOpenForEntry(s.faturas, s.cards[0], "2026-01", "2025-12-01").blocked).toBe(false);
  });

  it("bloqueia quando fatura está fechada", () => {
    const s = baseState();
    const closed = closeInvoice(s, { cardId: "card1", monthKey: "2026-01", uid, now: NOW });
    expect(assertInvoiceOpenForEntry(closed.faturas, s.cards[0], "2026-01").blocked).toBe(true);
  });
});
