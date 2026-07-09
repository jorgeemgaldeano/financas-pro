// transferService.test.js — v0.3.33
import { describe, it, expect } from "vitest";
import {
  createTransfer,
  removeTransfer,
  getTransferLegs,
  isTransferEligible,
  findTransferCandidates,
  linkAsTransfer,
  unlinkTransfer,
  detectTransferCandidates,
} from "../src/services/transferService.js";
import { somaReceitas, somaDespesas } from "../src/services/accountingService.js";

const contas = [
  { id: "cc1", nome: "Conta Corrente", tipo: "corrente" },
  { id: "cc2", nome: "Poupança", tipo: "corrente" },
  { id: "va1", nome: "Vale Alimentação", tipo: "vale_alimentacao" },
];

// genId determinístico para asserção estável.
function genIdFactory() {
  let n = 0;
  return (prefix) => `${prefix}${++n}`;
}

describe("createTransfer — par atômico", () => {
  it("gera duas pernas ligadas pelo mesmo transferId", () => {
    const res = createTransfer(
      { trans: [], contas },
      { contaOrigemId: "cc1", contaDestinoId: "cc2", valor: 300, data: "2026-07-08" },
      { genId: genIdFactory() }
    );
    expect(res.ok).toBe(true);
    expect(res.trans).toHaveLength(2);
    const legs = getTransferLegs(res.trans, res.transferId);
    expect(legs).toHaveLength(2);

    const saida = legs.find((t) => t.tipo === "despesa");
    const entrada = legs.find((t) => t.tipo === "receita");
    expect(saida.contaId).toBe("cc1");
    expect(saida.transferContraContaId).toBe("cc2");
    expect(saida.origem).toBe("corrente");
    expect(entrada.contaId).toBe("cc2");
    expect(entrada.transferContraContaId).toBe("cc1");
    // Ambas natureza transferencia, mesmo valor e data.
    for (const l of legs) {
      expect(l.natureza).toBe("transferencia");
      expect(l.valor).toBe(300);
      expect(l.data).toBe("2026-07-08");
      expect(l.competencia).toBe("2026-07");
      expect(l.status).toBe("pago");
      expect(l.valorPago).toBe(300);
      expect(l.cartaoId).toBeNull();
    }
  });

  it("mantém o alias EN (amount/accountId) via normalizeTransaction", () => {
    const res = createTransfer(
      { trans: [], contas },
      { contaOrigemId: "cc1", contaDestinoId: "cc2", valor: 150, data: "2026-07-08" },
      { genId: genIdFactory() }
    );
    const saida = res.trans.find((t) => t.tipo === "despesa");
    expect(saida.amount).toBe(150);
    expect(saida.accountId).toBe("cc1");
  });

  it("herda o tipo da conta na origem (vale) para o campo origem", () => {
    const res = createTransfer(
      { trans: [], contas },
      { contaOrigemId: "va1", contaDestinoId: "cc1", valor: 50, data: "2026-07-08" },
      { genId: genIdFactory() }
    );
    const saida = res.trans.find((t) => t.tipo === "despesa");
    expect(saida.origem).toBe("vale_alimentacao");
  });

  it("as pernas NÃO contam como receita/despesa contábil", () => {
    const res = createTransfer(
      { trans: [], contas },
      { contaOrigemId: "cc1", contaDestinoId: "cc2", valor: 300, data: "2026-07-08" },
      { genId: genIdFactory() }
    );
    expect(somaReceitas(res.trans)).toBe(0);
    expect(somaDespesas(res.trans)).toBe(0);
  });

  it("usa descrição padrão quando não informada", () => {
    const res = createTransfer(
      { trans: [], contas },
      { contaOrigemId: "cc1", contaDestinoId: "cc2", valor: 300, data: "2026-07-08" },
      { genId: genIdFactory() }
    );
    expect(res.trans.find((t) => t.tipo === "despesa").descricao).toContain("Poupança");
    expect(res.trans.find((t) => t.tipo === "receita").descricao).toContain("Conta Corrente");
  });
});

