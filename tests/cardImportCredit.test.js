import { describe, it, expect } from "vitest";
import {
  CARD_CREDIT_TYPES,
  classifyImportedCardCreditRows,
  isCardCreditDiscardedOnImport,
  isCardCreditRowBlocked,
  resolveCardCreditCompetencia,
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
