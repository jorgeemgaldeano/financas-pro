// cofrinhoService.test.js — v0.3.34 (DEC-0035 / RN032)
import { describe, it, expect } from "vitest";
import {
  saldoCofrinho,
  statusCofrinho,
  simularAporteMensal,
  createCofrinho,
  deleteCofrinho,
  setArquivadoCofrinho,
  addMovimentoCofrinho,
  removeMovimentoCofrinho,
} from "../src/services/cofrinhoService.js";

let seq = 0;
const uid = () => `id${++seq}`;

const mkCofrinho = (over = {}) => ({
  id: "cof1",
  nome: "Viagem",
  valorAlvo: 1200,
  dataAlvo: "2026-12-01",
  aportes: [],
  ...over,
});

describe("saldoCofrinho", () => {
  it("soma aportes e subtrai retiradas", () => {
    const c = mkCofrinho({
      aportes: [
        { id: "a1", tipo: "aporte", valor: 100 },
        { id: "a2", tipo: "aporte", valor: 50 },
        { id: "a3", tipo: "retirada", valor: 30 },
      ],
    });
    expect(saldoCofrinho(c)).toBe(120);
  });

  it("retorna 0 sem aportes", () => {
    expect(saldoCofrinho(mkCofrinho())).toBe(0);
  });
});

describe("statusCofrinho", () => {
  it("concluído quando saldoAtual >= valorAlvo", () => {
    const c = mkCofrinho({ valorAlvo: 100, aportes: [{ id: "a1", tipo: "aporte", valor: 100 }] });
    expect(statusCofrinho(c, "2026-08")).toBe("concluido");
  });

  it("em dia quando dataAlvo é meses à frente e meta não atingida", () => {
    const c = mkCofrinho({ dataAlvo: "2026-12-01" });
    expect(statusCofrinho(c, "2026-08")).toBe("em_dia");
  });

  it("atrasado quando dataAlvo é o mês de referência e meta não atingida", () => {
    const c = mkCofrinho({ dataAlvo: "2026-08-15" });
    expect(statusCofrinho(c, "2026-08")).toBe("atrasado");
  });

  it("atrasado quando dataAlvo já passou e meta não atingida", () => {
    const c = mkCofrinho({ dataAlvo: "2026-05-01" });
    expect(statusCofrinho(c, "2026-08")).toBe("atrasado");
  });
});

describe("simularAporteMensal", () => {
  it("em dia: divide o restante pelos meses até a dataAlvo", () => {
    const c = mkCofrinho({ valorAlvo: 1200, dataAlvo: "2026-12-01", aportes: [{ id: "a1", tipo: "aporte", valor: 200 }] });
    const sim = simularAporteMensal(c, "2026-08");
    expect(sim.status).toBe("em_dia");
    expect(sim.restante).toBe(1000);
    expect(sim.mesesRestantes).toBe(4);
    expect(sim.aporteSugerido).toBe(250);
    expect(sim.projecaoMes).toBe("2026-12");
  });

  it("concluído: sem sugestão de aporte, restante zero", () => {
    const c = mkCofrinho({ valorAlvo: 500, aportes: [{ id: "a1", tipo: "aporte", valor: 500 }] });
    const sim = simularAporteMensal(c, "2026-08");
    expect(sim.status).toBe("concluido");
    expect(sim.restante).toBe(0);
    expect(sim.aporteSugerido).toBe(0);
    expect(sim.mesesRestantes).toBe(0);
  });

  it("atrasado: nunca divide por zero, recalcula como se a meta fosse o mês seguinte", () => {
    const c = mkCofrinho({ valorAlvo: 1000, dataAlvo: "2026-05-01", aportes: [{ id: "a1", tipo: "aporte", valor: 100 }] });
    const sim = simularAporteMensal(c, "2026-08");
    expect(sim.status).toBe("atrasado");
    expect(sim.mesesRestantes).toBe(1);
    expect(sim.aporteSugerido).toBe(900);
    expect(Number.isFinite(sim.aporteSugerido)).toBe(true);
    expect(sim.projecaoMes).toBe("2026-09");
  });

  it("atrasado: aporte sugerido nunca é negativo mesmo se saldo já superou parcialmente", () => {
    const c = mkCofrinho({ valorAlvo: 100, dataAlvo: "2026-05-01", aportes: [{ id: "a1", tipo: "aporte", valor: 90 }] });
    const sim = simularAporteMensal(c, "2026-08");
    expect(sim.aporteSugerido).toBeGreaterThanOrEqual(0);
    expect(sim.restante).toBe(10);
  });

  it("dataAlvo no mesmo mês de referência não quebra (divisão por zero) — vira atrasado", () => {
    const c = mkCofrinho({ valorAlvo: 500, dataAlvo: "2026-08-20" });
    const sim = simularAporteMensal(c, "2026-08");
    expect(sim.status).toBe("atrasado");
    expect(sim.mesesRestantes).toBe(1);
    expect(Number.isFinite(sim.aporteSugerido)).toBe(true);
  });
});

