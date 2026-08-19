// syncService.test.js — v0.3.38 Fase 3 (DEC-0039, DEC-0042, DEC-0043)
//
// Aceite da Fase 3: "enviar payload mais versão esperada; servidor aceita e
// incrementa, ou recusa" e "falha de rede nunca é silenciosa". Este arquivo
// cobre a lógica pura de decisão (insert vs update vs conflito vs erro) sem
// tocar rede: cada teste injeta um client Supabase falso que reproduz só a
// cadeia fluente que o próprio syncService.js chama.
import { describe, it, expect, vi } from "vitest";
import { signIn, signOut, pullEstado, pushEstado, pullAncestral } from "../src/services/syncService.js";

describe("client não configurado", () => {
  it("pullEstado recusa sem tentar rede", async () => {
    expect(await pullEstado(null)).toEqual({ ok: false, motivo: "nao-configurado" });
  });

  it("pushEstado recusa sem tentar rede", async () => {
    const r = await pushEstado({ payload: {}, usuario: "jorge", versaoEsperada: null }, null);
    expect(r).toEqual({ ok: false, motivo: "nao-configurado" });
  });

  it("pullAncestral recusa sem tentar rede", async () => {
    expect(await pullAncestral(5, null)).toEqual({ ok: false, motivo: "nao-configurado" });
  });

  it("signIn recusa sem tentar rede", async () => {
    const r = await signIn({ email: "a@b.com", password: "x" }, null);
    expect(r).toEqual({ ok: false, motivo: "nao-configurado" });
  });
});

describe("pullEstado", () => {
  it("linha existe: devolve payload, versao, usuario, atualizadoEm", async () => {
    const linha = { payload: { trans: [] }, versao: 3, usuario: "jorge", atualizado_em: "2026-08-18T12:00:00.000Z" };
    const client = {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: linha, error: null }) }) }),
      }),
    };
    expect(await pullEstado(client)).toEqual({
      ok: true, existe: true,
      payload: { trans: [] }, versao: 3, usuario: "jorge", atualizadoEm: "2026-08-18T12:00:00.000Z",
    });
  });

  it("nenhuma linha ainda (primeiro sync de todos): existe:false", async () => {
    const client = {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      }),
    };
    expect(await pullEstado(client)).toEqual({ ok: true, existe: false });
  });

  it("erro do servidor vira motivo classificado, não exceção", async () => {
    const client = {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: { code: "42501" } }) }) }),
      }),
    };
    const r = await pullEstado(client);
    expect(r.ok).toBe(false);
    expect(r.motivo).toBe("nao-autorizado");
  });

  it("falha de rede (client lança) vira motivo:rede, nunca propaga a exceção", async () => {
    const client = { from: () => { throw new Error("fetch failed"); } };
    const r = await pullEstado(client);
    expect(r).toEqual({ ok: false, motivo: "rede", erro: expect.any(Error) });
  });
});

describe("pullAncestral", () => {
  it("versão encontrada: devolve payload/usuario/atualizadoEm do ancestral", async () => {
    const linha = { payload: { trans: [{ id: "t1", valor: 100 }] }, usuario: "jorge", atualizado_em: "2026-08-01T10:00:00.000Z" };
    const client = {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: linha, error: null }) }) }),
      }),
    };
    const r = await pullAncestral(3, client);
    expect(r).toEqual({
      ok: true, existe: true,
      payload: { trans: [{ id: "t1", valor: 100 }] }, usuario: "jorge", atualizadoEm: "2026-08-01T10:00:00.000Z",
    });
  });

  it("versão expurgada pela retenção (não encontrada): existe:false, não erro", async () => {
    const client = {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      }),
    };
    expect(await pullAncestral(3, client)).toEqual({ ok: true, existe: false });
  });

  it("versao nula (sem histórico de sincronização anterior): existe:false, sem tentar rede", async () => {
    const client = { from: () => { throw new Error("não deveria chamar a rede"); } };
    expect(await pullAncestral(null, client)).toEqual({ ok: true, existe: false });
  });

  it("erro do servidor vira motivo classificado, não exceção", async () => {
    const client = {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: { code: "42501" } }) }) }),
      }),
    };
    const r = await pullAncestral(3, client);
    expect(r.ok).toBe(false);
    expect(r.motivo).toBe("nao-autorizado");
  });

  it("falha de rede (client lança) vira motivo:rede, nunca propaga a exceção", async () => {
    const client = { from: () => { throw new Error("fetch failed"); } };
    const r = await pullAncestral(3, client);
    expect(r).toEqual({ ok: false, motivo: "rede", erro: expect.any(Error) });
  });
});

