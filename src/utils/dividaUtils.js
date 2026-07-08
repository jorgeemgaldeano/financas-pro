export const getOrphanDividas = (dividas = [], pessoas = []) => {
  const pessoaIds = new Set((pessoas || []).map(p => p.id));
  return (dividas || []).filter(d => !pessoaIds.has(d.pessoaId));
};