describe("createTransfer — validações", () => {
  const call = (input) => createTransfer({ trans: [], contas }, input, { genId: genIdFactory() });
  it("rejeita contas iguais", () => {
    expect(call({ contaOrigemId: "cc1", contaDestinoId: "cc1", valor: 10, data: "2026-07-08" }).reason).toBe("contas_iguais");
  });
  it("rejeita valor <= 0 ou inválido", () => {
    expect(call({ contaOrigemId: "cc1", contaDestinoId: "cc2", valor: 0, data: "2026-07-08" }).reason).toBe("valor_invalido");
    expect(call({ contaOrigemId: "cc1", contaDestinoId: "cc2", valor: -5, data: "2026-07-08" }).reason).toBe("valor_invalido");
    expect(call({ contaOrigemId: "cc1", contaDestinoId: "cc2", valor: NaN, data: "2026-07-08" }).reason).toBe("valor_invalido");
  });
  it("rejeita sem data e sem contas", () => {
    expect(call({ contaOrigemId: "cc1", contaDestinoId: "cc2", valor: 10 }).reason).toBe("data_obrigatoria");
    expect(call({ valor: 10, data: "2026-07-08" }).reason).toBe("contas_obrigatorias");
  });
  it("rejeita conta inexistente", () => {
    expect(call({ contaOrigemId: "cc1", contaDestinoId: "xxx", valor: 10, data: "2026-07-08" }).reason).toBe("conta_inexistente");
  });
  it("em falha, devolve trans inalterado", () => {
    const trans = [{ id: "x" }];
    const res = createTransfer({ trans, contas }, { contaOrigemId: "cc1", contaDestinoId: "cc1", valor: 10, data: "2026-07-08" });
    expect(res.trans).toBe(trans);
  });
});

describe("removeTransfer — remove as duas pernas como unidade", () => {
  it("remove ambas as pernas do transferId", () => {
    const criado = createTransfer(
      { trans: [{ id: "outro", tipo: "despesa", valor: 10 }], contas },
      { contaOrigemId: "cc1", contaDestinoId: "cc2", valor: 300, data: "2026-07-08" },
      { genId: genIdFactory() }
    );
    const res = removeTransfer({ trans: criado.trans }, criado.transferId);
    expect(res.ok).toBe(true);
    expect(res.removidas).toBe(2);
    expect(res.trans).toHaveLength(1);
    expect(res.trans[0].id).toBe("outro");
  });
  it("sinaliza transferência inexistente", () => {
    expect(removeTransfer({ trans: [] }, "tf999").reason).toBe("transferencia_inexistente");
    expect(removeTransfer({ trans: [] }, null).reason).toBe("transferId_obrigatorio");
  });

  it("createTransfer marca origem 'manual'", () => {
    const res = createTransfer(
      { trans: [], contas },
      { contaOrigemId: "cc1", contaDestinoId: "cc2", valor: 300, data: "2026-07-08" },
      { genId: genIdFactory() }
    );
    expect(res.trans.every((t) => t.transferOrigin === "manual")).toBe(true);
  });
});

describe("isTransferEligible", () => {
  it("aceita despesa/receita de conta ou vale", () => {
    expect(isTransferEligible({ tipo: "despesa", origem: "corrente", valor: 10 })).toBe(true);
    expect(isTransferEligible({ tipo: "receita", origem: "vale_alimentacao", valor: 10 })).toBe(true);
  });
  it("rejeita cartão, fatura, parcela e já-transferência", () => {
    expect(isTransferEligible({ tipo: "despesa", origem: "cartao" })).toBe(false);
    expect(isTransferEligible({ tipo: "despesa", natureza: "fatura_cartao" })).toBe(false);
    expect(isTransferEligible({ tipo: "despesa", natureza: "ajuste_fatura_cartao" })).toBe(false);
    expect(isTransferEligible({ tipo: "despesa", totalParcelas: 3 })).toBe(false);
    expect(isTransferEligible({ tipo: "despesa", natureza: "transferencia" })).toBe(false);
    expect(isTransferEligible({ tipo: "despesa", transferId: "tf1" })).toBe(false);
  });
});

const existentes = [
  { id: "d1", tipo: "despesa", origem: "corrente", contaId: "cc1", valor: 200, data: "2026-07-05" },
  { id: "r1", tipo: "receita", origem: "corrente", contaId: "cc2", valor: 200, data: "2026-07-06" },
  { id: "r2", tipo: "receita", origem: "corrente", contaId: "cc2", valor: 999, data: "2026-07-06" }, // valor diferente
  { id: "r3", tipo: "receita", origem: "corrente", contaId: "cc1", valor: 200, data: "2026-07-06" }, // mesma conta
];

describe("findTransferCandidates", () => {
  it("lista só contraparte de tipo oposto, conta diferente e mesmo valor", () => {
    const cands = findTransferCandidates(existentes, "d1").map((t) => t.id);
    expect(cands).toEqual(["r1"]);
  });
});

