// transferMatchService.test.js — v0.3.33 (Fase 2 — DEC-0034 / RN031)
import { describe, it, expect } from "vitest";
import {
  daysBetweenDates,
  findTransferMatchCandidates,
  linkImportedRowAsTransfer,
  revertTransferLinksFromBatch,
} from "../src/services/transferMatchService.js";

const contas = [
  { id: "cc1", nome: "Conta A", tipo: "corrente" },
  { id: "cc2", nome: "Conta B", tipo: "corrente" },
  { id: "vale1", nome: "Vale Refeição", tipo: "vale_refeicao" },
];

let seq = 0;
const uid = () => `id${++seq}`;

describe("daysBetweenDates", () => {
  it("calcula diferença absoluta em dias corridos", () => {
    expect(daysBetweenDates("2026-08-10", "2026-08-13")).toBe(3);
    expect(daysBetweenDates("2026-08-13", "2026-08-10")).toBe(3);
    expect(daysBetweenDates("2026-08-10", "2026-08-10")).toBe(0);
  });

  it("retorna Infinity para data inválida/ausente", () => {
    expect(daysBetweenDates("", "2026-08-10")).toBe(Infinity);
    expect(daysBetweenDates(null, null)).toBe(Infinity);
  });

  it("não sofre deslocamento de fuso ao cruzar virada de mês", () => {
    expect(daysBetweenDates("2026-07-31", "2026-08-01")).toBe(1);
  });
});

describe("findTransferMatchCandidates", () => {
  const baseRows = [{ _id: "r1", tipo: "despesa", valor: 500, data: "2026-08-10", descricao: "Pix enviado" }];

  it("encontra crédito de mesmo valor em outra conta corrente dentro da janela", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc2", valor: 500, data: "2026-08-11", descricao: "Pix recebido" }];
    const out = findTransferMatchCandidates({ rows: baseRows, trans, contas, sourceContaId: "cc1", duplaEntradaDias: 3 });
    expect(out.r1).toHaveLength(1);
    expect(out.r1[0]).toMatchObject({ transactionId: "t1", contaId: "cc2", contaNome: "Conta B", diffDias: 1 });
  });

  it("não sugere quando o crédito está fora da janela de dias", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc2", valor: 500, data: "2026-08-20", descricao: "Pix recebido" }];
    const out = findTransferMatchCandidates({ rows: baseRows, trans, contas, sourceContaId: "cc1", duplaEntradaDias: 3 });
    expect(out.r1).toBeUndefined();
  });

  it("não sugere quando o valor diverge", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc2", valor: 499, data: "2026-08-10", descricao: "Pix recebido" }];
    const out = findTransferMatchCandidates({ rows: baseRows, trans, contas, sourceContaId: "cc1", duplaEntradaDias: 3 });
    expect(out.r1).toBeUndefined();
  });

  it("ignora crédito na MESMA conta sendo importada", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc1", valor: 500, data: "2026-08-10", descricao: "Depósito" }];
    const out = findTransferMatchCandidates({ rows: baseRows, trans, contas, sourceContaId: "cc1", duplaEntradaDias: 3 });
    expect(out.r1).toBeUndefined();
  });

  it("ignora conta que não é corrente (ex.: vale)", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "vale1", valor: 500, data: "2026-08-10", descricao: "Disponibilização" }];
    const out = findTransferMatchCandidates({ rows: baseRows, trans, contas, sourceContaId: "cc1", duplaEntradaDias: 3 });
    expect(out.r1).toBeUndefined();
  });

  it("ignora transação de crédito que já é perna de outra transferência", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc2", valor: 500, data: "2026-08-10", natureza: "transferencia", transferId: "tx" }];
    const out = findTransferMatchCandidates({ rows: baseRows, trans, contas, sourceContaId: "cc1", duplaEntradaDias: 3 });
    expect(out.r1).toBeUndefined();
  });

  it("ignora linhas de crédito na prévia (só débito é candidato a saída)", () => {
    const rows = [{ _id: "r2", tipo: "receita", valor: 500, data: "2026-08-10" }];
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc2", valor: 500, data: "2026-08-10" }];
    const out = findTransferMatchCandidates({ rows, trans, contas, sourceContaId: "cc1", duplaEntradaDias: 3 });
    expect(out.r2).toBeUndefined();
  });

  it("ordena candidatos pela menor diferença de dias", () => {
    const trans = [
      { id: "t1", tipo: "receita", contaId: "cc2", valor: 500, data: "2026-08-13" },
      { id: "t2", tipo: "receita", contaId: "cc2", valor: 500, data: "2026-08-11" },
    ];
    const out = findTransferMatchCandidates({ rows: baseRows, trans, contas, sourceContaId: "cc1", duplaEntradaDias: 5 });
    expect(out.r1.map((m) => m.transactionId)).toEqual(["t2", "t1"]);
  });

  it("sem conta corrente cadastrada além da origem, não retorna nada", () => {
    const soloConta = [{ id: "cc1", nome: "Conta A", tipo: "corrente" }];
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc1", valor: 500, data: "2026-08-10" }];
    const out = findTransferMatchCandidates({ rows: baseRows, trans, contas: soloConta, sourceContaId: "cc1", duplaEntradaDias: 3 });
    expect(out).toEqual({});
  });
});

