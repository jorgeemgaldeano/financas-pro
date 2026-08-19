// seedData.js — v0.3.37 Fase 5 (DEC-0038)
// Dados semente do primeiro carregamento (categorias, parâmetros padrão,
// cartões/contas/pessoas/dívidas/transações de demonstração), extraídos
// de App.jsx. Dado puro, sem lógica de negócio.
//
// `TODAY`/`Y`/`M`/`dd` são privados deste módulo: servem só para datar o
// acervo de demonstração em relação ao mês corrente. O App.jsx mantém as
// suas próprias constantes de "hoje" para o gráfico de 6 meses e para o
// ano padrão das projeções — são usos distintos, não uma fonte única que
// tenha sido duplicada.

export const INIT_CATS = [
  { id:"cat1", nome:"Alimentação",  cor:"#00A878", icon:"🍽️", subs:[
    { id:"sub1a", nome:"Supermercado", subs:[] },
    { id:"sub1b", nome:"Restaurantes", subs:[
      { id:"sub1b1", nome:"Almoço", subs:[] },
      { id:"sub1b2", nome:"Jantar", subs:[] },
      { id:"sub1b3", nome:"Fast Food", subs:[] },
    ]},
    { id:"sub1c", nome:"Delivery", subs:[] },
    { id:"sub1d", nome:"Padaria / Café", subs:[] },
  ]},
  { id:"cat2", nome:"Transporte",   cor:"#F5B700", icon:"🚗", subs:[
    { id:"sub2a", nome:"Combustível", subs:[] },
    { id:"sub2b", nome:"Aplicativos (Uber/99)", subs:[] },
    { id:"sub2c", nome:"Transporte Público", subs:[] },
    { id:"sub2d", nome:"Estacionamento", subs:[] },
    { id:"sub2e", nome:"Manutenção Veículo", subs:[] },
  ]},
  { id:"cat3", nome:"Moradia",      cor:"#FFAB40", icon:"🏠", subs:[
    { id:"sub3a", nome:"Aluguel", subs:[] },
    { id:"sub3b", nome:"Condomínio", subs:[] },
    { id:"sub3c", nome:"Energia Elétrica", subs:[] },
    { id:"sub3d", nome:"Água / Gás", subs:[] },
    { id:"sub3e", nome:"Internet / TV", subs:[] },
    { id:"sub3f", nome:"Manutenção / Reforma", subs:[] },
  ]},
  { id:"cat4", nome:"Saúde",        cor:"#4FC3F7", icon:"❤️", subs:[
    { id:"sub4a", nome:"Plano de Saúde", subs:[] },
    { id:"sub4b", nome:"Farmácia", subs:[] },
    { id:"sub4c", nome:"Consultas / Exames", subs:[] },
    { id:"sub4d", nome:"Academia / Esporte", subs:[] },
  ]},
  { id:"cat5", nome:"Lazer",        cor:"#CE93D8", icon:"🎮", subs:[
    { id:"sub5a", nome:"Streaming", subs:[
      { id:"sub5a1", nome:"Netflix", subs:[] },
      { id:"sub5a2", nome:"Spotify / Música", subs:[] },
      { id:"sub5a3", nome:"Outros Streaming", subs:[] },
    ]},
    { id:"sub5b", nome:"Cinema / Teatro", subs:[] },
    { id:"sub5c", nome:"Jogos", subs:[] },
    { id:"sub5d", nome:"Viagens", subs:[] },
  ]},
  { id:"cat6", nome:"Educação",     cor:"#80DEEA", icon:"📚", subs:[
    { id:"sub6a", nome:"Cursos Online", subs:[] },
    { id:"sub6b", nome:"Livros", subs:[] },
    { id:"sub6c", nome:"Mensalidade Escolar", subs:[] },
  ]},
  { id:"cat7", nome:"Vestuário",    cor:"#F48FB1", icon:"👕", subs:[
    { id:"sub7a", nome:"Roupas", subs:[] },
    { id:"sub7b", nome:"Calçados", subs:[] },
  ]},
  { id:"cat8", nome:"Tecnologia",   cor:"#A5D6A7", icon:"💻", subs:[
    { id:"sub8a", nome:"Hardware / Dispositivos", subs:[] },
    { id:"sub8b", nome:"Serviços Cloud / SaaS", subs:[] },
    { id:"sub8c", nome:"Assinaturas Tech", subs:[] },
  ]},
  { id:"cat9", nome:"Receitas",     cor:"#34D399", icon:"💰", subs:[
    { id:"sub9a", nome:"Salário", subs:[] },
    { id:"sub9b", nome:"Freelance", subs:[] },
    { id:"sub9c", nome:"Investimentos", subs:[] },
  ]},
  { id:"cat11",nome:"Compras On-line", cor:"#FF8A65", icon:"🛍️", subs:[] },
  { id:"cat10",nome:"Outros",       cor:"#B0BEC5", icon:"📦", subs:[] },
];

