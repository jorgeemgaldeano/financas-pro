import { supabase } from "./supabaseClient.js";

// v0.3.38 Fase 3 — mapeia o erro do Postgrest/GoTrue para um motivo estável
// que o chamador consegue tratar sem conhecer códigos de baixo nível.
function classificarErro(error) {
  const codigo = error?.code;
  if (codigo === "42501") return "nao-autorizado"; // RLS/allowlist negou
  if (error?.status === 401 || codigo === "PGRST301") return "nao-autenticado";
  return "rede";
}

// ── Autenticação ────────────────────────────────────────────────────────────

export async function signIn({ email, password }, client = supabase) {
  if (!client) return { ok: false, motivo: "nao-configurado" };
  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, motivo: "credenciais", erro: error };
    return { ok: true, session: data.session, user: data.user };
  } catch (erro) {
    return { ok: false, motivo: "rede", erro };
  }
}

export async function signOut(client = supabase) {
  if (!client) return { ok: false, motivo: "nao-configurado" };
  try {
    const { error } = await client.auth.signOut();
    if (error) return { ok: false, motivo: "rede", erro: error };
    return { ok: true };
  } catch (erro) {
    return { ok: false, motivo: "rede", erro };
  }
}

export async function getSessaoAtual(client = supabase) {
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data?.session ?? null;
}

// callback(session|null) -> função de cancelamento da assinatura
export function assinarMudancaSessao(callback, client = supabase) {
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

// ── Estado sincronizado (tabela `estado`, uma linha, id=1) ──────────────────

export async function pullEstado(client = supabase) {
  if (!client) return { ok: false, motivo: "nao-configurado" };
  try {
    const { data, error } = await client
      .from("estado")
      .select("payload, versao, usuario, atualizado_em")
      .eq("id", 1)
      .maybeSingle();
    if (error) return { ok: false, motivo: classificarErro(error), erro: error };
    if (!data) return { ok: true, existe: false };
    return {
      ok: true,
      existe: true,
      payload: data.payload,
      versao: data.versao,
      usuario: data.usuario,
      atualizadoEm: data.atualizado_em,
    };
  } catch (erro) {
    return { ok: false, motivo: "rede", erro };
  }
}

// ── Ancestral do merge de três vias (Fase 4, DEC-0039, DEC-0044) ────────────
//
// Busca em `estado_versoes` a versão que este dispositivo tinha carregado
// antes de editar — o "ancestral comum" que mergeTresVias() precisa para
// decidir o que cada lado mudou. `existe:false` cobre os dois motivos
// possíveis de não achar (versão nunca existiu / já foi expurgada pela
// retenção de 100 versões, DEC-0042) e não distingue os dois de propósito:
// nos dois casos o chamador degrada para o comportamento da Fase 3 (recusa +
// backup, sem mensagem diferenciada — DEC-0044, decisão 3).
export async function pullAncestral(versao, client = supabase) {
  if (!client) return { ok: false, motivo: "nao-configurado" };
  if (versao == null) return { ok: true, existe: false };
  try {
    const { data, error } = await client
      .from("estado_versoes")
      .select("payload, usuario, atualizado_em")
      .eq("versao", versao)
      .maybeSingle();
    if (error) return { ok: false, motivo: classificarErro(error), erro: error };
    if (!data) return { ok: true, existe: false };
    return {
      ok: true,
      existe: true,
      payload: data.payload,
      usuario: data.usuario,
      atualizadoEm: data.atualizado_em,
    };
  } catch (erro) {
    return { ok: false, motivo: "rede", erro };
  }
}

// versaoEsperada == null  -> INSERT (primeiro estado gravado no servidor)
// versaoEsperada != null  -> UPDATE condicionado (a própria trava otimista)
export async function pushEstado({ payload, usuario, versaoEsperada }, client = supabase) {
  if (!client) return { ok: false, motivo: "nao-configurado" };
  try {
    if (versaoEsperada == null) {
      const { data, error } = await client
        .from("estado")
        .insert({ payload, usuario })
        .select("versao, atualizado_em")
        .single();
      if (error) {
        // 23505 = unique_violation: outro dispositivo já inseriu a linha id=1
        // entre o pull e este insert. É conflito, não erro de infraestrutura.
        if (error.code === "23505") return { ok: false, motivo: "conflito" };
        return { ok: false, motivo: classificarErro(error), erro: error };
      }
      return { ok: true, versao: data.versao, atualizadoEm: data.atualizado_em };
    }

    const { data, error } = await client
      .from("estado")
      .update({ payload, usuario })
      .eq("id", 1)
      .eq("versao", versaoEsperada)
      .select("versao, atualizado_em");
    if (error) return { ok: false, motivo: classificarErro(error), erro: error };
    // Zero linhas afetadas é a trava otimista funcionando: alguém já salvou
    // uma versão mais nova do que a que este cliente carregou.
    if (!data || data.length === 0) return { ok: false, motivo: "conflito" };
    return { ok: true, versao: data[0].versao, atualizadoEm: data[0].atualizado_em };
  } catch (erro) {
    return { ok: false, motivo: "rede", erro };
  }
}
