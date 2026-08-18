// recordStamp.test.js — v0.3.38 Fase 1 (DEC-0039, DEC-0041)
//
// Aceite da Fase 1: "teste que cria e edita cada entidade verificando o
// carimbo". As 13 entidades do BACKUP_STORAGE_KEYS estão cobertas, incluindo
// as três que deliberadamente NÃO recebem carimbo (metas, saldosIniciais e os
// escalares de params) — essas têm teste para travar a ausência, senão um dia
// alguém "conserta" isso sem perceber que o merge da Fase 4 conta com o
// comportamento atual.
import { describe, it, expect, beforeEach } from "vitest";
import {
  stampChangedRecords,
  equalIgnoringStamp,
  setStampUser,
  getStampUser,
} from "../src/services/recordStamp.js";

const AGORA = "2026-08-18T12:00:00.000Z";
const ANTES = "2026-08-01T09:00:00.000Z";
const opts = (usuario = "jorge") => ({ now: AGORA, usuario });

const carimbo = (usuario = "jorge") => ({ updatedAt: AGORA, updatedBy: usuario });

beforeEach(() => setStampUser(""));

describe("usuário corrente do carimbo", () => {
  it("normaliza e devolve o usuário definido", () => {
    expect(setStampUser("  Jorge  ")).toBe("Jorge");
    expect(getStampUser()).toBe("Jorge");
  });

  it("trata valor não textual como usuário vazio", () => {
    setStampUser(null);
    expect(getStampUser()).toBe("");
  });

  it("usa o usuário corrente quando a chamada não passa um", () => {
    setStampUser("ana");
    const [t] = stampChangedRecords([{ id: "t1", valor: 10 }], [], { now: AGORA });
    expect(t.updatedBy).toBe("ana");
  });
});

describe("identidade referencial", () => {
  it("devolve a mesma referência quando nada mudou", () => {
    const lista = [{ id: "t1", valor: 10, updatedAt: ANTES, updatedBy: "ana" }];
    expect(stampChangedRecords(lista, lista, opts())).toBe(lista);
  });

  it("devolve a mesma referência quando o conteúdo é igual mas o array foi recriado", () => {
    const anterior = [{ id: "t1", valor: 10, updatedAt: ANTES, updatedBy: "ana" }];
    const proximo = anterior.map(t => ({ ...t }));
    expect(stampChangedRecords(proximo, anterior, opts())).toBe(proximo);
    expect(stampChangedRecords(proximo, anterior, opts())[0].updatedAt).toBe(ANTES);
  });

  it("preserva registros irmãos não alterados", () => {
    const a = { id: "t1", valor: 10, updatedAt: ANTES, updatedBy: "ana" };
    const b = { id: "t2", valor: 20, updatedAt: ANTES, updatedBy: "ana" };
    const resultado = stampChangedRecords([a, { ...b, valor: 25 }], [a, b], opts());
    expect(resultado[0]).toBe(a);
    expect(resultado[1]).toMatchObject({ valor: 25, ...carimbo() });
  });
});

