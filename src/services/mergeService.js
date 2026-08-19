// mergeService.js — v0.3.38 Fase 4 (DEC-0039, DEC-0044, DEC-0045)
//
// Merge assistido de três vias: local (o que este dispositivo quer gravar),
// remoto (o que está em `estado` agora) e ancestral (a versão que este
// dispositivo tinha carregado antes de editar, buscada em `estado_versoes`).
//
// Regra de decisão, em qualquer nível (registro, campo, mapa sem id ou
// escalar): comparar local×ancestral e remoto×ancestral.
//   - só um lado mudou      -> aplica esse lado (auto-resolve, maioria dos casos)
//   - nenhum mudou          -> mantém
//   - os dois mudaram igual -> convergiram sozinhos, sem conflito
//   - os dois mudaram diferente -> conflito real, decisão do usuário (DEC-0044,
//     decisão 1: nunca se resolve por data mais recente)
//
// "Registro" segue a mesma regra estrutural do recordStamp.js: objeto com `id`
// dentro de um array, em qualquer profundidade — cobre trans/contas/cards/
// pessoas/despPess/faturas/simulacoes no nível raiz e dividas[].amortizacoes,
// cofrinhos[].aportes, cats[].subs, params.autoCategoryRules aninhados, pela
// mesma função recursiva. Exclusão sem tombstone: ausente no local e presente
// (sem alteração) no remoto em relação ao ancestral é exclusão aplicada; se o
// remoto também alterou o registro, é conflito (um apagou, o outro editou).
//
// `metas` e `saldosIniciais` (mapas sem id) e os escalares de `params` caem no
// merge de objeto/folha genérico — mesmo raciocínio de três vias, comparando
// valor, não data, como o roadmap já previa para esses casos.
//
// DEC-0045 (revisão do guardiao-localstorage e do especialista-financas antes
// de ligar este módulo ao App.jsx) endureceu o contrato original:
//
//   1. `mergeTresVias` recusa mesclar (`ok:false`) se as 13 chaves de
//      BACKUP_STORAGE_KEYS não existirem com o mesmo formato (array/objeto)
//      nos três payloads, ou se algum array-de-registros tiver id duplicado
//      ou item sem id — em vez de tratar chave ausente como exclusão.
//   2. O caminho de um conflito é uma lista estruturada de segmentos, não uma
//      string reparseada por regex — id/chave com ".", "[" ou "]" não corrompe
//      mais a aplicação da escolha do usuário.
//   3. `aplicarEscolhas` valida que existe uma escolha "local"/"remoto" para
//      cada conflito antes de aplicar — não cai mais em "local" por padrão
//      quando a UI não respondeu.
//   4. `finalizarMerge` é o ÚNICO caminho que produz um payload gravável: só
//      libera depois de todos os conflitos resolvidos E dos invariantes
//      financeiros (mergeInvariants.js) passarem. `mergeTresVias` sozinho
//      nunca devolve algo pronto para subir ao servidor.
//
// Limitação conhecida, não resolvida nesta fase: reordenação de
// `params.autoCategoryRules` sem alteração de conteúdo não gera conflito (a
// ordem é definida pela ordem de descoberta dos ids, não comparada).

import { equalIgnoringStamp, CAMPOS_DE_CARIMBO } from "./recordStamp.js";
import { validarInvariantesFinanceiros } from "./mergeInvariants.js";

