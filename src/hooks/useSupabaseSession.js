import { useEffect, useState } from "react";
import { getSessaoAtual, assinarMudancaSessao } from "../services/syncService.js";

// v0.3.38 Fase 3 — ponte fina entre a sessão do supabase-js e o React. Sem
// lógica de decisão própria (isso fica em syncService.js, que é o testável).
export function useSupabaseSession() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    let ativo = true;
    getSessaoAtual().then((s) => {
      if (ativo) {
        setSession(s);
        setLoadingSession(false);
      }
    });
    const cancelar = assinarMudancaSessao((s) => {
      if (ativo) setSession(s);
    });
    return () => {
      ativo = false;
      cancelar();
    };
  }, []);

  return { session, loadingSession };
}