export const INIT_PARAMS = {
  moeda:"BRL", alertaLimite:85, alertaSaldo:true,
  mesesProjecao:3, categAutoImport:true, duplaEntradaDias:3,
  corAlerta:"#E8504A", corOK:"#00A878", corAtencao:"#F5B700",
  // v0.3.28 — E6: categoria de pagamento/ajuste de fatura configurável.
  // Antes era "cat10" fixo no código; se a categoria fosse excluída, os
  // pagamentos futuros nasciam órfãos. Agora é um parâmetro, com fallback
  // para "cat10" (categoria padrão "Outros", que nunca é removida da lista
  // inicial) caso o valor configurado aponte para uma categoria inexistente.
  catIdPagamentoFatura: "cat10",
};

const TODAY = new Date();
const Y = TODAY.getFullYear(), M = TODAY.getMonth();
const dd = (day, mo=M) => new Date(Y, mo, day).toISOString().slice(0,10);

export const INIT_CARDS = [
  { id:"c1", nome:"Nubank",    limite:5000, fechamento:10, vencimento:17, cor:"#7C3AED", contaPagamentoId:"cc1" },
  { id:"c2", nome:"Itaú Visa", limite:8000, fechamento:25, vencimento:5,  cor:"#E8504A", contaPagamentoId:"cc1" },
];

export const INIT_CONTAS = [
  { id:"cc1", nome:"Conta Corrente",    tipo:"corrente",        cor:"#0891B2", icon:"🏦", saldoInicial:2500 },
  { id:"va1", nome:"Vale Alimentação",  tipo:"vale_alimentacao",cor:"#84CC16", icon:"🛒", saldoInicial:0 },
  { id:"vr1", nome:"Vale Refeição",     tipo:"vale_refeicao",   cor:"#F97316", icon:"🍽️", saldoInicial:0 },
];

// Metas de gastos mensais por categoria (catId -> limite em R$)
export const INIT_METAS = {};

// ── Pessoas ──────────────────────────────────────────────────────────────────
// Cadastro de pessoas com quem há relacionamento financeiro
export const INIT_PESSOAS = [
  { id:"p1", nome:"Carlos",  cor:"#7C3AED", icon:"👤" },
  { id:"p2", nome:"Mariana", cor:"#DB2777", icon:"👤" },
];

// ── Dívidas ───────────────────────────────────────────────────────────────────
// Dívidas de terceiros comigo (eles me devem)
// amortizacoes: [{ id, data, valor, modo, obs }]
export const INIT_DIVIDAS = [
  { id:"d1", pessoaId:"p1", descricao:"Empréstimo pessoal",        total:1500, dataInicio:dd(10,-2), status:"aberta",
    amortizacoes:[
      { id:"a1", data:dd(5,-1), valor:300, modo:"Pix",           obs:"" },
      { id:"a2", data:dd(5,0),  valor:300, modo:"Transferência", obs:"" },
    ]
  },
  { id:"d2", pessoaId:"p2", descricao:"Divide da viagem",          total:800,  dataInicio:dd(15,-1), status:"aberta",
    amortizacoes:[
      { id:"a3", data:dd(20,-1), valor:200, modo:"Dinheiro", obs:"" },
    ]
  },
];

// ── Despesas compartilhadas ───────────────────────────────────────────────────
// Despesas mensais com pessoas (empréstimo de cartão, racha, etc.)
// status: "pendente" | "recebido"
export const INIT_DESPESAS_PESSOAS = [
  { id:"dp1", pessoaId:"p1", tipo:"receita", descricao:"Assinatura Netflix compartilhada", valor:25,  data:dd(1),  competencia:dd(1).slice(0,7),  cartaoId:"c2", catId:"sub5a1", status:"pendente", valorPago:0, parcelado:false, fixo:true, parcela:1, totalParcelas:12, parcelaGrupo:"grp_dp_netflix" },
  { id:"dp2", pessoaId:"p2", tipo:"receita", descricao:"Jantar restaurante",               valor:134, data:dd(14), competencia:dd(14).slice(0,7), cartaoId:"c1", catId:"sub1b2", status:"recebido", valorPago:134, parcelado:false, fixo:false },
];

