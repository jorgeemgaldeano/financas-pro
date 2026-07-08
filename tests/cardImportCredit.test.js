import { describe, it, expect } from "vitest";
import {
  CARD_CREDIT_TYPES,
  classifyImportedCardCreditRows,
  isCardCreditDiscardedOnImport,
  isCardCreditRowBlocked,
  resolveCardCreditCompetencia,
  suggestCardCreditType,
} from "../src/services/cardImportService.js";

describe("classifyImportedCardCreditRows", () => {
  it("não marca linhas de despesa", () => {
    const rows = [{ _id: "1", tipo: "despesa", valor: 100 }];
    const result = classifyImportedCardCreditRows(rows);
    expect(result[0]._cardCreditNeedsReview).toBeUndefined();
  });

  it("marca crédito sem classificação como pendente de revisão", () => {
    const rows = [{ _id: "1", tipo: "receita", valor: 100 }];
    const result = classifyImportedCardCreditRows(rows);
    expect(result[0]._cardCreditNeedsReview).toBe(true);
  });

  it("libera crédito classificado como pagamento da fatura anterior sem exigir competência", () => {
    const rows = [{ _id: "1", tipo: "receita", valor: 100, creditoTipo: CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR }];
    const result = classifyImportedCardCreditRows(rows);
    expect(result[0]._cardCreditNeedsReview).toBe(false);
  });

  it("mantém bloqueado crédito de estorno/parcelamento sem competência de destino", () => {
    const rows = [{ _id: "1", tipo: "receita", valor: 100, creditoTipo: CARD_CREDIT_TYPES.ESTORNO }];
    const result = classifyImportedCardCreditRows(rows);
    expect(result[0]._cardCreditNeedsReview).toBe(true);
  });

  it("libera crédito de estorno com competência de destino informada", () => {
    const rows = [{ _id: "1", tipo: "receita", valor: 100, creditoTipo: CARD_CREDIT_TYPES.ESTORNO, creditoCompetencia: "2026-05" }];
    const result = classifyImportedCardCreditRows(rows);
    expect(result[0]._cardCreditNeedsReview).toBe(false);
  });
});

describe("isCardCreditRowBlocked", () => {
  it("despesa nunca bloqueia", () => {
    expect(isCardCreditRowBlocked({ tipo: "despesa" })).toBe(false);
  });

  it("receita sem creditoTipo bloqueia", () => {
    expect(isCardCreditRowBlocked({ tipo: "receita" })).toBe(true);
  });

  it("parcelamento_avista sem competência bloqueia", () => {
    expect(isCardCreditRowBlocked({ tipo: "receita", creditoTipo: CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA })).toBe(true);
  });

  it("parcelamento_avista com competência libera", () => {
    expect(isCardCreditRowBlocked({ tipo: "receita", creditoTipo: CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA, creditoCompetencia: "2026-04" })).toBe(false);
  });
});

describe("resolveCardCreditCompetencia", () => {
  it("despesa usa competência própria ou a do lote", () => {
    expect(resolveCardCreditCompetencia({ tipo: "despesa", competencia: "2026-06" }, "2026-07")).toBe("2026-06");
    expect(resolveCardCreditCompetencia({ tipo: "despesa" }, "2026-07")).toBe("2026-07");
  });

  it("pagamento_fatura_anterior não precisa de competência de destino (linha é descartada em outro ponto do fluxo)", () => {
    expect(resolveCardCreditCompetencia({ tipo: "receita", creditoTipo: CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR, competencia: "2026-06" }, "2026-07")).toBe("2026-06");
  });

  it("estorno/parcelamento_avista usa a competência de destino escolhida, nunca a do lote", () => {
    expect(resolveCardCreditCompetencia({ tipo: "receita", creditoTipo: CARD_CREDIT_TYPES.ESTORNO, creditoCompetencia: "2026-03", competencia: "2026-06" }, "2026-07")).toBe("2026-03");
  });

  it("estorno/parcelamento_avista sem competência de destino retorna null (não cai para o lote)", () => {
    expect(resolveCardCreditCompetencia({ tipo: "receita", creditoTipo: CARD_CREDIT_TYPES.ESTORNO }, "2026-07")).toBeNull();
  });
});

