import { describe, it, expect } from "vitest";
import {
  normalizeTransaction,
  normalizeTransactions,
  withDualFields,
  DUAL_FIELD_PAIRS,
} from "../src/services/transactionNormalizer.js";
import { migrateTransactions, TRANS_SCHEMA_VERSION } from "../src/services/migrationPipeline.js";
import { resolveInvoiceCategoryId } from "../src/services/cardInvoiceOperations.js";

describe("normalizeTransaction", () => {
  it("preenche o alias (EN) quando só o canônico (PT) existe", () => {
    const t = { id: "t1", valor: 100, contaId: "cc1" };
    const n = normalizeTransaction(t);
    expect(n.amount).toBe(100);
    expect(n.accountId).toBe("cc1");
    // canônico preservado
    expect(n.valor).toBe(100);
    expect(n.contaId).toBe("cc1");
  });

  it("preenche o canônico (PT) quando só o alias (EN) existe", () => {
    const t = { id: "t2", amount: 50, accountId: "cc2" };
    const n = normalizeTransaction(t);
    expect(n.valor).toBe(50);
    expect(n.contaId).toBe("cc2");
  });

  it("em conflito, o canônico (PT) vence", () => {
    const t = { id: "t3", valor: 100, amount: 999, contaId: "cc1", accountId: "ccX" };
    const n = normalizeTransaction(t);
    expect(n.valor).toBe(100);
    expect(n.amount).toBe(100); // corrigido para bater com o canônico
    expect(n.contaId).toBe("cc1");
    expect(n.accountId).toBe("cc1");
  });

  it("não recria o objeto quando já está consistente (preserva identidade referencial)", () => {
    const t = { id: "t4", valor: 10, amount: 10, contaId: "cc1", accountId: "cc1" };
    const n = normalizeTransaction(t);
    expect(n).toBe(t); // mesma referência — importante para useMemo
  });

  it("cobre todos os pares declarados", () => {
    const partial = {};
    DUAL_FIELD_PAIRS.forEach(([pt], i) => { partial[pt] = i + 1; });
    const n = normalizeTransaction(partial);
    DUAL_FIELD_PAIRS.forEach(([pt, en]) => { expect(n[en]).toBe(n[pt]); });
  });

  it("ignora entradas nulas/inválidas sem lançar erro", () => {
    expect(normalizeTransaction(null)).toBe(null);
    expect(normalizeTransaction(undefined)).toBe(undefined);
  });
});

describe("normalizeTransactions (lista)", () => {
  it("normaliza cada item e preserva referência da lista quando nada muda", () => {
    const list = [{ id: "a", valor: 1, amount: 1, contaId: "c", accountId: "c" }];
    expect(normalizeTransactions(list)).toBe(list);
  });

  it("cria nova lista quando algum item precisa de correção, mas preserva os que já estavam ok", () => {
    const ok = { id: "a", valor: 1, amount: 1, contaId: "c", accountId: "c" };
    const bad = { id: "b", valor: 5, contaId: "c2" };
    const list = [ok, bad];
    const next = normalizeTransactions(list);
    expect(next).not.toBe(list);
    expect(next[0]).toBe(ok); // item já consistente não foi recriado
    expect(next[1]).not.toBe(bad);
    expect(next[1].amount).toBe(5);
  });

  it("é idempotente (aplicar duas vezes não muda nada na segunda)", () => {
    const list = [{ id: "a", valor: 1, contaId: "c" }];
    const once = normalizeTransactions(list);
    const twice = normalizeTransactions(once);
    expect(twice).toBe(once);
  });
});

describe("withDualFields", () => {
  it("garante os dois lados para um registro novo", () => {
    const t = withDualFields({ id: "x", valor: 20, contaId: "cc1" });
    expect(t.amount).toBe(20);
    expect(t.accountId).toBe("cc1");
  });
});

describe("migrateTransactions (pipeline versionado)", () => {
  it("aplica a normalização como passo de migração e devolve a versão atual", () => {
    const list = [{ id: "a", valor: 10, contaId: "c1" }];
    const { data, version } = migrateTransactions(list, 0);
    expect(version).toBe(TRANS_SCHEMA_VERSION);
    expect(data[0].amount).toBe(10);
  });

  it("não repete passos já aplicados (fromVersion atual)", () => {
    const list = [{ id: "a", valor: 10, amount: 10, contaId: "c1", accountId: "c1" }];
    const { data, version } = migrateTransactions(list, TRANS_SCHEMA_VERSION);
    expect(version).toBe(TRANS_SCHEMA_VERSION);
    expect(data).toBe(list); // nada para corrigir, nada para migrar
  });
});

describe("resolveInvoiceCategoryId (E6)", () => {
  const cats = [{ id: "cat10", nome: "Outros" }, { id: "cat3", nome: "Anuidades" }];

  it("usa a categoria configurada quando ela existe", () => {
    expect(resolveInvoiceCategoryId(cats, "cat3")).toBe("cat3");
  });

  it("cai para cat10 quando a categoria configurada não existe (foi excluída)", () => {
    expect(resolveInvoiceCategoryId(cats, "cat-removida")).toBe("cat10");
  });

  it("cai para cat10 quando não há configuração", () => {
    expect(resolveInvoiceCategoryId(cats, undefined)).toBe("cat10");
    expect(resolveInvoiceCategoryId([], "cat3")).toBe("cat10");
  });
});