describe("criação e edição por entidade", () => {
  const casos = [
    ["trans", { id: "t1", descricao: "Mercado", valor: 120, data: "2026-08-10" }, r => ({ ...r, valor: 130 })],
    ["contas", { id: "cc1", nome: "Conta Corrente", saldoInicial: 2500 }, r => ({ ...r, saldoInicial: 3000 })],
    ["cards", { id: "c1", nome: "Cartão", limite: 5000, fechamento: 20 }, r => ({ ...r, limite: 6000 })],
    ["faturas", { id: "inv_c1_2026-08", cardId: "c1", status: "fechada" }, r => ({ ...r, status: "paga" })],
    ["pessoas", { id: "p1", nome: "Carlos", cor: "#7C3AED" }, r => ({ ...r, nome: "Carlos A." })],
    ["despPess", { id: "dp1", pessoaId: "p1", valor: 50 }, r => ({ ...r, valor: 75 })],
    ["simulacoes", { id: "s1", nome: "Notebook", valor: 4000, parcelas: 10 }, r => ({ ...r, parcelas: 12 })],
  ];

  it.each(casos)("carimba criação e edição de %s", (_entidade, registro, editar) => {
    const criado = stampChangedRecords([registro], [], opts());
    expect(criado[0]).toEqual({ ...registro, ...carimbo() });

    const editado = stampChangedRecords([editar(criado[0])], criado, { now: "2026-08-19T08:00:00.000Z", usuario: "ana" });
    expect(editado[0].updatedAt).toBe("2026-08-19T08:00:00.000Z");
    expect(editado[0].updatedBy).toBe("ana");
  });

  it("carimba a categoria e a subcategoria certas, sem carimbar as irmãs", () => {
    const anterior = [
      {
        id: "cat1", nome: "Alimentação", updatedAt: ANTES, updatedBy: "ana",
        subs: [
          { id: "sub1a", nome: "Supermercado", subs: [], updatedAt: ANTES, updatedBy: "ana" },
          { id: "sub1b", nome: "Restaurantes", subs: [], updatedAt: ANTES, updatedBy: "ana" },
        ],
      },
      { id: "cat2", nome: "Transporte", subs: [], updatedAt: ANTES, updatedBy: "ana" },
    ];

    const proximo = [
      {
        ...anterior[0],
        subs: [{ ...anterior[0].subs[0], nome: "Mercado" }, anterior[0].subs[1]],
      },
      anterior[1],
    ];

    const resultado = stampChangedRecords(proximo, anterior, opts());

    expect(resultado[0].subs[0]).toMatchObject({ nome: "Mercado", ...carimbo() });
    // A irmã não mudou: continua com o carimbo antigo.
    expect(resultado[0].subs[1].updatedAt).toBe(ANTES);
    // A categoria pai muda porque o conteúdo dela mudou.
    expect(resultado[0].updatedAt).toBe(AGORA);
    // A outra categoria raiz é preservada por referência.
    expect(resultado[1]).toBe(anterior[1]);
  });

  it("carimba amortização nova dentro da dívida", () => {
    const anterior = [{
      id: "d1", pessoaId: "p1", total: 1500, updatedAt: ANTES, updatedBy: "ana",
      amortizacoes: [{ id: "a1", valor: 300, updatedAt: ANTES, updatedBy: "ana" }],
    }];
    const proximo = [{ ...anterior[0], amortizacoes: [...anterior[0].amortizacoes, { id: "a2", valor: 200 }] }];

    const resultado = stampChangedRecords(proximo, anterior, opts());

    expect(resultado[0].amortizacoes[0].updatedAt).toBe(ANTES);
    expect(resultado[0].amortizacoes[1]).toEqual({ id: "a2", valor: 200, ...carimbo() });
    expect(resultado[0].updatedAt).toBe(AGORA);
  });

  it("carimba aporte novo dentro do cofrinho", () => {
    const anterior = [{ id: "cof1", nome: "Viagem", aportes: [], updatedAt: ANTES, updatedBy: "ana" }];
    const proximo = [{ ...anterior[0], aportes: [{ id: "mov1", valor: 100, tipo: "aporte" }] }];

    const resultado = stampChangedRecords(proximo, anterior, opts());

    expect(resultado[0].aportes[0]).toEqual({ id: "mov1", valor: 100, tipo: "aporte", ...carimbo() });
  });

  it("carimba regra de autocategorização dentro de params", () => {
    const anterior = { moeda: "BRL", autoCategoryRules: [{ id: "r1", keyword: "uber", catId: "cat2" }] };
    const proximo = { ...anterior, autoCategoryRules: [...anterior.autoCategoryRules, { id: "r2", keyword: "ifood", catId: "cat1" }] };

    const resultado = stampChangedRecords(proximo, anterior, opts());

    expect(resultado.autoCategoryRules[1]).toEqual({ id: "r2", keyword: "ifood", catId: "cat1", ...carimbo() });
    // `params` não é registro: não ganha carimbo próprio.
    expect(resultado.updatedAt).toBeUndefined();
  });

  it("exclusão remove o registro sem carimbar os que sobraram", () => {
    const anterior = [
      { id: "t1", valor: 10, updatedAt: ANTES, updatedBy: "ana" },
      { id: "t2", valor: 20, updatedAt: ANTES, updatedBy: "ana" },
      { id: "t3", valor: 30, updatedAt: ANTES, updatedBy: "ana" },
    ];
    const resultado = stampChangedRecords(anterior.filter(t => t.id !== "t2"), anterior, opts());

    expect(resultado.map(t => t.id)).toEqual(["t1", "t3"]);
    expect(resultado.every(t => t.updatedAt === ANTES)).toBe(true);
  });
});

