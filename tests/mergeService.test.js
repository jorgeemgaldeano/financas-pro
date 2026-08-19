// mergeService.test.js — v0.3.38 Fase 4 (DEC-0039, DEC-0044, DEC-0045)
//
// Bateria escrita antes do código para a mecânica original, e endurecida
// depois da revisão do guardiao-localstorage e do especialista-financas
// (DEC-0045): cobre os 5 cenários do roadmap, os de auto-resolve/conflito de
// mapa/colisão de id, e os 4 cenários de "quase perda de dado" que a revisão
// exigiu antes de aprovar mesclagem de dados financeiros reais — chave
// ausente, id duplicado, caminho com caracteres especiais, escolhas
// incompletas. O aceite do módulo é o mesmo da Fase 4: nenhum cenário perde
// dado sem o usuário ter escolhido, e nada gravável sai sem passar por
// `finalizarMerge`.
import { describe, it, expect } from "vitest";
import { mergeTresVias, aplicarEscolhas, finalizarMerge } from "../src/services/mergeService.js";

describe("registro alterado só de um lado (auto-resolve)", () => {
  it("aplica a edição local quando o remoto não mudou", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100, updatedAt: "2026-08-01" }] };
    const local = { trans: [{ id: "t1", valor: 250, updatedAt: "2026-08-18" }] };
    const remoto = { trans: [{ id: "t1", valor: 100, updatedAt: "2026-08-01" }] };
    const { ok, preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(ok).toBe(true);
    expect(conflitos).toEqual([]);
    expect(preliminar.trans).toEqual([{ id: "t1", valor: 250, updatedAt: "2026-08-18" }]);
  });

  it("aplica a edição remota quando o local não mudou", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }] };
    const local = { trans: [{ id: "t1", valor: 100 }] };
    const remoto = { trans: [{ id: "t1", valor: 400 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toEqual([]);
    expect(preliminar.trans).toEqual([{ id: "t1", valor: 400 }]);
  });
});

describe("registro alterado dos dois lados, valores diferentes (conflito real)", () => {
  it("nunca resolve por data — sempre vira conflito, mesmo com updatedAt divergente", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100, updatedAt: "2026-08-01" }] };
    const local = { trans: [{ id: "t1", valor: 250, updatedAt: "2026-08-18T10:00:00" }] };
    const remoto = { trans: [{ id: "t1", valor: 300, updatedAt: "2026-08-18T09:00:00" }] };
    const { conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toHaveLength(1);
    // Conflito isolado no campo, não no registro inteiro — mesma lógica que
    // resolve sozinha o cenário de aninhados (ver describe abaixo).
    expect(conflitos[0]).toMatchObject({ rotulo: "trans[t1].valor", chave: "trans", tipo: "valor" });
    expect(conflitos[0].local).toBe(250);
    expect(conflitos[0].remoto).toBe(300);
  });

  it("os dois mudaram para o mesmo valor: convergiram, sem conflito", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }] };
    const local = { trans: [{ id: "t1", valor: 250 }] };
    const remoto = { trans: [{ id: "t1", valor: 250 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toEqual([]);
    expect(preliminar.trans).toEqual([{ id: "t1", valor: 250 }]);
  });
});

describe("apagado de um lado, editado do outro (conflito, não exclusão silenciosa)", () => {
  it("registra conflito de registro em vez de aplicar a exclusão", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }] };
    const local = { trans: [] }; // apagou localmente
    const remoto = { trans: [{ id: "t1", valor: 500 }] }; // editou no outro dispositivo
    const { conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toHaveLength(1);
    expect(conflitos[0].tipo).toBe("registro");
    expect(conflitos[0].local).toBeUndefined();
    expect(conflitos[0].remoto).toEqual({ id: "t1", valor: 500 });
  });
});

describe("apagado dos dois lados", () => {
  it("converge sem conflito e sem o registro no resultado", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }, { id: "t2", valor: 50 }] };
    const local = { trans: [{ id: "t2", valor: 50 }] };
    const remoto = { trans: [{ id: "t2", valor: 50 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toEqual([]);
    expect(preliminar.trans).toEqual([{ id: "t2", valor: 50 }]);
  });
});

