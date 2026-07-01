export const AUTO_CATEGORY_STOPWORDS = new Set([
  "compra","pagamento","pagto","debito","credito","cartao","conta","corrente","transferencia","transf","ted","doc","pix","boleto","online","internet","lancamento","operacao","autorizacao","parcela","parcelado","brasil","banco","saque","deposito","estorno","agendamento","automatico","auto","via","valor","pag"
]);

export const AUTO_CATEGORY_RULES = [
  { tipo:"receita", ids:["sub9a"], labels:["Receitas › Salário","Salário"], keywords:["salario","salario mensal","pagamento salario","provento","remuneracao","ordenado","folha pagamento","holerite","vencimento"] },
  { tipo:"receita", ids:["sub9b"], labels:["Receitas › Freelance","Freelance"], keywords:["freela","freelance","servico prestado","honorario","consultoria","projeto"] },
  { tipo:"receita", ids:["sub9c"], labels:["Receitas › Investimentos","Investimentos"], keywords:["rendimento","dividendo","juros","resgate investimento","aplicacao","cdb","tesouro","selic","fundo investimento","cashback"] },
  { tipo:"receita", ids:["sub9c"], labels:["Receitas","Receita"], keywords:["reembolso","devolucao","estorno recebido","pix recebido","deposito recebido","credito recebido"] },

  { tipo:"despesa", ids:["sub1a"], labels:["Alimentação › Supermercado","Supermercado"], keywords:["supermercado","mercado","atacadao","assai","carrefour","extra","pao de acucar","pao acucar","hortifruti","sacolao","acougue","mercearia","varejao","mini mercado","emporio","gpa","sonda","mambo"] },
  { tipo:"despesa", ids:["sub1b2","sub1b"], labels:["Alimentação › Restaurantes › Jantar","Restaurantes"], keywords:["restaurante","lanchonete","burger","hamburguer","pizza","pizzaria","bar ","churrascaria","sushi","temakeria","bistro","outback","madero","coco bambu"] },
  { tipo:"despesa", ids:["sub1c"], labels:["Alimentação › Delivery","Delivery"], keywords:["ifood","i food","rappi","delivery","aiqfome","ubereats","uber eats","zé delivery","ze delivery"] },
  { tipo:"despesa", ids:["sub1d"], labels:["Alimentação › Padaria / Café","Padaria"], keywords:["padaria","panificadora","cafe","cafeteria","starbucks","pao"] },

  { tipo:"despesa", ids:["sub2a"], labels:["Transporte › Combustível","Combustível"], keywords:["combustivel","posto","gasolina","etanol","alcool","shell","ipiranga","petrobras","br mania","abastec","abastecimento"] },
  { tipo:"despesa", ids:["sub2b"], labels:["Transporte › Aplicativos (Uber/99)","Aplicativos"], keywords:["uber","99app","99 app","taxi","cabify","mobizap"] },
  { tipo:"despesa", ids:["sub2c"], labels:["Transporte › Transporte Público","Transporte Público"], keywords:["bilhete unico","metro","metrô","cptm","onibus","ônibus","transporte publico"] },
  { tipo:"despesa", ids:["sub2d"], labels:["Transporte › Estacionamento","Estacionamento"], keywords:["estacionamento","parking","zona azul","sem parar","pedagio","pedágio","tag"] },
  { tipo:"despesa", ids:["sub2e"], labels:["Transporte › Manutenção Veículo","Manutenção Veículo"], keywords:["mecanica","oficina","auto pecas","autopeças","pneu","borracharia","revisao veiculo","manutencao veiculo"] },

  { tipo:"despesa", ids:["sub3a"], labels:["Moradia › Aluguel","Aluguel"], keywords:["aluguel","locacao imovel","imobiliaria"] },
  { tipo:"despesa", ids:["sub3b"], labels:["Moradia › Condomínio","Condomínio"], keywords:["condominio","condomínio","administradora condominio"] },
  { tipo:"despesa", ids:["sub3c"], labels:["Moradia › Energia Elétrica","Energia Elétrica"], keywords:["energia","luz","enel","cpfl","elektro","edp","neoenergia","cemig","equatorial"] },
  { tipo:"despesa", ids:["sub3d"], labels:["Moradia › Água / Gás","Água / Gás"], keywords:["agua","água","sabesp","saneamento","gas","gás","comgas","ultragaz","liquigas"] },
  { tipo:"despesa", ids:["sub3e"], labels:["Moradia › Internet / TV","Internet / TV"], keywords:["internet","fibra","banda larga","claro","vivo","tim","oi","net servicos","sky","tv assinatura"] },
  { tipo:"despesa", ids:["sub3f"], labels:["Moradia › Manutenção / Reforma","Manutenção / Reforma"], keywords:["reforma","material construcao","leroy","telhanorte","manutencao casa","marcenaria","eletrica","hidraulica"] },

  { tipo:"despesa", ids:["sub4a"], labels:["Saúde › Plano de Saúde","Plano de Saúde"], keywords:["plano saude","convênio medico","convenio medico","unimed","amil","bradesco saude","sulamerica saude","notredame"] },
  { tipo:"despesa", ids:["sub4b"], labels:["Saúde › Farmácia","Farmácia"], keywords:["farmacia","farmácia","drogaria","drogasil","droga raia","raia","ultrafarma","pague menos","panvel","medicamento"] },
  { tipo:"despesa", ids:["sub4c"], labels:["Saúde › Consultas / Exames","Consultas / Exames"], keywords:["consulta","exame","laboratorio","laboratório","hospital","clinica","clínica","dentista","odonto","psicologo","psicóloga"] },
  { tipo:"despesa", ids:["sub4d"], labels:["Saúde › Academia / Esporte","Academia / Esporte"], keywords:["academia","smart fit","bio ritmo","gympass","wellhub","esporte","crossfit","pilates"] },

  { tipo:"despesa", ids:["sub5a1"], labels:["Lazer › Streaming › Netflix","Netflix"], keywords:["netflix"] },
  { tipo:"despesa", ids:["sub5a2"], labels:["Lazer › Streaming › Spotify / Música","Spotify"], keywords:["spotify","deezer","apple music","youtube music"] },
  { tipo:"despesa", ids:["sub5a3"], labels:["Lazer › Streaming › Outros Streaming","Streaming"], keywords:["prime video","amazon prime","disney","star plus","globoplay","hbo","max.com","paramount","crunchyroll","streaming"] },
  { tipo:"despesa", ids:["sub5b"], labels:["Lazer › Cinema / Teatro","Cinema / Teatro"], keywords:["cinema","teatro","ingresso","ingresso.com","sympla","show","evento"] },
  { tipo:"despesa", ids:["sub5c"], labels:["Lazer › Jogos","Jogos"], keywords:["steam","playstation","xbox","nintendo","game","jogo","epic games"] },
  { tipo:"despesa", ids:["sub5d"], labels:["Lazer › Viagens","Viagens"], keywords:["hotel","pousada","booking","airbnb","latam","azul","gol linhas","decolar","hurb","viagem","passagem","resort"] },

  { tipo:"despesa", ids:["sub6a"], labels:["Educação › Cursos Online","Cursos Online"], keywords:["curso","udemy","alura","coursera","hotmart","ead","treinamento"] },
  { tipo:"despesa", ids:["sub6b"], labels:["Educação › Livros","Livros"], keywords:["livro","livraria","kindle","amazon kindle","saraiva","cultura"] },
  { tipo:"despesa", ids:["sub6c"], labels:["Educação › Mensalidade Escolar","Mensalidade Escolar"], keywords:["mensalidade escolar","faculdade","universidade","escola","colegio","colégio","puc","fiap"] },

  { tipo:"despesa", ids:["sub7a"], labels:["Vestuário › Roupas","Roupas"], keywords:["roupa","renner","riachuelo","cea","c&a","zara","shein","hering","camiseta","calca","moda"] },
  { tipo:"despesa", ids:["sub7b"], labels:["Vestuário › Calçados","Calçados"], keywords:["calcado","calçado","tenis","tênis","sapato","netshoes","centauro"] },

  { tipo:"despesa", ids:["sub8a"], labels:["Tecnologia › Hardware / Dispositivos","Hardware"], keywords:["hardware","notebook","celular","samsung","apple store","kabum","terabyte","pichau","fast shop","magazine luiza"] },
  { tipo:"despesa", ids:["sub8b"], labels:["Tecnologia › Serviços Cloud / SaaS","Serviços Cloud / SaaS"], keywords:["aws","amazon web services","google cloud","azure","microsoft","office 365","github","vercel","hostinger","digital ocean","cloudflare","openai","chatgpt"] },
  { tipo:"despesa", ids:["sub8c"], labels:["Tecnologia › Assinaturas Tech","Assinaturas Tech"], keywords:["assinatura software","saas","adobe","canva","notion","figma","dropbox","icloud","google one"] },
];