describe("entidades sem carimbo, por decisão", () => {
  it("metas é mapa catId → limite e não recebe carimbo", () => {
    const resultado = stampChangedRecords({ cat1: 500 }, { cat1: 400 }, opts());
    expect(resultado).toEqual({ cat1: 500 });
  });

  it("saldosIniciais é mapa aninhado e não recebe carimbo", () => {
    const resultado = stampChangedRecords({ "2026-08": { cc1: 2500 } }, { "2026-08": { cc1: 2000 } }, opts());
    expect(resultado).toEqual({ "2026-08": { cc1: 2500 } });
  });

  it("escalar de params não recebe carimbo", () => {
    const resultado = stampChangedRecords({ moeda: "BRL", alertaLimite: 90 }, { moeda: "BRL", alertaLimite: 85 }, opts());
    expect(resultado).toEqual({ moeda: "BRL", alertaLimite: 90 });
  });
});

describe("primeira escrita e casos de borda", () => {
  it("carimba tudo quando não há estado anterior", () => {
    const resultado = stampChangedRecords([{ id: "t1" }, { id: "t2" }], undefined, opts());
    expect(resultado.every(t => t.updatedAt === AGORA)).toBe(true);
  });

  it("não quebra com lista vazia nem com valores primitivos", () => {
    expect(stampChangedRecords([], [], opts())).toEqual([]);
    expect(stampChangedRecords("jorge", "", opts())).toBe("jorge");
    expect(stampChangedRecords(null, undefined, opts())).toBeNull();
  });

  it("ignora itens sem id, mas ainda visita os aninhados deles", () => {
    const proximo = [{ semId: true, filhos: [{ id: "f1", valor: 1 }] }];
    const resultado = stampChangedRecords(proximo, [{ semId: true, filhos: [] }], opts());
    expect(resultado[0].updatedAt).toBeUndefined();
    expect(resultado[0].filhos[0]).toEqual({ id: "f1", valor: 1, ...carimbo() });
  });

  it("id numérico também identifica registro", () => {
    const resultado = stampChangedRecords([{ id: 7, valor: 1 }], [], opts());
    expect(resultado[0].updatedAt).toBe(AGORA);
  });

  it("carimba com usuário vazio quando ninguém se identificou", () => {
    const resultado = stampChangedRecords([{ id: "t1" }], [], { now: AGORA });
    expect(resultado[0].updatedBy).toBe("");
  });
});

describe("equalIgnoringStamp", () => {
  it("ignora apenas os campos de carimbo", () => {
    expect(equalIgnoringStamp(
      { id: "t1", valor: 10, updatedAt: AGORA, updatedBy: "jorge" },
      { id: "t1", valor: 10, updatedAt: ANTES, updatedBy: "ana" },
    )).toBe(true);

    expect(equalIgnoringStamp({ id: "t1", valor: 10 }, { id: "t1", valor: 11 })).toBe(false);
  });

  it("compara aninhados por valor, não por referência", () => {
    expect(equalIgnoringStamp({ a: [{ id: "x", v: 1 }] }, { a: [{ id: "x", v: 1 }] })).toBe(true);
    expect(equalIgnoringStamp({ a: [{ id: "x", v: 1 }] }, { a: [{ id: "x", v: 2 }] })).toBe(false);
  });

  it("campo ausente de um lado não é igual a campo presente do outro", () => {
    expect(equalIgnoringStamp({ id: "t1", valor: 10 }, { id: "t1" })).toBe(false);
    expect(equalIgnoringStamp({ id: "t1", obs: undefined }, { id: "t1", nota: undefined })).toBe(false);
  });
});