describe("aninhado alterado em filhos diferentes do mesmo pai (auto-resolve recursivo)", () => {
  it("mescla dividas[].amortizacoes sem marcar a dívida inteira como conflito", () => {
    const ancestral = {
      dividas: [{ id: "d1", nome: "Financiamento", amortizacoes: [{ id: "a1", valor: 10 }] }],
    };
    const local = {
      dividas: [{ id: "d1", nome: "Financiamento", amortizacoes: [{ id: "a1", valor: 10 }, { id: "a2", valor: 20 }] }],
    };
    const remoto = {
      dividas: [{ id: "d1", nome: "Financiamento renegociado", amortizacoes: [{ id: "a1", valor: 10 }] }],
    };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toEqual([]);
    expect(preliminar.dividas[0].nome).toBe("Financiamento renegociado"); // só remoto mudou
    expect(preliminar.dividas[0].amortizacoes).toEqual([{ id: "a1", valor: 10 }, { id: "a2", valor: 20 }]); // só local mudou
  });

  it("isola o campo realmente conflitante do aninhado auto-mesclável", () => {
    const ancestral = { dividas: [{ id: "d1", nome: "Financiamento", amortizacoes: [] }] };
    const local = { dividas: [{ id: "d1", nome: "Financiamento A", amortizacoes: [{ id: "a1", valor: 10 }] }] };
    const remoto = { dividas: [{ id: "d1", nome: "Financiamento B", amortizacoes: [{ id: "a1", valor: 10 }] }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toHaveLength(1);
    expect(conflitos[0].rotulo).toBe("dividas[d1].nome");
    // o aninhado que os dois concordaram foi aplicado sem virar conflito
    expect(preliminar.dividas[0].amortizacoes).toEqual([{ id: "a1", valor: 10 }]);
  });
});

describe("mapa sem id (metas, saldosIniciais) com a mesma chave em conflito", () => {
  it("conflito por chave de mapa, não por registro", () => {
    const ancestral = { metas: { Alimentacao: 800 } };
    const local = { metas: { Alimentacao: 1000 } };
    const remoto = { metas: { Alimentacao: 1200 } };
    const { conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toHaveLength(1);
    expect(conflitos[0]).toMatchObject({ rotulo: "metas.Alimentacao", chave: "metas", tipo: "valor" });
  });

  it("chave nova de mapa só de um lado é auto-resolvida", () => {
    const ancestral = { saldosIniciais: { "2026-08": { conta1: 500 } } };
    const local = { saldosIniciais: { "2026-08": { conta1: 500 }, "2026-09": { conta1: 700 } } };
    const remoto = { saldosIniciais: { "2026-08": { conta1: 500 } } };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toEqual([]);
    expect(preliminar.saldosIniciais["2026-09"]).toEqual({ conta1: 700 });
  });

  it("chave removida dos dois lados desaparece de verdade, sem sobrar como undefined (R2)", () => {
    const ancestral = { metas: { Alimentacao: 800, Lazer: 200 } };
    const local = { metas: { Alimentacao: 800 } };
    const remoto = { metas: { Alimentacao: 800 } };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toEqual([]);
    expect(preliminar.metas).toStrictEqual({ Alimentacao: 800 });
    expect(Object.prototype.hasOwnProperty.call(preliminar.metas, "Lazer")).toBe(false);
  });
});

describe("registro novo com id colidido, criado nos dois lados", () => {
  it("valores idênticos convergem sem conflito", () => {
    const ancestral = { pessoas: [] };
    const local = { pessoas: [{ id: "p1", nome: "Ana" }] };
    const remoto = { pessoas: [{ id: "p1", nome: "Ana" }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toEqual([]);
    expect(preliminar.pessoas).toEqual([{ id: "p1", nome: "Ana" }]);
  });

  it("valores diferentes viram conflito, não sobrescrita silenciosa", () => {
    const ancestral = { pessoas: [] };
    const local = { pessoas: [{ id: "p1", nome: "Ana" }] };
    const remoto = { pessoas: [{ id: "p1", nome: "Beatriz" }] };
    const { conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toHaveLength(1);
    // Isolado no campo "nome", já que o registro existe dos dois lados — só
    // vira conflito de registro inteiro quando um lado apagou (ver acima).
    expect(conflitos[0]).toMatchObject({ rotulo: "pessoas[p1].nome", tipo: "valor" });
  });
});

describe("nenhum lado mudou nada em relação ao ancestral", () => {
  it("resultado igual ao ancestral, sem conflito", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }], metas: { Lazer: 200 } };
    const local = { trans: [{ id: "t1", valor: 100 }], metas: { Lazer: 200 } };
    const remoto = { trans: [{ id: "t1", valor: 100 }], metas: { Lazer: 200 } };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toEqual([]);
    expect(preliminar).toStrictEqual(ancestral);
  });
});

describe("DEC-0045 B1 — payload estruturalmente inconsistente é recusado, nunca mesclado como exclusão", () => {
  it("recusa quando uma chave existe em local/ancestral mas falta no remoto", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }], cofrinhos: [{ id: "c1", aportes: [] }] };
    const local = { trans: [{ id: "t1", valor: 100 }], cofrinhos: [{ id: "c1", aportes: [] }] };
    const remoto = { trans: [{ id: "t1", valor: 100 }] }; // payload de um dispositivo com build antiga, sem "cofrinhos"
    const { ok, motivo, problemas } = mergeTresVias({ local, remoto, ancestral });
    expect(ok).toBe(false);
    expect(motivo).toBe("payload_invalido");
    expect(problemas.join(" ")).toMatch(/cofrinhos/);
  });

  it("recusa quando o formato da chave diverge entre os payloads (array x objeto)", () => {
    const ancestral = { trans: [] };
    const local = { trans: [] };
    const remoto = { trans: { 0: { id: "t1", valor: 100 } } }; // serializado como objeto indexado
    const { ok, motivo } = mergeTresVias({ local, remoto, ancestral });
    expect(ok).toBe(false);
    expect(motivo).toBe("payload_invalido");
  });
});

