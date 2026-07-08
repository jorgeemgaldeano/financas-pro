import { describe, it, expect } from "vitest";
import { getOrphanDividas } from "../src/utils/dividaUtils.js";

describe("getOrphanDividas", () => {
  const pessoas = [{ id: "p1" }, { id: "p2" }];

  it("retorna lista vazia quando nenhuma dívida é órfã", () => {
    const dividas = [{ id: "d1", pessoaId: "p1" }, { id: "d2", pessoaId: "p2" }];
    expect(getOrphanDividas(dividas, pessoas)).toEqual([]);
  });

  it("retorna as dívidas cujo pessoaId não corresponde a nenhuma pessoa", () => {
    const dividas = [
      { id: "d1", pessoaId: "p1" },
      { id: "d2", pessoaId: "p999" },
    ];
    const orphans = getOrphanDividas(dividas, pessoas);
    expect(orphans).toHaveLength(1);
    expect(orphans[0].id).toBe("d2");
  });

  it("trata todas como órfãs quando não há pessoas cadastradas", () => {
    const dividas = [{ id: "d1", pessoaId: "p1" }, { id: "d2", pessoaId: "p2" }];
    expect(getOrphanDividas(dividas, [])).toHaveLength(2);
  });

  it("lida com arrays vazios ou ausentes sem lançar erro", () => {
    expect(getOrphanDividas([], [])).toEqual([]);
    expect(getOrphanDividas(undefined, undefined)).toEqual([]);
  });
});