export const normText = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export const autoCatTokens = (text) => normText(text)
  .split(/[^a-z0-9]+/)
  .filter(token => token.length >= 4 && !AUTO_CATEGORY_STOPWORDS.has(token) && !/^\d+$/.test(token));

export function flattenCategoriesForAutoCategory(cats, depth = 0, parentId = null, parentPath = "") {
  const rows = [];
  for (const cat of cats || []) {
    const path = parentPath ? `${parentPath} › ${cat.nome}` : cat.nome;
    rows.push({ id:cat.id, nome:cat.nome, cor:cat.cor||null, icon:cat.icon||null, depth, parentId, path, hasSubs:!!(cat.subs?.length) });
    if (cat.subs?.length) rows.push(...flattenCategoriesForAutoCategory(cat.subs, depth + 1, cat.id, path));
  }
  return rows;
}

export function resolveAutoCatId(cats, ids = [], labels = [], fallback = "cat10") {
  const flat = flattenCategoriesForAutoCategory(cats);
  const selectable = flat.filter(f => !f.hasSubs);
  const byId = new Map(selectable.map(f => [f.id, f]));
  for (const id of ids) if (byId.has(id)) return id;

  const normalizedLabels = labels.map(normText).filter(Boolean);
  for (const label of normalizedLabels) {
    const exact = selectable.find(f => normText(f.path) === label || normText(f.nome) === label);
    if (exact) return exact.id;
  }
  for (const label of normalizedLabels) {
    const partial = selectable.find(f => normText(f.path).includes(label) || label.includes(normText(f.nome)));
    if (partial) return partial.id;
  }

  return byId.has(fallback) ? fallback : (selectable.find(f => normText(f.nome) === "outros")?.id || selectable[0]?.id || fallback);
}

