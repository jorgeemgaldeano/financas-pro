// transferBackup.test.js — v0.3.33
//
// Valida que uma transferência sobrevive ao ciclo de backup → restauração.
// As pernas são transações comuns (array `trans`), então já entram no backup;
// este teste TRAVA que os campos de transferência (natureza, transferId,
// transferOrigin, transferContraContaId) e os aliases EN não são descartados
// pela serialização JSON nem pela normalização/migração aplicada na restauração.
import { describe, it, expect } from "vitest";
import { createTransfer, linkAsTransfer } from "../src/services/transferService.js";
import { normalizeTransactions } from "../src/services/transactionNormalizer.js";
import { migrateTransactions } from "../src/services/migrationPipeline.js";

const contas = [
  { id: "cc1", nome: "Conta Corrente", tipo: "corrente" },
  { id: "cc2", nome: "Poupança", tipo: "corrente" },
];

function genIdFactory() {
  let n = 0;
  return (prefix) => `${prefix}${++n}`;
}

// Monta um estado com uma transferência CRIADA (manual) e uma por VÍNCULO.
// Uma única fábrica de id compartilhada evita colisão de transferId (no app
// real o gerador é o uid() global, sempre único).
function estadoComTransferencias() {
  const genId = genIdFactory();
  const criada = createTransfer(
    { trans: [], contas },
    { contaOrigemId: "cc1", contaDestinoId: "cc2", valor: 300, data: "2026-07-08", descricao: "Reserva" },
    { genId }
  );
  const existentes = [
    ...criada.trans,
    { id: "d9", tipo: "despesa", origem: "corrente", contaId: "cc1", valor: 80, data: "2026-07-05" },
    { id: "r9", tipo: "receita", origem: "corrente", contaId: "cc2", valor: 80, data: "2026-07-06" },
  ];
  const linked = linkAsTransfer({ trans: existentes }, { despesaId: "d9", receitaId: "r9" }, { genId });
  return linked.trans;
}

// Simula o file round-trip do backup (export → JSON → import).
const roundTrip = (obj) => JSON.parse(JSON.stringify(obj));

describe("backup/restauração preserva a transferência", () => {
  it("os campos de transferência sobrevivem ao JSON + normalização + migração", () => {
    const antes = estadoComTransferencias();
    // export/import: serializa e desserializa
    const restaurado = roundTrip(antes);
    // fronteira de persistência (setTrans) + pipeline de migração no load
    const normalizado = normalizeTransactions(restaurado);
    const { data: migrado } = migrateTransactions(roundTrip(restaurado), 0);

    for (const lista of [normalizado, migrado]) {
      const transferencias = lista.filter((t) => t.natureza === "transferencia");
      // 2 pernas da criada + 2 da vinculada
      expect(transferencias).toHaveLength(4);

      // Cada transferId tem exatamente duas pernas com contra-conta cruzada.
      const porId = {};
      for (const t of transferencias) {
        expect(t.transferId).toBeTruthy();
        expect(["manual", "vinculo"]).toContain(t.transferOrigin);
        expect(t.transferContraContaId).toBeTruthy();
        (porId[t.transferId] ||= []).push(t);
      }
      expect(Object.keys(porId)).toHaveLength(2);
      for (const legs of Object.values(porId)) {
        expect(legs).toHaveLength(2);
        const [a, b] = legs;
        expect(a.transferContraContaId).toBe(b.contaId);
        expect(b.transferContraContaId).toBe(a.contaId);
        expect(a.transferOrigin).toBe(b.transferOrigin);
      }
    }
  });

  it("a perna criada mantém alias EN (amount/accountId) após o ciclo", () => {
    const antes = estadoComTransferencias();
    const depois = normalizeTransactions(roundTrip(antes));
    const legManual = depois.find((t) => t.transferOrigin === "manual" && t.tipo === "despesa");
    expect(legManual.amount).toBe(legManual.valor);
    expect(legManual.accountId).toBe(legManual.contaId);
  });

  it("lançamentos não-transferência não ganham campos de transferência", () => {
    const antes = estadoComTransferencias();
    const depois = normalizeTransactions(roundTrip(antes));
    // (nenhum lançamento comum sobra neste cenário; garante ausência de vazamento)
    const comuns = depois.filter((t) => t.natureza !== "transferencia");
    for (const t of comuns) {
      expect(t.transferId).toBeUndefined();
      expect(t.transferOrigin).toBeUndefined();
    }
  });
});
