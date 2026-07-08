// v0.3.30.0
// Estrutura preparatória para sugestão de categoria por IA nas importações.
// Nesta versão não há chamada de rede real: o app não tem backend, então
// chamar uma API de LLM direto do navegador exporia a chave no código-cliente.
// A chamada real fica para quando o provedor/chave forem definidos (ver
// DEC-0031 em docs/08-REGISTRO-DE-DECISOES.md).

export const isAiCategorizationEnabled = (params) => Boolean(params?.aiCategorization?.enabled);

export async function suggestCategoryWithAI() {
  return { ok: false, reason: "not_configured" };
}