export const INIT_TRANS = [
  { id:"t1",  tipo:"despesa", origem:"corrente",        catId:"sub3a",  descricao:"Aluguel",         valor:1800, data:dd(5),    cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t2",  tipo:"despesa", origem:"corrente",        catId:"sub1a",  descricao:"Supermercado",    valor:420,  data:dd(7),    cartaoId:null, contaId:"cc1", fixo:false },
  { id:"t3",  tipo:"despesa", origem:"cartao",          catId:"sub1c",  descricao:"iFood",           valor:89,   data:dd(3),    cartaoId:"c1", contaId:null,  fixo:false },
  { id:"t4",  tipo:"despesa", origem:"cartao",          catId:"sub2b",  descricao:"Uber",            valor:45,   data:dd(8),    cartaoId:"c1", contaId:null,  fixo:false },
  { id:"t5",  tipo:"despesa", origem:"cartao",          catId:"sub5a1", descricao:"Netflix",         valor:39.9, data:dd(1),    cartaoId:"c2", contaId:null,  fixo:true  },
  { id:"t6",  tipo:"despesa", origem:"cartao",          catId:"sub5a2", descricao:"Spotify",         valor:21.9, data:dd(1),    cartaoId:"c2", contaId:null,  fixo:true  },
  { id:"t7",  tipo:"despesa", origem:"corrente",        catId:"sub4b",  descricao:"Farmácia",        valor:156,  data:dd(12),   cartaoId:null, contaId:"cc1", fixo:false },
  { id:"t8",  tipo:"receita", origem:"corrente",        catId:"sub9a",  descricao:"Salário",         valor:6500, data:dd(5),    cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t9",  tipo:"despesa", origem:"cartao",          catId:"sub1b2", descricao:"Restaurante",     valor:134,  data:dd(14),   cartaoId:"c1", contaId:null,  fixo:false },
  { id:"t10", tipo:"despesa", origem:"corrente",        catId:"sub6a",  descricao:"Curso online",    valor:99,   data:dd(10),   cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t11", tipo:"despesa", origem:"corrente",        catId:"sub3a",  descricao:"Aluguel",         valor:1800, data:dd(5,-1), cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t12", tipo:"despesa", origem:"corrente",        catId:"sub1a",  descricao:"Supermercado",    valor:380,  data:dd(9,-1), cartaoId:null, contaId:"cc1", fixo:false },
  { id:"t13", tipo:"despesa", origem:"cartao",          catId:"sub5b",  descricao:"Cinema",          valor:60,   data:dd(15,-1),cartaoId:"c1", contaId:null,  fixo:false },
  { id:"t14", tipo:"receita", origem:"corrente",        catId:"sub9a",  descricao:"Salário",         valor:6500, data:dd(5,-1), cartaoId:null, contaId:"cc1", fixo:true  },
  { id:"t15", tipo:"despesa", origem:"cartao",          catId:"sub8b",  descricao:"AWS",             valor:47,   data:dd(20,-1),cartaoId:"c2", contaId:null,  fixo:false },
  // Vale Alimentação — crédito + uso
  { id:"t16", tipo:"receita", origem:"vale_alimentacao",catId:"sub9a",  descricao:"Crédito VA",      valor:800,  data:dd(5),    cartaoId:null, contaId:"va1", fixo:true  },
  { id:"t17", tipo:"despesa", origem:"vale_alimentacao",catId:"sub1a",  descricao:"Supermercado VA", valor:210,  data:dd(8),    cartaoId:null, contaId:"va1", fixo:false },
  { id:"t18", tipo:"despesa", origem:"vale_alimentacao",catId:"sub1a",  descricao:"Hortifruti",      valor:95,   data:dd(15),   cartaoId:null, contaId:"va1", fixo:false },
  // Vale Refeição — crédito + uso
  { id:"t19", tipo:"receita", origem:"vale_refeicao",   catId:"sub9a",  descricao:"Crédito VR",      valor:600,  data:dd(5),    cartaoId:null, contaId:"vr1", fixo:true  },
  { id:"t20", tipo:"despesa", origem:"vale_refeicao",   catId:"sub1b",  descricao:"Almoço",          valor:42,   data:dd(6),    cartaoId:null, contaId:"vr1", fixo:false },
  { id:"t21", tipo:"despesa", origem:"vale_refeicao",   catId:"sub1b",  descricao:"Almoço",          valor:38,   data:dd(9),    cartaoId:null, contaId:"vr1", fixo:false },
  { id:"t22", tipo:"despesa", origem:"vale_refeicao",   catId:"sub1b",  descricao:"Restaurante VR",  valor:55,   data:dd(13),   cartaoId:null, contaId:"vr1", fixo:false },
];