describe("suggestCardCreditType (v0.3.32.1 — sugestão por memo)", () => {
  it("sugere estorno para devolução (mesmo com PAGAMENTO no texto)", () => {
    expect(suggestCardCreditType("DEVOLUCAO JUROS PAGAMENTO TITULO")).toBe(CARD_CREDIT_TYPES.ESTORNO);
    expect(suggestCardCreditType("ESTORNO COMPRA")).toBe(CARD_CREDIT_TYPES.ESTORNO);
  });

  it("sugere reparcelamento à vista para #PCV / PARC.COMP.VIST", () => {
    expect(suggestCardCreditType("#PCV PARC.COMP.VIST-Booking.")).toBe(CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA);
  });

  it("sugere pagamento da fatura anterior para PGTO/CASH", () => {
    expect(suggestCardCreditType("PGTO. CASH AG. 4305 00043 200100")).toBe(CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR);
  });

  it("retorna null quando o memo não é reconhecível", () => {
    expect(suggestCardCreditType("CREDITO GENERICO XYZ")).toBeNull();
    expect(suggestCardCreditType("")).toBeNull();
  });
});

describe("classifyImportedCardCreditRows com default de competência", () => {
  it("pré-preenche tipo pelo memo e competência de destino com o mês da importação", () => {
    const rows = [
      { _id:"1", tipo:"receita", valor:9.62, descricao:"DEVOLUCAO BR" },
      { _id:"2", tipo:"receita", valor:1006.8, descricao:"#PCV PARC.COMP.VIST-Booking" },
      { _id:"3", tipo:"receita", valor:12061.77, descricao:"PGTO. CASH AG 200100" },
    ];
    const out = classifyImportedCardCreditRows(rows, { defaultCompetencia:"2026-06" });
    expect(out[0].creditoTipo).toBe(CARD_CREDIT_TYPES.ESTORNO);
    expect(out[0].creditoCompetencia).toBe("2026-06");
    expect(isCardCreditRowBlocked(out[0])).toBe(false); // não bloqueado → importável
    expect(out[1].creditoTipo).toBe(CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA);
    expect(out[1].creditoCompetencia).toBe("2026-06");
    // Pagamento não precisa de competência de destino:
    expect(out[2].creditoTipo).toBe(CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR);
    expect(out[2].creditoCompetencia).toBeNull();
  });

  it("não sobrescreve classificação manual já feita pelo usuário", () => {
    const rows = [{ _id:"1", tipo:"receita", valor:50, descricao:"DEVOLUCAO", creditoTipo:CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA, creditoCompetencia:"2026-03" }];
    const out = classifyImportedCardCreditRows(rows, { defaultCompetencia:"2026-06" });
    expect(out[0].creditoTipo).toBe(CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA);
    expect(out[0].creditoCompetencia).toBe("2026-03");
  });
});

describe("isCardCreditDiscardedOnImport", () => {
  it("descarta crédito classificado como pagamento da fatura anterior", () => {
    expect(isCardCreditDiscardedOnImport({ tipo: "receita", creditoTipo: CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR })).toBe(true);
  });

  it("não descarta estorno nem reparcelamento à vista (viram lançamento)", () => {
    expect(isCardCreditDiscardedOnImport({ tipo: "receita", creditoTipo: CARD_CREDIT_TYPES.ESTORNO })).toBe(false);
    expect(isCardCreditDiscardedOnImport({ tipo: "receita", creditoTipo: CARD_CREDIT_TYPES.PARCELAMENTO_AVISTA })).toBe(false);
  });

  it("não descarta despesa comum nem crédito ainda sem classificação", () => {
    expect(isCardCreditDiscardedOnImport({ tipo: "despesa" })).toBe(false);
    expect(isCardCreditDiscardedOnImport({ tipo: "receita" })).toBe(false);
  });
});