describe("DEC-0045 B2 — array de registros malformado é recusado, não silenciosamente reduzido", () => {
  it("recusa quando há id duplicado no mesmo array", () => {
    const ancestral = { trans: [] };
    const local = { trans: [{ id: "t1", valor: 100 }, { id: "t1", valor: 999 }] };
    const remoto = { trans: [] };
    const { ok, motivo, problemas } = mergeTresVias({ local, remoto, ancestral });
    expect(ok).toBe(false);
    expect(motivo).toBe("payload_invalido");
    expect(problemas.join(" ")).toMatch(/id duplicado/);
  });

  it("recusa quando o array mistura registros com id e itens sem id", () => {
    const ancestral = { trans: [] };
    const local = { trans: [{ id: "t1", valor: 100 }, { valor: 999 }] };
    const remoto = { trans: [] };
    const { ok, motivo } = mergeTresVias({ local, remoto, ancestral });
    expect(ok).toBe(false);
    expect(motivo).toBe("payload_invalido");
  });
});

describe("DEC-0045 B3 — chave/id com caracteres especiais não corrompe a aplicação da escolha", () => {
  it("aplica a escolha corretamente numa chave de mapa com ponto", () => {
    const ancestral = { metas: { "Cont. Agua": 100 } };
    const local = { metas: { "Cont. Agua": 150 } };
    const remoto = { metas: { "Cont. Agua": 200 } };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toHaveLength(1);
    const final = aplicarEscolhas(preliminar, conflitos, ["remoto"]);
    expect(final.metas["Cont. Agua"]).toBe(200);
  });

  it("aplica a escolha corretamente num id de registro com colchetes", () => {
    const ancestral = { trans: [{ id: "t[1]", valor: 100 }] };
    const local = { trans: [{ id: "t[1]", valor: 150 }] };
    const remoto = { trans: [{ id: "t[1]", valor: 200 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toHaveLength(1);
    const final = aplicarEscolhas(preliminar, conflitos, ["local"]);
    expect(final.trans.find((t) => t.id === "t[1]").valor).toBe(150);
  });

  it("não confunde id numérico com id string equivalente", () => {
    const ancestral = { trans: [{ id: 1, valor: 100 }, { id: "1", valor: 500 }] };
    const local = { trans: [{ id: 1, valor: 150 }, { id: "1", valor: 500 }] };
    const remoto = { trans: [{ id: 1, valor: 200 }, { id: "1", valor: 500 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toHaveLength(1);
    const final = aplicarEscolhas(preliminar, conflitos, ["remoto"]);
    expect(final.trans.find((t) => t.id === 1).valor).toBe(200);
    expect(final.trans.find((t) => t.id === "1").valor).toBe(500); // intocado
  });
});

describe("DEC-0045 B4 — aplicarEscolhas nunca assume 'local' por padrão", () => {
  const ancestral = { trans: [{ id: "t1", valor: 100 }] };
  const local = { trans: [{ id: "t1", valor: 250 }] };
  const remoto = { trans: [{ id: "t1", valor: 300 }] };

  it("lança erro quando faltam escolhas", () => {
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(() => aplicarEscolhas(preliminar, conflitos, [])).toThrow(/incompletas/);
  });

  it("lança erro quando a escolha não é 'local' nem 'remoto'", () => {
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(() => aplicarEscolhas(preliminar, conflitos, ["talvez"])).toThrow(/inválida/);
    expect(() => aplicarEscolhas(preliminar, conflitos, [undefined])).toThrow(/inválida/);
  });
});

describe("DEC-0045 B5 / finalizarMerge — único caminho que produz payload gravável", () => {
  it("libera direto quando não há conflitos", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }] };
    const local = { trans: [{ id: "t1", valor: 250 }] };
    const remoto = { trans: [{ id: "t1", valor: 100 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    const final = finalizarMerge({ preliminar, conflitos, escolhas: undefined });
    expect(final.ok).toBe(true);
    expect(final.payload.trans[0].valor).toBe(250);
  });

  it("recusa liberar payload quando há conflito pendente sem escolhas", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }] };
    const local = { trans: [{ id: "t1", valor: 250 }] };
    const remoto = { trans: [{ id: "t1", valor: 300 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    const final = finalizarMerge({ preliminar, conflitos, escolhas: undefined });
    expect(final.ok).toBe(false);
    expect(final.motivo).toBe("conflitos_pendentes");
  });

  it("libera depois das escolhas, quando os invariantes financeiros fecham", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100, status: "previsto", valorPago: 0 }] };
    const local = { trans: [{ id: "t1", valor: 250, status: "previsto", valorPago: 0 }] };
    const remoto = { trans: [{ id: "t1", valor: 300, status: "previsto", valorPago: 0 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    const final = finalizarMerge({ preliminar, conflitos, escolhas: ["remoto"] });
    expect(final.ok).toBe(true);
    expect(final.payload.trans[0].valor).toBe(300);
  });

  it("bloqueia quando o merge campo a campo produz uma transação financeiramente incoerente", () => {
    // Caso demonstrado pelo especialista-financas: baixa total de um lado +
    // correção de valor do outro, mesclados campo a campo, sem conflito.
    const ancestral = { trans: [{ id: "t1", valor: 500, status: "previsto", valorPago: 0 }] };
    const local = { trans: [{ id: "t1", valor: 500, status: "pago", valorPago: 500 }] };
    const remoto = { trans: [{ id: "t1", valor: 800, status: "previsto", valorPago: 0 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    expect(conflitos).toEqual([]); // confirma que o merge por si só não detectou nada
    const final = finalizarMerge({ preliminar, conflitos, escolhas: undefined });
    expect(final.ok).toBe(false);
    expect(final.motivo).toBe("invariante_financeira_violada");
    expect(final.violacoes.some((v) => v.tipo === "transacao_paga_incoerente")).toBe(true);
  });
});

describe("aplicarEscolhas", () => {
  it("aplica a escolha do usuário por um conflito de valor simples", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }] };
    const local = { trans: [{ id: "t1", valor: 250 }] };
    const remoto = { trans: [{ id: "t1", valor: 300 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    const final = aplicarEscolhas(preliminar, conflitos, ["remoto"]);
    expect(final.trans[0].valor).toBe(300);
  });

  it("aplica a escolha do usuário por um conflito de registro (apagado vs editado)", () => {
    const ancestral = { trans: [{ id: "t1", valor: 100 }] };
    const local = { trans: [] };
    const remoto = { trans: [{ id: "t1", valor: 500 }] };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });

    const mantendoExclusao = aplicarEscolhas(preliminar, conflitos, ["local"]);
    expect(mantendoExclusao.trans).toEqual([]);

    const mantendoEdicao = aplicarEscolhas(preliminar, conflitos, ["remoto"]);
    expect(mantendoEdicao.trans).toEqual([{ id: "t1", valor: 500 }]);
  });

  it("aplica a escolha do usuário por um conflito de mapa sem id", () => {
    const ancestral = { metas: { Alimentacao: 800 } };
    const local = { metas: { Alimentacao: 1000 } };
    const remoto = { metas: { Alimentacao: 1200 } };
    const { preliminar, conflitos } = mergeTresVias({ local, remoto, ancestral });
    const final = aplicarEscolhas(preliminar, conflitos, ["local"]);
    expect(final.metas.Alimentacao).toBe(1000);
  });
});