describe("linkImportedRowAsTransfer", () => {
  it("converte a transação existente em perna de entrada e cria a perna de saída nova", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc2", valor: 500, data: "2026-08-11", descricao: "Pix recebido" }];
    const res = linkImportedRowAsTransfer(
      { trans },
      { existingTransactionId: "t1", sourceContaId: "cc1", valor: 500, data: "2026-08-10", descricao: "Pix enviado", importBatchId: "batch1", uid }
    );

    expect(res.ok).toBe(true);
    expect(res.trans).toHaveLength(2);

    const entrada = res.trans.find((t) => t.id === "t1");
    const saida = res.trans.find((t) => t.id !== "t1");

    expect(entrada.natureza).toBe("transferencia");
    expect(entrada.transferId).toBe(res.transferId);
    expect(entrada.transferLinkedFromBatch).toBe("batch1");
    expect(entrada.tipo).toBe("receita"); // tipo original preservado
    expect(entrada.valor).toBe(500); // valor original preservado, não sobrescrito

    expect(saida.tipo).toBe("despesa");
    expect(saida.contaId).toBe("cc1");
    expect(saida.natureza).toBe("transferencia");
    expect(saida.transferId).toBe(res.transferId);
    expect(saida.importado).toBe(true);
    expect(saida.importBatchId).toBe("batch1");
  });

  it("não muta o estado de entrada", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc2", valor: 500, data: "2026-08-11" }];
    linkImportedRowAsTransfer({ trans }, { existingTransactionId: "t1", sourceContaId: "cc1", valor: 500, data: "2026-08-10", uid });
    expect(trans[0].natureza).toBeUndefined();
    expect(trans).toHaveLength(1);
  });

  it("rejeita transação existente inexistente", () => {
    const res = linkImportedRowAsTransfer({ trans: [] }, { existingTransactionId: "zzz", sourceContaId: "cc1", valor: 500, data: "2026-08-10", uid });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("existing_not_found");
  });

  it("rejeita transação já vinculada a outra transferência", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc2", valor: 500, data: "2026-08-11", natureza: "transferencia", transferId: "outra" }];
    const res = linkImportedRowAsTransfer({ trans }, { existingTransactionId: "t1", sourceContaId: "cc1", valor: 500, data: "2026-08-10", uid });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("already_linked");
  });

  it("rejeita vínculo com transação da mesma conta de origem", () => {
    const trans = [{ id: "t1", tipo: "receita", contaId: "cc1", valor: 500, data: "2026-08-11" }];
    const res = linkImportedRowAsTransfer({ trans }, { existingTransactionId: "t1", sourceContaId: "cc1", valor: 500, data: "2026-08-10", uid });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("same_account");
  });
});

describe("revertTransferLinksFromBatch", () => {
  it("remove transferId/natureza/transferLinkedFromBatch só das transações ligadas ao lote informado", () => {
    const trans = [
      { id: "t1", tipo: "receita", contaId: "cc2", valor: 500, natureza: "transferencia", transferId: "tx1", transferLinkedFromBatch: "batch1" },
      { id: "t2", tipo: "receita", contaId: "cc2", valor: 300, natureza: "transferencia", transferId: "tx2", transferLinkedFromBatch: "batch2" },
      { id: "t3", tipo: "despesa", contaId: "cc1", valor: 10 },
    ];
    const out = revertTransferLinksFromBatch(trans, "batch1");
    const t1 = out.find((t) => t.id === "t1");
    expect(t1.natureza).toBeUndefined();
    expect(t1.transferId).toBeUndefined();
    expect(t1.transferLinkedFromBatch).toBeUndefined();
    expect(t1.tipo).toBe("receita"); // resto do registro preservado

    const t2 = out.find((t) => t.id === "t2");
    expect(t2.natureza).toBe("transferencia"); // de outro lote, intocado

    expect(out.find((t) => t.id === "t3")).toEqual(trans[2]);
  });

  it("sem importBatchId, devolve trans intocado", () => {
    const trans = [{ id: "t1", natureza: "transferencia", transferLinkedFromBatch: "batch1" }];
    expect(revertTransferLinksFromBatch(trans, null)).toBe(trans);
  });
});
