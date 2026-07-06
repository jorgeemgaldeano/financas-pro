// migrationPipeline.js — v0.3.28
//
// Resolve o achado E4/E7-adjacente (migrações não versionadas/encadeadas).
// Antes: migrações de dados viviam soltas em useEffect após o primeiro render
// do App (ex.: migração de contaPagamentoId/accountId em cards). Cada uma era
// um ponto único, não testável isoladamente, e não havia registro de "até
// onde" os dados de um usuário já haviam sido migrados.
//
// Aqui: cada migração é um passo puro `{ version, run(data) => data }`.
// `runMigrations` aplica em sequência, a partir da versão atual gravada no
// payload (`schemaVersion`), e devolve o dado migrado + a nova versão.
//
// Importante: isto é uma migração de CONTEÚDO all inside the same LocalStorage
// key (ex.: normalizar campos de cada transação). É complementar — e
// deliberadamente independente — da blindagem de PREFIXO de chave (E7,
// resolvida em financeRepository.js na v0.3.26.7). São duas camadas:
//   - E7: protege contra o prefixo global mudar (fpro_v1_ → fpro_v2_).
//   - Este pipeline: evolui o formato interno de uma chave já lida.

import { normalizeTransactions } from "./transactionNormalizer.js";

// Versão atual do formato de dados de `trans`. Incremente ao adicionar um novo
// passo de migração abaixo.
export const TRANS_SCHEMA_VERSION = 1;

// Passos de migração de `trans`, em ordem. `version` é a versão que o passo
// PRODUZ (ou seja, o passo com version:1 leva dados de "sem versão" para v1).
const TRANS_MIGRATIONS = [
  {
    version: 1,
    description: "Normaliza os pares dual-write PT/EN (E2) em todas as transações.",
    run: (list) => normalizeTransactions(list),
  },
  // Próximos passos (v0.3.29+) entram aqui, incrementando version.
];

// Aplica os passos de migração pendentes sobre uma lista de transações.
// `fromVersion` é lida de um envelope externo (ver `runVersionedMigration`);
// aqui recebemos já a lista pura, sem envelope, para manter a função simples
// de testar.
export function migrateTransactions(list, fromVersion = 0) {
  let data = list;
  let version = fromVersion;
  for (const step of TRANS_MIGRATIONS) {
    if (step.version > version) {
      data = step.run(data);
      version = step.version;
    }
  }
  return { data, version };
}
