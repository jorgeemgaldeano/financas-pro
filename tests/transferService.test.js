// transferService.test.js — v0.3.33 (Fase 1 — DEC-0034 / RN031)
import { describe, it, expect } from "vitest";
import { createTransfer, deleteTransfer, isTransfer } from "../src/services/transferService.js";

const contas = [
  { id: "cc1", nome: "Conta A", tipo: "corrente" },
  { id: "cc2", nome: "Conta B", tipo: "corrente" },
];

let seq = 0;
const uid = () => `id${++seq}`;

describe("createTransfer", () => {
  it("cria duas pernas ligadas por transferId, com tipo/sinal corretos e natureza:transferencia", () => {
    const res = createTransfer(
      { trans: [], contas },
      { fromAccountId: "cc1", toAccountId: "cc2", valor: 150, data: "2026-08-10", descricao: "Reserva", uid }
    );
    expect(res.ok).toBe(true);
    expect(res.trans).toHaveLength(2);

    const saida = res.trans.find((t) => t.contaId === "cc1");
    const entrada = res.trans.find((t) => t.contaId === "cc2");

    expect(saida.tipo).toBe("despesa");
    expect(entrada.tipo).toBe("receita");
    expect(saida.natureza).toBe("transferencia");
    expect(entrada.natureza).toBe("transferencia");
    expect(saida.transferId).toBe(entrada.transferId);
    expect(saida.transferId).toBe(res.transferId);
    expect(saida.valor).toBe(150);
    expect(entrada.valor).toBe(150);
    expect(saida.catId).toBeNull();
    expect(entrada.catId).toBeNull();
    expect(saida.status).toBe("pago");
    expect(saida.valorPago).toBe(150);
    expect(saida.competencia).toBe("2026-08");
    expect(saida.origem).toBe("corrente");
  });

  it("usa descrição default quando não informada", () => {
    const res = createTransfer(
      { trans: [], contas },
      { fromAccountId: "cc1", toAccountId: "cc2", valor: 10, data: "2026-08-10", uid }
    );
    expect(res.trans[0].descricao).toBe("Transferência entre contas");
  });

  it("preserva transações existentes (não muta o estado de entrada)", () => {
    const trans = [{ id: "t0", tipo: "despesa", contaId: "cc1", valor: 5 }];
    const res = createTransfer({ trans, contas }, { fromAccountId: "cc1", toAccountId: "cc2", valor: 10, data: "2026-08-10", uid });
    expect(trans).toHaveLength(1); // input intocado
    expect(res.trans).toHaveLength(3);
    expect(res.trans[0]).toBe(trans[0]); // identidade referencial preservada
  });

  it("rejeita conta de origem/destino iguais", () => {
    const res = createTransfer({ trans: [], contas }, { fromAccountId: "cc1", toAccountId: "cc1", valor: 10, data: "2026-08-10", uid });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("same_account");
  });

  it("rejeita conta inexistente", () => {
    const res = createTransfer({ trans: [], contas }, { fromAccountId: "cc1", toAccountId: "zzz", valor: 10, data: "2026-08-10", uid });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("account_not_found");
  });

  it("rejeita valor zero ou negativo", () => {
    expect(createTransfer({ trans: [], contas }, { fromAccountId: "cc1", toAccountId: "cc2", valor: 0, data: "2026-08-10", uid }).reason).toBe("invalid_amount");
    expect(createTransfer({ trans: [], contas }, { fromAccountId: "cc1", toAccountId: "cc2", valor: -5, data: "2026-08-10", uid }).reason).toBe("invalid_amount");
  });

  it("rejeita data ausente", () => {
    const res = createTransfer({ trans: [], contas }, { fromAccountId: "cc1", toAccountId: "cc2", valor: 10, uid });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("missing_date");
  });
});

describe("deleteTransfer", () => {
  it("remove as duas pernas como uma unidade", () => {
    const created = createTransfer({ trans: [], contas }, { fromAccountId: "cc1", toAccountId: "cc2", valor: 10, data: "2026-08-10", uid });
    const outraTrans = { id: "t99", tipo: "despesa", contaId: "cc1", valor: 5 };
    const res = deleteTransfer({ trans: [...created.trans, outraTrans] }, { transferId: created.transferId });
    expect(res.ok).toBe(true);
    expect(res.removed).toBe(2);
    expect(res.trans).toHaveLength(1);
    expect(res.trans[0].id).toBe("t99");
  });

  it("retorna not_found para transferId inexistente", () => {
    const res = deleteTransfer({ trans: [] }, { transferId: "nope" });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("not_found");
  });
});

describe("isTransfer", () => {
  it("identifica pernas de transferência e ignora lançamentos comuns", () => {
    expect(isTransfer({ natureza: "transferencia" })).toBe(true);
    expect(isTransfer({ natureza: "fatura_cartao" })).toBe(false);
    expect(isTransfer({ tipo: "despesa" })).toBe(false);
    expect(isTransfer(null)).toBe(false);
  });
});
