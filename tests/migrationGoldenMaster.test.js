// migrationGoldenMaster.test.js — v0.3.31
//
// Golden master do pipeline de migração de transações (migrationPipeline.js).
//
// Diferente dos smoke tests em dataModel.test.js (que cobrem casos unitários
// pequenos), aqui congelamos um DATASET ANTIGO REALISTA — como um usuário teria
// no LocalStorage antes da normalização E2 — e travamos o resultado EXATO da
// migração. Se qualquer passo de migração futuro alterar silenciosamente a
// forma dos dados de um usuário existente, este teste quebra e força uma
// decisão consciente (novo golden + registro de decisão), em vez de deixar a
// mudança passar despercebida.

import { describe, it, expect } from "vitest";
import { migrateTransactions, TRANS_SCHEMA_VERSION } from "../src/services/migrationPipeline.js";

// ---------------------------------------------------------------------------
// Fixture: transações "de produção" no formato pré-normalização (versão 0).
// Cobre os quatro cenários que o normalizer trata, sem duplicar os unitários:
//   t1 — só campos PT (import bancário típico)
//   t2 — só campos EN (escrita legada estilo projectionService)
//   t3 — PT e EN divergentes (conflito → PT canônico vence)
//   t4 — já consistente (deve sair intacto, mesma referência)
// ---------------------------------------------------------------------------
const DATASET_ANTIGO = Object.freeze([
  {
    id: "t1", tipo: "despesa", origem: "corrente",
    contaId: "acc-corrente", catId: "cat-mercado", descricao: "Mercado",
    valor: 150.5, data: "2026-05-10", fixo: false, importado: true,
    importTipo: "bancario", importBatchId: "batch_1",
    status: "pago", valorPago: 150.5, competencia: "2026-05",
  },
  {
    id: "t2", tipo: "despesa", origem: "cartao",
    cardId: "card-visa", catId: "cat-online", descricao: "Assinatura",
    amount: 39.9, data: "2026-04-20", competenceMonth: "2026-05", status: "pago",
  },
  {
    id: "t3", tipo: "receita", origem: "corrente",
    contaId: "acc-nova", accountId: "acc-antiga", descricao: "Salário",
    valor: 5000, amount: 4999, data: "2026-05-05",
    competencia: "2026-05", competenceMonth: "2026-04",
  },
  {
    id: "t4", tipo: "despesa", origem: "cartao",
    cartaoId: "card-master", cardId: "card-master", descricao: "Farmácia",
    valor: 80, amount: 80, data: "2026-06-01",
    competencia: "2026-06", competenceMonth: "2026-06",
  },
]);

// Golden: resultado EXATO esperado após migrar do zero (fromVersion=0).
// Regra do normalizer: preenche o lado ausente; em conflito, o PT (canônico)
// sobrescreve o EN. Campos fora dos pares dual-write são preservados intactos.
const GOLDEN = [
  {
    id: "t1", tipo: "despesa", origem: "corrente",
    contaId: "acc-corrente", catId: "cat-mercado", descricao: "Mercado",
    valor: 150.5, data: "2026-05-10", fixo: false, importado: true,
    importTipo: "bancario", importBatchId: "batch_1",
    status: "pago", valorPago: 150.5, competencia: "2026-05",
    // aliases EN preenchidos a partir do PT:
    amount: 150.5, accountId: "acc-corrente", competenceMonth: "2026-05", paidAmount: 150.5,
  },
  {
    id: "t2", tipo: "despesa", origem: "cartao",
    cardId: "card-visa", catId: "cat-online", descricao: "Assinatura",
    amount: 39.9, data: "2026-04-20", competenceMonth: "2026-05", status: "pago",
    // canônicos PT preenchidos a partir do EN:
    cartaoId: "card-visa", valor: 39.9, competencia: "2026-05",
  },
  {
    id: "t3", tipo: "receita", origem: "corrente",
    contaId: "acc-nova", descricao: "Salário",
    valor: 5000, data: "2026-05-05", competencia: "2026-05",
    // EN sobrescrito pelo PT (conflito → PT vence):
    accountId: "acc-nova", amount: 5000, competenceMonth: "2026-05",
  },
  {
    id: "t4", tipo: "despesa", origem: "cartao",
    cartaoId: "card-master", cardId: "card-master", descricao: "Farmácia",
    valor: 80, amount: 80, data: "2026-06-01",
    competencia: "2026-06", competenceMonth: "2026-06",
  },
];

describe("migrationPipeline — golden master (dataset antigo realista)", () => {
  it("migra o dataset antigo para a forma canônica congelada", () => {
    const { data, version } = migrateTransactions(DATASET_ANTIGO, 0);
    expect(version).toBe(TRANS_SCHEMA_VERSION);
    expect(data).toEqual(GOLDEN);
  });

  it("preserva campos fora dos pares PT/EN sem tocá-los", () => {
    const { data } = migrateTransactions(DATASET_ANTIGO, 0);
    const t1 = data.find(t => t.id === "t1");
    expect(t1.importBatchId).toBe("batch_1");
    expect(t1.importTipo).toBe("bancario");
    expect(t1.catId).toBe("cat-mercado");
    expect(t1.fixo).toBe(false);
  });

  it("é idempotente: migrar o golden de novo não altera nada", () => {
    const { data: once } = migrateTransactions(DATASET_ANTIGO, 0);
    const { data: twice, version } = migrateTransactions(once, 0);
    expect(version).toBe(TRANS_SCHEMA_VERSION);
    expect(twice).toEqual(GOLDEN);
  });

  it("não reprocessa quando fromVersion já é a atual (devolve a mesma referência)", () => {
    const jaMigrado = migrateTransactions(DATASET_ANTIGO, 0).data;
    const { data, version } = migrateTransactions(jaMigrado, TRANS_SCHEMA_VERSION);
    expect(version).toBe(TRANS_SCHEMA_VERSION);
    expect(data).toBe(jaMigrado);
  });

  it("preserva a identidade referencial das transações já consistentes (t4)", () => {
    const { data } = migrateTransactions(DATASET_ANTIGO, 0);
    const t4Original = DATASET_ANTIGO.find(t => t.id === "t4");
    const t4Migrado = data.find(t => t.id === "t4");
    expect(t4Migrado).toBe(t4Original);
  });

  it("não muta o dataset de entrada (função pura)", () => {
    const snapshot = JSON.parse(JSON.stringify(DATASET_ANTIGO));
    migrateTransactions(DATASET_ANTIGO, 0);
    expect(DATASET_ANTIGO).toEqual(snapshot);
  });
});