describe("createCofrinho", () => {
  it("cria cofrinho com ledger vazio", () => {
    const res = createCofrinho({ cofrinhos: [] }, { nome: "Viagem", valorAlvo: 1000, dataAlvo: "2026-12-01", uid });
    expect(res.ok).toBe(true);
    expect(res.cofrinhos).toHaveLength(1);
    expect(res.cofrinhos[0].aportes).toEqual([]);
    expect(res.cofrinhos[0].arquivado).toBe(false);
  });

  it("preserva o estado de entrada (não muta)", () => {
    const cofrinhos = [mkCofrinho()];
    const res = createCofrinho({ cofrinhos }, { nome: "Carro", valorAlvo: 500, dataAlvo: "2026-12-01", uid });
    expect(cofrinhos).toHaveLength(1);
    expect(res.cofrinhos).toHaveLength(2);
    expect(res.cofrinhos[0]).toBe(cofrinhos[0]);
  });

  it("rejeita nome vazio, valor inválido ou data ausente", () => {
    expect(createCofrinho({ cofrinhos: [] }, { nome: "", valorAlvo: 100, dataAlvo: "2026-12-01", uid }).reason).toBe("missing_name");
    expect(createCofrinho({ cofrinhos: [] }, { nome: "X", valorAlvo: 0, dataAlvo: "2026-12-01", uid }).reason).toBe("invalid_amount");
    expect(createCofrinho({ cofrinhos: [] }, { nome: "X", valorAlvo: 100, uid }).reason).toBe("missing_date");
  });
});

describe("deleteCofrinho / setArquivadoCofrinho", () => {
  it("remove o cofrinho pelo id", () => {
    const cofrinhos = [mkCofrinho({ id: "cof1" }), mkCofrinho({ id: "cof2" })];
    const res = deleteCofrinho({ cofrinhos }, { id: "cof1" });
    expect(res.ok).toBe(true);
    expect(res.cofrinhos.map((c) => c.id)).toEqual(["cof2"]);
  });

  it("retorna not_found para id inexistente", () => {
    expect(deleteCofrinho({ cofrinhos: [] }, { id: "zzz" }).reason).toBe("not_found");
  });

  it("arquiva/desarquiva sem remover", () => {
    const cofrinhos = [mkCofrinho({ id: "cof1" })];
    const res = setArquivadoCofrinho({ cofrinhos }, { id: "cof1", arquivado: true });
    expect(res.ok).toBe(true);
    expect(res.cofrinhos[0].arquivado).toBe(true);
  });
});

describe("addMovimentoCofrinho", () => {
  it("registra aporte no ledger", () => {
    const cofrinhos = [mkCofrinho()];
    const res = addMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "cof1", valor: 100, data: "2026-08-10", tipo: "aporte", uid });
    expect(res.ok).toBe(true);
    expect(res.cofrinhos[0].aportes).toHaveLength(1);
    expect(res.cofrinhos[0].aportes[0].tipo).toBe("aporte");
  });

  it("registra retirada quando há saldo suficiente", () => {
    const cofrinhos = [mkCofrinho({ aportes: [{ id: "a1", tipo: "aporte", valor: 100 }] })];
    const res = addMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "cof1", valor: 50, data: "2026-08-10", tipo: "retirada", uid });
    expect(res.ok).toBe(true);
    expect(saldoCofrinho(res.cofrinhos[0])).toBe(50);
  });

  it("bloqueia retirada que deixaria o saldo negativo", () => {
    const cofrinhos = [mkCofrinho({ aportes: [{ id: "a1", tipo: "aporte", valor: 30 }] })];
    const res = addMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "cof1", valor: 50, data: "2026-08-10", tipo: "retirada", uid });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("insufficient_balance");
  });

  it("rejeita valor zero/negativo, data ausente, tipo inválido ou cofrinho inexistente", () => {
    const cofrinhos = [mkCofrinho()];
    expect(addMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "cof1", valor: 0, data: "2026-08-10", tipo: "aporte", uid }).reason).toBe("invalid_amount");
    expect(addMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "cof1", valor: 10, tipo: "aporte", uid }).reason).toBe("missing_date");
    expect(addMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "cof1", valor: 10, data: "2026-08-10", tipo: "x", uid }).reason).toBe("invalid_type");
    expect(addMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "zzz", valor: 10, data: "2026-08-10", tipo: "aporte", uid }).reason).toBe("not_found");
  });

  it("preserva o estado de entrada (não muta)", () => {
    const cofrinhos = [mkCofrinho()];
    addMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "cof1", valor: 10, data: "2026-08-10", tipo: "aporte", uid });
    expect(cofrinhos[0].aportes).toHaveLength(0);
  });
});

describe("removeMovimentoCofrinho", () => {
  it("remove um movimento específico do ledger", () => {
    const cofrinhos = [mkCofrinho({ aportes: [{ id: "a1", tipo: "aporte", valor: 100 }, { id: "a2", tipo: "aporte", valor: 50 }] })];
    const res = removeMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "cof1", movimentoId: "a1" });
    expect(res.ok).toBe(true);
    expect(res.cofrinhos[0].aportes).toHaveLength(1);
    expect(res.cofrinhos[0].aportes[0].id).toBe("a2");
  });

  it("retorna not_found para cofrinho ou movimento inexistente", () => {
    const cofrinhos = [mkCofrinho({ aportes: [{ id: "a1", tipo: "aporte", valor: 100 }] })];
    expect(removeMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "zzz", movimentoId: "a1" }).reason).toBe("not_found");
    expect(removeMovimentoCofrinho({ cofrinhos }, { cofrinhoId: "cof1", movimentoId: "zzz" }).reason).toBe("not_found");
  });
});