describe("linkAsTransfer — associa existentes", () => {
  it("associa despesa+receita preservando os originais", () => {
    const res = linkAsTransfer({ trans: existentes }, { despesaId: "d1", receitaId: "r1" }, { genId: genIdFactory() });
    expect(res.ok).toBe(true);
    const legs = getTransferLegs(res.trans, res.transferId);
    expect(legs.map((l) => l.id).sort()).toEqual(["d1", "r1"]);
    for (const l of legs) {
      expect(l.natureza).toBe("transferencia");
      expect(l.transferOrigin).toBe("vinculo");
      expect(l.valor).toBe(200); // valor original preservado
    }
    expect(res.trans.find((t) => t.id === "d1").transferContraContaId).toBe("cc2");
    expect(res.trans.find((t) => t.id === "r1").transferContraContaId).toBe("cc1");
    // demais intactos
    expect(res.trans.find((t) => t.id === "r2").natureza).toBeUndefined();
  });
  it("rejeita valores diferentes", () => {
    expect(linkAsTransfer({ trans: existentes }, { despesaId: "d1", receitaId: "r2" }).reason).toBe("valores_diferentes");
  });
  it("rejeita mesma conta", () => {
    expect(linkAsTransfer({ trans: existentes }, { despesaId: "d1", receitaId: "r3" }).reason).toBe("mesma_conta");
  });
  it("rejeita tipos invertidos/iguais", () => {
    expect(linkAsTransfer({ trans: existentes }, { despesaId: "r1", receitaId: "d1" }).reason).toBe("tipos_invalidos");
    expect(linkAsTransfer({ trans: existentes }, { despesaId: "d1", receitaId: "d1" }).reason).toBe("mesmo_lancamento");
  });
});

describe("detectTransferCandidates — auto-detecção na importação", () => {
  // Importados na conta cc1 (débitos), existentes em cc2 (créditos).
  const base = [
    { id: "ex1", tipo: "receita", origem: "corrente", contaId: "cc2", valor: 500, data: "2026-07-06" },
    { id: "ex2", tipo: "receita", origem: "corrente", contaId: "cc2", valor: 999, data: "2026-07-06" },
    { id: "exMesmaConta", tipo: "receita", origem: "corrente", contaId: "cc1", valor: 500, data: "2026-07-06" },
    { id: "imp1", tipo: "despesa", origem: "corrente", contaId: "cc1", valor: 500, data: "2026-07-07", importado: true },
    { id: "imp2", tipo: "despesa", origem: "corrente", contaId: "cc1", valor: 777, data: "2026-07-07", importado: true },
  ];
  it("casa importado com existente de outra conta, mesmo valor, dentro da janela", () => {
    const pares = detectTransferCandidates(base, ["imp1", "imp2"], { janelaDias: 3 });
    expect(pares).toHaveLength(1);
    expect(pares[0]).toMatchObject({ importadaId: "imp1", existenteId: "ex1", despesaId: "imp1", receitaId: "ex1", valor: 500 });
  });
  it("respeita a janela de dias", () => {
    const longe = base.map((t) => (t.id === "imp1" ? { ...t, data: "2026-07-20" } : t));
    expect(detectTransferCandidates(longe, ["imp1", "imp2"], { janelaDias: 3 })).toHaveLength(0);
  });
  it("não casa dentro da mesma conta", () => {
    const pares = detectTransferCandidates(base, ["imp1"], { janelaDias: 3 });
    expect(pares.map((p) => p.existenteId)).not.toContain("exMesmaConta");
  });
  it("não reusa o mesmo existente para dois importados", () => {
    const dois = [
      ...base,
      { id: "imp3", tipo: "despesa", origem: "corrente", contaId: "cc1", valor: 500, data: "2026-07-08", importado: true },
    ];
    const pares = detectTransferCandidates(dois, ["imp1", "imp3"], { janelaDias: 5 });
    const existentesUsados = pares.map((p) => p.existenteId);
    expect(new Set(existentesUsados).size).toBe(existentesUsados.length); // sem repetição
    expect(pares).toHaveLength(1); // só há um ex1 de valor 500
  });
});

describe("unlinkTransfer — desvincula sem apagar", () => {
  it("remove os campos de transferência mantendo as transações", () => {
    const linked = linkAsTransfer({ trans: existentes }, { despesaId: "d1", receitaId: "r1" }, { genId: genIdFactory() });
    const res = unlinkTransfer({ trans: linked.trans }, linked.transferId);
    expect(res.ok).toBe(true);
    expect(res.desassociadas).toBe(2);
    expect(res.trans).toHaveLength(existentes.length); // nada foi apagado
    const d1 = res.trans.find((t) => t.id === "d1");
    expect(d1.natureza).toBeUndefined();
    expect(d1.transferId).toBeUndefined();
    expect(d1.transferContraContaId).toBeUndefined();
    expect(d1.transferOrigin).toBeUndefined();
    expect(d1.tipo).toBe("despesa"); // volta a lançamento normal
  });
});