describe("pushEstado — insert (versaoEsperada nulo)", () => {
  it("sucesso: devolve a versão atribuída pelo servidor", async () => {
    const client = {
      from: () => ({
        insert: (row) => {
          expect(row).toEqual({ payload: { trans: [] }, usuario: "jorge" });
          return { select: () => ({ single: async () => ({ data: { versao: 1, atualizado_em: "2026-08-18T12:00:00.000Z" }, error: null }) }) };
        },
      }),
    };
    const r = await pushEstado({ payload: { trans: [] }, usuario: "jorge", versaoEsperada: null }, client);
    expect(r).toEqual({ ok: true, versao: 1, atualizadoEm: "2026-08-18T12:00:00.000Z" });
  });

  it("outro dispositivo inseriu primeiro (23505): vira conflito, não erro genérico", async () => {
    const client = {
      from: () => ({
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { code: "23505" } }) }) }),
      }),
    };
    const r = await pushEstado({ payload: {}, usuario: "jorge", versaoEsperada: null }, client);
    expect(r).toEqual({ ok: false, motivo: "conflito" });
  });

  it("erro de rede no insert vira motivo:rede", async () => {
    const client = { from: () => { throw new Error("offline"); } };
    const r = await pushEstado({ payload: {}, usuario: "jorge", versaoEsperada: null }, client);
    expect(r.ok).toBe(false);
    expect(r.motivo).toBe("rede");
  });
});

describe("pushEstado — update condicionado (trava otimista)", () => {
  it("versão bate: uma linha afetada, aceite", async () => {
    let filtros = {};
    const client = {
      from: () => ({
        update: (row) => {
          expect(row).toEqual({ payload: { trans: ["x"] }, usuario: "jorge" });
          return {
            eq: (campo, valor) => {
              filtros[campo] = valor;
              return {
                eq: (campo2, valor2) => {
                  filtros[campo2] = valor2;
                  return { select: async () => ({ data: [{ versao: 6, atualizado_em: "2026-08-18T13:00:00.000Z" }], error: null }) };
                },
              };
            },
          };
        },
      }),
    };
    const r = await pushEstado({ payload: { trans: ["x"] }, usuario: "jorge", versaoEsperada: 5 }, client);
    expect(filtros).toEqual({ id: 1, versao: 5 });
    expect(r).toEqual({ ok: true, versao: 6, atualizadoEm: "2026-08-18T13:00:00.000Z" });
  });

  it("versão desatualizada: zero linhas afetadas, recusa por conflito (não erro)", async () => {
    const client = {
      from: () => ({
        update: () => ({ eq: () => ({ eq: () => ({ select: async () => ({ data: [], error: null }) }) }) }),
      }),
    };
    const r = await pushEstado({ payload: {}, usuario: "jorge", versaoEsperada: 5 }, client);
    expect(r).toEqual({ ok: false, motivo: "conflito" });
  });

  it("erro do servidor no update vira motivo classificado", async () => {
    const client = {
      from: () => ({
        update: () => ({ eq: () => ({ eq: () => ({ select: async () => ({ data: null, error: { status: 401 } }) }) }) }),
      }),
    };
    const r = await pushEstado({ payload: {}, usuario: "jorge", versaoEsperada: 5 }, client);
    expect(r.ok).toBe(false);
    expect(r.motivo).toBe("nao-autenticado");
  });

  it("falha de rede no update vira motivo:rede, nunca propaga a exceção", async () => {
    const client = { from: () => { throw new Error("timeout"); } };
    const r = await pushEstado({ payload: {}, usuario: "jorge", versaoEsperada: 5 }, client);
    expect(r).toEqual({ ok: false, motivo: "rede", erro: expect.any(Error) });
  });
});

describe("signIn / signOut", () => {
  it("signIn sucesso devolve session e user", async () => {
    const session = { access_token: "t" };
    const user = { email: "a@b.com" };
    const client = { auth: { signInWithPassword: vi.fn(async () => ({ data: { session, user }, error: null })) } };
    const r = await signIn({ email: "a@b.com", password: "x" }, client);
    expect(r).toEqual({ ok: true, session, user });
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({ email: "a@b.com", password: "x" });
  });

  it("signIn com credenciais inválidas não lança, devolve motivo:credenciais", async () => {
    const client = { auth: { signInWithPassword: vi.fn(async () => ({ data: {}, error: { message: "Invalid login credentials" } })) } };
    const r = await signIn({ email: "a@b.com", password: "errada" }, client);
    expect(r.ok).toBe(false);
    expect(r.motivo).toBe("credenciais");
  });

  it("signOut sucesso", async () => {
    const client = { auth: { signOut: vi.fn(async () => ({ error: null })) } };
    expect(await signOut(client)).toEqual({ ok: true });
  });

  it("signOut com falha de rede não lança", async () => {
    const client = { auth: { signOut: vi.fn(async () => { throw new Error("offline"); }) } };
    const r = await signOut(client);
    expect(r.ok).toBe(false);
    expect(r.motivo).toBe("rede");
  });
});
