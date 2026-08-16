// importDuplicateService.test.js — v0.3.37 (Fase 5, DEC-0038)
// Extração pura de App.jsx (sem mudança de comportamento). Testes de
// caracterização: travam o que as chaves de deduplicação já produziam
// antes da extração, para que uma alteração futura nesse formato seja
// uma decisão explícita e não um efeito colateral.
import { describe, it, expect } from "vitest";
import {
  normalizeImportDescriptionForDuplicate,
  normalizeImportAmountForDuplicate,
  normalizeImportTypeForDuplicate,
  uniqueNonEmpty,
  getImportDuplicateDateCandidates,
  stripInstallmentMarkersFromDescription,
  getInstallmentInfoFromDescription,
  getImportInstallmentInfo,
  getImportDuplicateDescriptionCandidates,
  buildStrictImportDuplicateKey,
  buildImportDuplicateKeyCandidates,
  buildExistingImportDuplicateKeys,
} from "../src/services/importDuplicateService.js";

describe("normalizeImportDescriptionForDuplicate", () => {
  it("remove acento, caixa e espaço redundante", () => {
    expect(normalizeImportDescriptionForDuplicate("  MERCADO   São   João ")).toBe("mercado sao joao");
  });
  it("trata null/undefined como string vazia", () => {
    expect(normalizeImportDescriptionForDuplicate(null)).toBe("");
    expect(normalizeImportDescriptionForDuplicate(undefined)).toBe("");
  });
});

describe("normalizeImportAmountForDuplicate", () => {
  it("aceita tanto `valor` quanto `amount`", () => {
    expect(normalizeImportAmountForDuplicate({ valor: 10.005 })).toBe(10.01);
    expect(normalizeImportAmountForDuplicate({ amount: 42.5 })).toBe(42.5);
  });
  it("prioriza `valor` sobre `amount` quando ambos existem", () => {
    expect(normalizeImportAmountForDuplicate({ valor: 1, amount: 99 })).toBe(1);
  });
  it("registro sem valor vira 0", () => {
    expect(normalizeImportAmountForDuplicate({})).toBe(0);
  });
});

describe("normalizeImportTypeForDuplicate", () => {
  it("usa o tipo do registro quando existe", () => {
    expect(normalizeImportTypeForDuplicate({ tipo: "receita" }, "cartao")).toBe("receita");
  });
  it("no modo cartão, assume despesa quando o tipo está ausente", () => {
    expect(normalizeImportTypeForDuplicate({}, "cartao")).toBe("despesa");
  });
  it("fora do modo cartão, tipo ausente fica vazio", () => {
    expect(normalizeImportTypeForDuplicate({}, "extrato")).toBe("");
  });
});

describe("uniqueNonEmpty", () => {
  it("remove duplicata, vazio e espaço nas pontas, preservando a ordem", () => {
    expect(uniqueNonEmpty([" a ", "a", "", null, "b"])).toEqual(["a", "b"]);
  });
});

describe("getImportDuplicateDateCandidates", () => {
  it("considera dataCompra/data/date/dt e corta em 10 caracteres", () => {
    expect(getImportDuplicateDateCandidates({
      dataCompra: "2026-08-01T12:00:00Z",
      data: "2026-08-02",
    })).toEqual(["2026-08-01", "2026-08-02"]);
  });
  it("deduplica quando os campos apontam a mesma data", () => {
    expect(getImportDuplicateDateCandidates({ data: "2026-08-02", date: "2026-08-02" }))
      .toEqual(["2026-08-02"]);
  });
  it("registro sem nenhuma data devolve lista vazia", () => {
    expect(getImportDuplicateDateCandidates({})).toEqual([]);
  });
});

describe("stripInstallmentMarkersFromDescription", () => {
  it("remove marcador 'Parcela 2 de 10'", () => {
    expect(stripInstallmentMarkersFromDescription("Notebook Parcela 2 de 10")).toBe("Notebook");
  });
  it("remove marcador no formato 3/12", () => {
    expect(stripInstallmentMarkersFromDescription("Geladeira 3/12")).toBe("Geladeira");
  });
  it("descrição sem marcador fica intacta", () => {
    expect(stripInstallmentMarkersFromDescription("Supermercado")).toBe("Supermercado");
  });
});

describe("getInstallmentInfoFromDescription", () => {
  it("lê 'parc 2/10'", () => {
    expect(getInstallmentInfoFromDescription("Compra parc 2/10")).toEqual({ parcela: 2, totalParcelas: 10 });
  });
  it("lê '4 de 6'", () => {
    expect(getInstallmentInfoFromDescription("TV 4 de 6")).toEqual({ parcela: 4, totalParcelas: 6 });
  });
  it("ignora parcela única (total = 1)", () => {
    expect(getInstallmentInfoFromDescription("Item 1/1")).toEqual({ parcela: null, totalParcelas: null });
  });
  it("ignora quando a parcela é maior que o total", () => {
    expect(getInstallmentInfoFromDescription("Item 9/3")).toEqual({ parcela: null, totalParcelas: null });
  });
  it("descrição sem parcelamento devolve nulos", () => {
    expect(getInstallmentInfoFromDescription("Padaria")).toEqual({ parcela: null, totalParcelas: null });
  });
});