export function scoreAutoCategoryRule(descNorm, rule) {
  let score = 0;
  for (const keyword of rule.keywords || []) {
    const kw = normText(keyword);
    if (!kw) continue;
    if (descNorm === kw) score += 30;
    else if (descNorm.includes(kw)) score += Math.min(24, Math.max(8, kw.length));
  }
  return score;
}

export function guessCatFromHistory(desc, tipo, trans, cats) {
  const tokens = autoCatTokens(desc);
  if (!tokens.length) return null;
  const descNorm = normText(desc);
  const validIds = new Set(flattenCategoriesForAutoCategory(cats).filter(f => !f.hasSubs).map(f => f.id));
  const scores = new Map();

  trans.forEach(t => {
    if ((t.tipo || "despesa") !== tipo || !t.catId || t.catId === "cat10" || !validIds.has(t.catId)) return;
    const otherNorm = normText(t.descricao);
    if (!otherNorm) return;
    const otherTokens = autoCatTokens(t.descricao);
    let score = 0;
    if (descNorm === otherNorm) score += 100;
    else if (descNorm.includes(otherNorm) || otherNorm.includes(descNorm)) score += 35;
    score += tokens.filter(tok => otherTokens.includes(tok)).length * 12;
    if (score >= 12) scores.set(t.catId, (scores.get(t.catId) || 0) + score);
  });

  const best = [...scores.entries()].sort((a,b)=>b[1]-a[1])[0];
  return best && best[1] >= 12 ? best[0] : null;
}

export function guessCategoryForTransaction({ desc, tipo = "despesa", params = {}, trans = [], cats = [] }) {
  const fallback = tipo === "receita"
    ? resolveAutoCatId(cats, ["sub9c", "sub9a"], ["Receitas › Investimentos", "Receitas"], "cat10")
    : resolveAutoCatId(cats, ["cat10"], ["Outros"], "cat10");

  if (!desc || !params.categAutoImport) return fallback;

  const descNormForCustom = normText(desc);
  const customRules = Array.isArray(params.autoCategoryRules) ? params.autoCategoryRules : [];
  let bestCustom = null;
  let bestCustomScore = 0;
  customRules.filter(rule => !rule.tipo || rule.tipo === tipo).forEach(rule => {
    const keywords = String(rule.keywords || "").split(/[\n,;]/).map(k=>k.trim()).filter(Boolean);
    const score = scoreAutoCategoryRule(descNormForCustom, { keywords });
    if(score > bestCustomScore){ bestCustomScore = score; bestCustom = rule; }
  });
  if(bestCustom && bestCustomScore >= 8 && bestCustom.catId) return bestCustom.catId;

  const byHistory = guessCatFromHistory(desc, tipo, trans, cats);
  if (byHistory) return byHistory;

  const descNorm = normText(desc);
  let bestRule = null;
  let bestScore = 0;

  AUTO_CATEGORY_RULES
    .filter(rule => rule.tipo === tipo)
    .forEach(rule => {
      const score = scoreAutoCategoryRule(descNorm, rule);
      if (score > bestScore) {
        bestScore = score;
        bestRule = rule;
      }
    });

  if (bestRule && bestScore >= 8) {
    return resolveAutoCatId(cats, bestRule.ids, bestRule.labels, fallback);
  }

  return fallback;
}