function ehObjeto(valor) {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

function ehRegistro(valor) {
  if (!ehObjeto(valor)) return false;
  const { id } = valor;
  return (typeof id === "string" && id !== "") || typeof id === "number";
}

function contemRegistro(arr) {
  return Array.isArray(arr) && arr.some(ehRegistro);
}

// ── Caminho estruturado (DEC-0045: substitui a string reparseada) ─────────
function juntarCampo(caminho, nome) {
  return [...caminho, { tipo: "campo", nome }];
}

function juntarRegistro(caminho, id) {
  return [...caminho, { tipo: "registro", id }];
}

function rotularCaminho(caminho) {
  let s = "";
  for (const seg of caminho) {
    if (seg.tipo === "campo") s += (s ? "." : "") + seg.nome;
    else s += `[${seg.id}]`;
  }
  return s;
}

function chaveDoCaminho(caminho) {
  return caminho[0]?.nome ?? "";
}

function registrarConflito(conflitos, caminho, tipo, local, remoto, ancestral) {
  conflitos.push({
    caminho,
    chave: chaveDoCaminho(caminho),
    rotulo: rotularCaminho(caminho),
    tipo,
    local,
    remoto,
    ancestral,
  });
}

// ── Validação estrutural pré-merge (DEC-0045, item 1) ──────────────────────
// Não tenta ser tolerante: qualquer inconsistência aqui é motivo para recusar
// o merge e degradar para o comportamento da Fase 3 (DEC-0044, decisão 3),
// nunca para adivinhar uma exclusão.
function tipoDeValor(valor) {
  if (Array.isArray(valor)) return "array";
  if (ehObjeto(valor)) return "objeto";
  return typeof valor;
}

function validarConsistenciaDeChaves(local, remoto, ancestral) {
  const nomes = ["local", "remoto", "ancestral"];
  const payloads = [local, remoto, ancestral];
  const todasAsChaves = new Set(payloads.flatMap((p) => Object.keys(p || {})));

  const problemas = [];
  for (const chave of todasAsChaves) {
    const presentes = payloads.map((p) => p && Object.prototype.hasOwnProperty.call(p, chave));
    if (!presentes.every(Boolean)) {
      const faltando = nomes.filter((_, i) => !presentes[i]);
      problemas.push(`chave "${chave}" ausente em: ${faltando.join(", ")}`);
      continue;
    }
    const tipos = payloads.map((p) => tipoDeValor(p[chave]));
    if (new Set(tipos).size > 1) {
      problemas.push(`chave "${chave}" com formato divergente (local=${tipos[0]}, remoto=${tipos[1]}, ancestral=${tipos[2]})`);
    }
  }
  return problemas;
}

function problemasEmArrayDeRegistros(arr, rotulo) {
  const comId = arr.filter(ehRegistro);
  if (comId.length === 0) return [];

  const problemas = [];
  if (comId.length !== arr.length) {
    problemas.push(`array em "${rotulo}" mistura registros com id e itens sem id/inválidos`);
  }
  const vistos = new Set();
  for (const item of comId) {
    if (vistos.has(item.id)) problemas.push(`id duplicado "${item.id}" em "${rotulo}"`);
    vistos.add(item.id);
  }
  return problemas;
}

function escanearEstrutura(valor, rotulo, problemas) {
  if (Array.isArray(valor)) {
    problemas.push(...problemasEmArrayDeRegistros(valor, rotulo));
    valor.forEach((item) => {
      if (!ehRegistro(item)) return;
      for (const [k, v] of Object.entries(item)) {
        if (CAMPOS_DE_CARIMBO.includes(k)) continue;
        escanearEstrutura(v, `${rotulo}[${item.id}].${k}`, problemas);
      }
    });
    return;
  }
  if (ehObjeto(valor)) {
    for (const [k, v] of Object.entries(valor)) {
      escanearEstrutura(v, rotulo ? `${rotulo}.${k}` : k, problemas);
    }
  }
}

function validarEstruturaDosPayloads(local, remoto, ancestral) {
  const problemas = [];
  escanearEstrutura(local, "local", problemas);
  escanearEstrutura(remoto, "remoto", problemas);
  escanearEstrutura(ancestral, "ancestral", problemas);
  return problemas;
}

// ── Três-vias para escalar, ou array que não é lista de registros (comparado
// como bloco — não há id para mesclar item a item).
function mergeFolha(local, remoto, ancestral, caminho, conflitos) {
  const localMudou = !equalIgnoringStamp(local, ancestral);
  const remotoMudou = !equalIgnoringStamp(remoto, ancestral);

  if (!localMudou && !remotoMudou) return ancestral;
  if (localMudou && !remotoMudou) return local;
  if (!localMudou && remotoMudou) return remoto;

  // Os dois mudaram: convergiram para o mesmo valor não é conflito.
  if (equalIgnoringStamp(local, remoto)) return local;

  registrarConflito(conflitos, caminho, "valor", local, remoto, ancestral);
  // Valor de local é só o que fica visível até o usuário resolver — a
  // presença em `conflitos` é que impede finalizarMerge de liberar o payload.
  return local;
}

// Merge de objeto genérico, campo a campo — cobre tanto os campos escalares
// de `params`/`metas`/`saldosIniciais` quanto os campos de um registro (id,
// nome, valor, e os arrays aninhados dele).
function mergeObjeto(local, remoto, ancestral, caminho, conflitos) {
  const l = ehObjeto(local) ? local : {};
  const r = ehObjeto(remoto) ? remoto : {};
  const a = ehObjeto(ancestral) ? ancestral : {};
  const chaves = new Set([...Object.keys(l), ...Object.keys(r), ...Object.keys(a)]);

  const saida = {};
  for (const chave of chaves) {
    // Carimbo é recalculado na fronteira de persistência (Fase 1); não faz
    // sentido comparar nem gerar conflito sobre ele aqui.
    if (CAMPOS_DE_CARIMBO.includes(chave)) continue;
    const valor = mergeValor(l[chave], r[chave], a[chave], juntarCampo(caminho, chave), conflitos);
    // DEC-0045/R2: nunca materializa `undefined` como chave — uma chave
    // apagada dos dois lados de um mapa (metas, saldosIniciais) some de
    // verdade, em vez de virar `{chave: undefined}` (que compara diferente
    // de "chave ausente" depois de um round-trip JSON e gera falso conflito
    // no próximo merge).
    if (valor !== undefined) saida[chave] = valor;
  }
  // Preserva o próprio carimbo do lado local — será recarimbado pela
  // fronteira de persistência de qualquer forma se algo abaixo mudou.
  for (const campo of CAMPOS_DE_CARIMBO) {
    if (campo in l) saida[campo] = l[campo];
    else if (campo in r) saida[campo] = r[campo];
  }
  return saida;
}

// Merge de array de registros (tem `id`) por três vias, item a item.
function mergeArrayDeRegistros(local, remoto, ancestral, caminho, conflitos) {
  const porId = (arr) => {
    const mapa = new Map();
    (Array.isArray(arr) ? arr : []).forEach((item) => { if (ehRegistro(item)) mapa.set(item.id, item); });
    return mapa;
  };
  const mLocal = porId(local);
  const mRemoto = porId(remoto);
  const mAncestral = porId(ancestral);
  const ids = [...new Set([...mLocal.keys(), ...mRemoto.keys(), ...mAncestral.keys()])];

  const saida = [];
  for (const id of ids) {
    const l = mLocal.get(id);
    const r = mRemoto.get(id);
    const a = mAncestral.get(id);
    const itemCaminho = juntarRegistro(caminho, id);

    const localMudou = !equalIgnoringStamp(l, a);
    const remotoMudou = !equalIgnoringStamp(r, a);

    if (!localMudou && !remotoMudou) {
      if (l !== undefined) saida.push(l);
      continue;
    }
    if (localMudou && !remotoMudou) {
      if (l !== undefined) saida.push(l); // l undefined = exclusão local aplicada
      continue;
    }
    if (!localMudou && remotoMudou) {
      if (r !== undefined) saida.push(r); // r undefined = exclusão remota aplicada
      continue;
    }

    // Os dois mudaram.
    if (l === undefined && r === undefined) continue; // apagado dos dois lados, sem conflito

    if (l !== undefined && r !== undefined) {
      if (equalIgnoringStamp(l, r)) { saida.push(l); continue; } // convergiram (inclui ids colididos com o mesmo valor)
      // Recursão isola o que é conflito de campo real do que é aninhado
      // divergente auto-mesclável (cenário "filhos diferentes do mesmo pai").
      saida.push(mergeObjeto(l, r, a, itemCaminho, conflitos));
      continue;
    }

    // Um apagou, o outro editou — conflito de registro, não auto-resolve
    // como exclusão (não se sabe se a edição do outro lado é a que importa).
    registrarConflito(conflitos, itemCaminho, "registro", l, r, a);
    saida.push(l !== undefined ? l : r);
  }
  return saida;
}

function mergeValor(local, remoto, ancestral, caminho, conflitos) {
  const algumEhArray = Array.isArray(local) || Array.isArray(remoto) || Array.isArray(ancestral);
  if (algumEhArray) {
    if (contemRegistro(local) || contemRegistro(remoto) || contemRegistro(ancestral)) {
      return mergeArrayDeRegistros(local, remoto, ancestral, caminho, conflitos);
    }
    return mergeFolha(local, remoto, ancestral, caminho, conflitos);
  }
  if (ehObjeto(local) || ehObjeto(remoto) || ehObjeto(ancestral)) {
    return mergeObjeto(local, remoto, ancestral, caminho, conflitos);
  }
  return mergeFolha(local, remoto, ancestral, caminho, conflitos);
}

// Ponto de entrada. `local`/`remoto`/`ancestral` são os payloads das 13
// chaves de BACKUP_STORAGE_KEYS (o mesmo formato de buildSyncPayload()).
//
// Recusa mesclar (`ok:false`) em vez de adivinhar quando os três payloads não
// batem estruturalmente (DEC-0045, item 1) — o chamador deve tratar isso como
// o mesmo caso de "ancestral indisponível" da DEC-0044 (decisão 3): degradar
// para o comportamento da Fase 3, backup + recusa, sem mensagem diferenciada.
//
// Quando `ok:true`, `preliminar` é o melhor-esforço de merge — com o lado
// local como placeholder nos itens em conflito — e `conflitos` vem agrupável
// por `chave` para a UI mostrar o resumo (DEC-0044, decisão 2). `preliminar`
// NUNCA deve ser gravado diretamente: use `finalizarMerge` para obter um
// payload que já passou pelas escolhas do usuário e pelos invariantes
// financeiros.
export function mergeTresVias({ local, remoto, ancestral }) {
  const problemasDeChave = validarConsistenciaDeChaves(local, remoto, ancestral);
  const problemasDeEstrutura = validarEstruturaDosPayloads(local, remoto, ancestral);
  const problemas = [...problemasDeChave, ...problemasDeEstrutura];
  if (problemas.length > 0) {
    return { ok: false, motivo: "payload_invalido", problemas };
  }

  const conflitos = [];
  const preliminar = mergeObjeto(local, remoto, ancestral, [], conflitos);
  return { ok: true, preliminar, conflitos };
}

function validarEscolhas(conflitos, escolhas) {
  if (!Array.isArray(escolhas) || escolhas.length !== conflitos.length) {
    throw new Error("Escolhas incompletas: cada conflito precisa de uma decisão do usuário (local/remoto).");
  }
  escolhas.forEach((escolha, indice) => {
    if (escolha !== "local" && escolha !== "remoto") {
      throw new Error(`Escolha inválida para o conflito "${conflitos[indice]?.rotulo}": "${escolha}".`);
    }
  });
}

// Aplica as escolhas do usuário (uma por conflito, na ordem de `conflitos`)
// sobre o `preliminar` do merge. `escolhas[i]` é "local" ou "remoto" para o
// conflito `conflitos[i]`. Lança erro se faltar escolha ou o valor for
// inválido (DEC-0045, item 3) — nunca cai em "local" por padrão.
export function aplicarEscolhas(preliminar, conflitos, escolhas) {
  validarEscolhas(conflitos, escolhas);
  let saida = preliminar;
  conflitos.forEach((conflito, indice) => {
    const escolha = escolhas[indice] === "remoto" ? conflito.remoto : conflito.local;
    saida = definirNoCaminho(saida, conflito.caminho, escolha);
  });
  return saida;
}

// Único caminho que produz um payload gravável (DEC-0045, item 4). Sem
// conflitos, libera o `preliminar` direto. Com conflitos pendentes e sem
// `escolhas`, recusa. Em qualquer caso, só libera depois de
// `validarInvariantesFinanceiros` não apontar nada — o que não fechar vira
// bloqueio, não passa liso (recomendação do especialista-financas).
export function finalizarMerge({ preliminar, conflitos, escolhas }) {
  let payload = preliminar;
  if (conflitos.length > 0) {
    if (escolhas === undefined) return { ok: false, motivo: "conflitos_pendentes" };
    payload = aplicarEscolhas(preliminar, conflitos, escolhas);
  }

  const violacoes = validarInvariantesFinanceiros(payload);
  if (violacoes.length > 0) {
    return { ok: false, motivo: "invariante_financeira_violada", violacoes };
  }

  return { ok: true, payload };
}

function definirNoCaminho(raiz, caminho, valor) {
  if (caminho.length === 0) return valor;

  function passo(no, indice) {
    const seg = caminho[indice];
    const ultimo = indice === caminho.length - 1;

    if (seg.tipo === "registro") {
      if (!Array.isArray(no)) {
        throw new Error(`Caminho inválido ao aplicar escolha: esperava array em "${rotularCaminho(caminho.slice(0, indice))}"`);
      }
      const idxAtual = no.findIndex((item) => ehRegistro(item) && item.id === seg.id);
      if (ultimo) {
        if (valor === undefined) {
          return idxAtual === -1 ? no : no.filter((_, i) => i !== idxAtual);
        }
        if (idxAtual === -1) return [...no, valor];
        return no.map((item, i) => (i === idxAtual ? valor : item));
      }
      if (idxAtual === -1) {
        throw new Error(`Registro "${seg.id}" não encontrado ao aplicar escolha em "${rotularCaminho(caminho)}"`);
      }
      return no.map((item, i) => (i === idxAtual ? passo(item, indice + 1) : item));
    }

    // seg.tipo === "campo"
    if (!ehObjeto(no)) {
      throw new Error(`Caminho inválido ao aplicar escolha: esperava objeto no campo "${seg.nome}"`);
    }
    if (ultimo) {
      if (valor === undefined) {
        const { [seg.nome]: _omitido, ...resto } = no;
        return resto;
      }
      return { ...no, [seg.nome]: valor };
    }
    return { ...no, [seg.nome]: passo(no[seg.nome], indice + 1) };
  }

  return passo(raiz, 0);
}