describe("getImportInstallmentInfo", () => {
  it("campos explícitos do registro prevalecem sobre a descrição", () => {
    expect(getImportInstallmentInfo({ descricao: "Item 2/10", parcela: 3, totalParcelas: 12 }))
      .toEqual({ parcela: 3, totalParcelas: 12 });
  });
  it("cai para a descrição quando não há campo explícito", () => {
    expect(getImportInstallmentInfo({ descricao: "Item 2/10" })).toEqual({ parcela: 2, totalParcelas: 10 });
  });
  it("aceita `parcelas` como nome alternativo do total", () => {
    expect(getImportInstallmentInfo({ description: "Item", parcela: 1, parcelas: 4 }))
      .toEqual({ parcela: 1, totalParcelas: 4 });
  });
});

describe("getImportDuplicateDescriptionCandidates", () => {
  it("devolve a descrição normalizada e a versão sem marcador de parcela", () => {
    expect(getImportDuplicateDescriptionCandidates({ descricao: "Notebook Parcela 2 de 10" }))
      .toEqual(["notebook parcela 2 de 10", "notebook"]);
  });
  it("descrição sem parcela gera um único candidato", () => {
    expect(getImportDuplicateDescriptionCandidates({ descricao: "Padaria" })).toEqual(["padaria"]);
  });
});

describe("buildStrictImportDuplicateKey", () => {
  it("monta a chave de conta com escopo, data, descrição, valor e tipo", () => {
    expect(buildStrictImportDuplicateKey(
      { data: "2026-08-05", descricao: "Aluguel", valor: 1800, tipo: "despesa" },
      { mode: "extrato", destinationId: "cc1" },
    )).toBe("conta:cc1:extrato|2026-08-05|aluguel|1800.00|despesa");
  });
  it("monta a chave de cartão com escopo próprio", () => {
    expect(buildStrictImportDuplicateKey(
      { data: "2026-08-03", descricao: "iFood", valor: 89 },
      { mode: "cartao", destinationId: "c1" },
    )).toBe("cartao:c1|2026-08-03|ifood|89.00|despesa");
  });
  it("registro sem data nenhuma não produz chave", () => {
    expect(buildStrictImportDuplicateKey({ descricao: "X", valor: 1 }, { mode: "cartao", destinationId: "c1" }))
      .toBe("");
  });
});

describe("buildImportDuplicateKeyCandidates", () => {
  it("no modo cartão, acrescenta a chave de parcelamento às chaves estritas", () => {
    const keys = buildImportDuplicateKeyCandidates(
      { data: "2026-08-03", descricao: "Notebook 2/10", valor: 500 },
      { mode: "cartao", destinationId: "c1" },
    );
    expect(keys).toContain("cartao:c1|2026-08-03|notebook 2/10|500.00|despesa");
    expect(keys).toContain("cartao:c1|parcelamento|notebook 2/10|500.00|2/10");
    expect(keys).toContain("cartao:c1|parcelamento|notebook|500.00|2/10");
  });
  it("fora do modo cartão, não gera chave de parcelamento", () => {
    const keys = buildImportDuplicateKeyCandidates(
      { data: "2026-08-03", descricao: "Notebook 2/10", valor: 500 },
      { mode: "extrato", destinationId: "cc1" },
    );
    expect(keys.some(k => k.includes("parcelamento"))).toBe(false);
  });
});

describe("buildExistingImportDuplicateKeys", () => {
  const trans = [
    { id: "t1", contaId: "cc1", origem: "corrente", data: "2026-08-05", descricao: "Aluguel", valor: 1800, tipo: "despesa" },
    { id: "t2", contaId: "cc1", origem: "cartao",   data: "2026-08-06", descricao: "iFood",   valor: 89,   tipo: "despesa" },
    { id: "t3", contaId: "cc2", origem: "corrente", data: "2026-08-07", descricao: "Outro",   valor: 10,   tipo: "despesa" },
    { id: "t4", cartaoId: "c1", data: "2026-08-03", descricao: "Uber", valor: 45, tipo: "despesa" },
  ];

  it("no modo conta, ignora lançamentos de cartão e de outra conta", () => {
    const keys = buildExistingImportDuplicateKeys(trans, { mode: "extrato", contaId: "cc1" });
    expect(keys.has("conta:cc1:extrato|2026-08-05|aluguel|1800.00|despesa")).toBe(true);
    expect([...keys].some(k => k.includes("ifood"))).toBe(false);
    expect([...keys].some(k => k.includes("outro"))).toBe(false);
  });

  it("no modo cartão, considera só os lançamentos daquele cartão", () => {
    const keys = buildExistingImportDuplicateKeys(trans, { mode: "cartao", cartaoId: "c1" });
    expect(keys.has("cartao:c1|2026-08-03|uber|45.00|despesa")).toBe(true);
    expect([...keys].some(k => k.includes("aluguel"))).toBe(false);
  });

  it("lista vazia ou nula devolve um Set vazio", () => {
    expect(buildExistingImportDuplicateKeys([], { mode: "cartao", cartaoId: "c1" }).size).toBe(0);
    expect(buildExistingImportDuplicateKeys(null, { mode: "cartao", cartaoId: "c1" }).size).toBe(0);
  });
});
