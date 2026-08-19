// categoryService.test.js — cobertura do motor de regras de autocategorização.
// Não existia teste nenhum para este service antes desta sessão; escrito ao
// corrigir um falso positivo real encontrado testando uma fatura de cartão
// verdadeira (a palavra "pagamento" contém "game" como substring).
import { describe, it, expect } from "vitest";
import { guessCategoryForTransaction, scoreAutoCategoryRule, normText } from "../src/services/categoryService.js";
import { INIT_CATS } from "../src/constants/seedData.js";

const params = { categAutoImport: true, autoCategoryRules: [] };
const categorize = (desc, tipo = "despesa") =>
  guessCategoryForTransaction({ desc, tipo, params, trans: [], cats: INIT_CATS });

describe("scoreAutoCategoryRule — matching por fronteira de palavra", () => {
  it("não confunde 'pagamento' com a keyword 'game' (Jogos)", () => {
    const rule = { keywords: ["game"] };
    expect(scoreAutoCategoryRule(normText("juros pagamento titulo"), rule)).toBe(0);
    expect(scoreAutoCategoryRule(normText("pagamentocontas"), rule)).toBe(0);
  });

  it("ainda reconhece a keyword 'game' como palavra isolada", () => {
    const rule = { keywords: ["game"] };
    expect(scoreAutoCategoryRule(normText("epic game store"), rule)).toBeGreaterThan(0);
  });
});

describe("guessCategoryForTransaction — descrições reais de fatura", () => {
  it("não categoriza 'JUROS PAGAMENTO TITULO' como Jogos", () => {
    const catId = categorize("JUROS PAGAMENTO TITULO");
    expect(catId).not.toBe("sub5c");
  });

  it("reconhece Shopee e Mercado Livre como Compras On-line", () => {
    expect(categorize("SHOPEE *FLASH PARC 05/12 FRANCO DA RO")).toBe("cat11");
    expect(categorize("MERCADOLIVRE* PARC 05/10 SAO PAULO")).toBe("cat11");
  });

  it("reconhece Keeta como Delivery", () => {
    expect(categorize("KEETA *PEDIDO 123 SAO PAULO")).toBe("sub1c");
  });
});

describe("scoreAutoCategoryRule — '_' não deve colar palavras (Drogaria_SP)", () => {
  it("reconhece 'drogaria' mesmo seguida de underscore", () => {
    const rule = { keywords: ["drogaria"] };
    expect(scoreAutoCategoryRule(normText("Drogaria_SP d PARC 02/06 Sao Paulo"), rule)).toBeGreaterThan(0);
  });

  it("categoriza 'Drogaria_SP' como Farmácia de ponta a ponta", () => {
    expect(categorize("Drogaria_SP d PARC 02/06 Sao Paulo")).toBe("sub4b");
  });
});
