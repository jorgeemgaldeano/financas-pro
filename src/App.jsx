import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { RequiredFieldModal, requiredFieldInfo, highlightIfRequired } from "./components/ui/RequiredFieldModal.jsx";
import { useToasts, ToastHost } from "./components/ui/Toast.jsx";
import { moveCardTransactions, moveAccountTransactions, recategorizeCategory } from "./services/reassignmentService.js";
import { createTransfer, deleteTransfer, isTransfer } from "./services/transferService.js";
import { addMovimentoCofrinho, createCofrinho, deleteCofrinho, removeMovimentoCofrinho } from "./services/cofrinhoService.js";
import { createSaldoInicialResolver, transMonthKey, valorRealizado } from "./services/saldoService.js";
import { findTransferMatchCandidates, linkImportedRowAsTransfer, revertTransferLinksFromBatch } from "./services/transferMatchService.js";
import { filterTransactions } from "./components/finance/TransactionFiltersPanel.jsx";
import { guessCategoryForTransaction, normText } from "./services/categoryService.js";
import { buildImportKey, buildLegacyImportKey, expandImportedRows, extractIgnoredBankRows, parseBankFile, parseCardCSV, parseOFX, parseValePluxeeText } from "./services/importService.js";
import { LS_VERSION, LS_PREFIX, BACKUP_SCHEMA_VERSION, BACKUP_STORAGE_KEYS } from "./constants/storageKeys.js";
import { useLS, lsSave, onPersistError } from "./hooks/useLocalStorage.js";
import { setStampUser } from "./services/recordStamp.js";
import { useTransactionsStorage } from "./hooks/useTransactionsStorage.js";
import { isSupabaseConfigured } from "./services/supabaseClient.js";
import { signIn, signOut, pullEstado, pushEstado, pullAncestral } from "./services/syncService.js";
import { mergeTresVias, finalizarMerge } from "./services/mergeService.js";
import { SyncConflictModal } from "./components/ui/SyncConflictModal.jsx";
import { useSupabaseSession } from "./hooks/useSupabaseSession.js";
import { fmtBRL, moneyToNumber } from "./utils/moneyUtils.js";
import { addMonthsToDate, dateForMonthDay, fmtDate, formatMonthBR, mKey, MONTHS, monthCompare, monthOffset, todayMonthKey } from "./utils/dateUtils.js";
import { getCardInvoiceCompetence, getCardPaymentAccountId, getInvoiceClosureStatusForMonth, getInvoiceRecordFor, invoiceClosureLabel, invoiceIdFor, invoicePaymentLabel, invoiceStatusByPayment, isInvoiceClosedForNewEntries, paymentStatusByPaidAmount, roundMoney, signedCardAmount } from "./services/cardInvoiceService.js";
import { closeInvoice, reopenInvoice, addInvoiceAdjustment, computeCardInvoice, resolveInvoiceCategoryId } from "./services/cardInvoiceOperations.js";
import { buildProjectionInsights, buildRealCashFlowProjection } from "./services/projectionService.js";
import { applyCardInstallmentSequenceCorrection, buildCardInstallmentGroupId, getCardInstallmentCorrectionPreview } from "./services/cardInstallmentService.js";
import { buildCardImportDuplicateSet, CARD_CREDIT_TYPES, isCardCreditDiscardedOnImport, isCardCreditRowBlocked, prepareCardImportRows, resolveCardCreditCompetencia, revalidateSelectedCardImportRows, splitCardRowsForExpansion } from "./services/cardImportService.js";
import { catColor, catIcon, catLabel, collectCatAndDescendantIds, findCat, findRootCat, flattenCats } from "./utils/categoryTreeUtils.js";
import { C } from "./theme/tokens.js";
import { CategorySelect } from "./components/molecules/CategorySelect.jsx";
import { safeMoneyAmount, normalizeSimulationInstallments, expandSim } from "./services/simulationService.js";
import { SimulacoesTab } from "./components/organisms/SimulacoesTab.jsx";
import { CofrinhosTab } from "./components/organisms/CofrinhosTab.jsx";
import { LancamentosTab } from "./components/organisms/LancamentosTab.jsx";
import { CartoesTab } from "./components/organisms/CartoesTab.jsx";
import { RecorrenciasTab } from "./components/organisms/RecorrenciasTab.jsx";
import { ContasTab } from "./components/organisms/ContasTab.jsx";
import { MetasTab } from "./components/organisms/MetasTab.jsx";
import { ImportacaoTab } from "./components/organisms/ImportacaoTab.jsx";
import { DashboardTab } from "./components/organisms/DashboardTab.jsx";
import { ProjecoesTab } from "./components/organisms/ProjecoesTab.jsx";
import { PessoasTab } from "./components/organisms/PessoasTab.jsx";
import { INIT_CATS, INIT_PARAMS, INIT_CARDS, INIT_CONTAS, INIT_METAS, INIT_PESSOAS, INIT_DIVIDAS, INIT_DESPESAS_PESSOAS, INIT_TRANS } from "./constants/seedData.js";
import { ParamsTab } from "./components/organisms/ParamsTab.jsx";
import { ModalHost } from "./components/organisms/ModalHost.jsx";
import { AppShell } from "./components/templates/AppShell.jsx";
import { buildImportDuplicateKeyCandidates, buildExistingImportDuplicateKeys } from "./services/importDuplicateService.js";
// v0.3.35 — DEC-0036: pdfjs-dist só é usado em extractPdfTextFromFile
// (atrás de impMode==="vale"). Import dinâmico evita empurrar ~2,2MB de
// worker para o chunk principal, que é carregado em toda navegação.
let pdfjsLibPromise = null;
function loadPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.mjs?url"),
    ]).then(([pdfjsLib, pdfWorker]) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
      return pdfjsLib;
    });
  }
  return pdfjsLibPromise;
}

// Fonte unica de versao: package.json, injetado pelo define do Vite (DEC-0040).
const APP_VERSION = __APP_VERSION__;

// ── localStorage helpers ──────────────────────────────────────────────────────
function clearFinancasProStorage() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith("fpro_"))
      .forEach(key => localStorage.removeItem(key));
  } catch { /* LocalStorage indisponivel (modo privativo/cota): limpeza best-effort */ }
}

function getFinancasProStorageSnapshot() {
  const snapshot = {};
  try {
    BACKUP_STORAGE_KEYS.forEach(key => {
      const storageKey = LS_PREFIX + key;
      const value = localStorage.getItem(storageKey);
      if (value !== null) snapshot[storageKey] = value;
    });
  } catch { /* LocalStorage indisponivel: devolve o snapshot parcial em vez de quebrar o backup */ }
  return snapshot;
}

function parseBackupRawValue(rawLocalStorage, key) {
  if (!rawLocalStorage || typeof rawLocalStorage !== "object") return undefined;
  const value = rawLocalStorage[LS_PREFIX + key] ?? rawLocalStorage[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return value;
  return JSON.parse(value);
}

function asArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function asObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function normalizeBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Arquivo de backup inválido.");
  }

  const source = payload.data && typeof payload.data === "object" ? payload.data : payload;
  const rawLocalStorage = payload.rawLocalStorage || source.rawLocalStorage || null;
  const hasKnownData = Boolean(
    source.trans || source.cards || source.cats ||
    source.transactions || source.categories ||
    rawLocalStorage
  );

  if (!hasKnownData) {
    throw new Error("Arquivo não possui dados reconhecidos do Finanças PRO.");
  }

  const read = (key, aliases = [], fallback) => {
    const names = [key, ...aliases];
    for (const name of names) {
      if (source[name] !== undefined) return source[name];
    }
    const rawValue = parseBackupRawValue(rawLocalStorage, key);
    return rawValue !== undefined ? rawValue : fallback;
  };

  const params = asObject(read("params", [], {}), {});
  const normalizedParams = {
    ...params,
    autoCategoryRules: asArray(params.autoCategoryRules, []),
  };

  return {
    trans: asArray(read("trans", ["transactions"], [])),
    contas: asArray(read("contas", ["accounts"], [])),
    metas: asObject(read("metas", ["goals"], {}), {}),
    pessoas: asArray(read("pessoas", ["people"], [])),
    dividas: asArray(read("dividas", ["debts"], [])),
    despPess: asArray(read("despPess", ["sharedExpenses"], [])),
    cards: asArray(read("cards", [], [])),
    cats: asArray(read("cats", ["categories"], [])),
    params: normalizedParams,
    saldosIniciais: asObject(read("saldosIniciais", ["initialBalances"], {}), {}),
    faturas: asArray(read("faturas", ["invoices"], [])),
    simulacoes: asArray(read("simulacoes", ["sims", "simulations"], [])),
    cofrinhos: asArray(read("cofrinhos", [], [])),
    importReports: asArray(read("importReports", ["imports"], [])),
  };
}

// v0.3.37 — Fase 1 (DEC-0038): paleta extraída para theme/tokens.js,
// fonte única de cores (antes duplicada em DEFAULT_COLORS de cada
// componente extraído).

// v0.3.37 — Fase 5 (DEC-0038): INIT_CATS/INIT_PARAMS/INIT_CARDS/
// INIT_CONTAS/INIT_METAS/INIT_PESSOAS/INIT_DIVIDAS/
// INIT_DESPESAS_PESSOAS/INIT_TRANS extraídos para constants/seedData.js.

// Contexto de "hoje" usado pelo gráfico de 6 meses (last6) e pelo ano
// padrão das projeções. O seedData.js tem as suas próprias, privadas.
const TODAY = new Date();
const Y = TODAY.getFullYear(), M = TODAY.getMonth();

// v0.3.37 — Fase 4 (DEC-0038): MONTHS movido para utils/dateUtils.js.
// v0.3.26.7 — E5: IDs são usados como chave de vínculo (invoiceId, parcelaGrupo,
// paymentTransactionId). Math.random().slice(2,9) gera só 7 chars e ao longo de
// anos de importações em lote pode colidir e corromper vínculos silenciosamente.
// crypto.randomUUID() é criptograficamente único; mantém-se fallback para
// ambientes sem suporte. IDs antigos permanecem válidos.
const uid = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch { /* crypto.randomUUID indisponivel: cai no gerador de fallback abaixo */ }
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11);
};

// v0.3.35 — DEC-0036/E4: transMonthKey/valorRealizado extraídos para
// saldoService.js (usados também por buildMovimentoIndex).

const saldoPendente = (t) => Math.max(0, (Number(t.valor) || 0) - (Number(t.valorPago) || 0));

const valorExibicaoLancamento = (t) => roundMoney(Number(t?.valor) || Number(t?.amount) || valorRealizado(t));

// v0.3.37 — Fase 5 (DEC-0038): as chaves de deduplicação da importação
// (normalização de descrição/valor/tipo, leitura de parcela e montagem
// das chaves candidatas) foram extraídas para
// services/importDuplicateService.js.


// v0.3.37 — Fase 2 (DEC-0038): MoneyInput extraído para
// components/atoms/MoneyInput.jsx.

// v0.3.37 — Fase 4 (DEC-0038): MonthShortInput extraído para
// components/molecules/MonthShortInput.jsx.

// ── Category tree helpers
// v0.3.37 — Fase 4 (DEC-0038): funções de árvore de categorias extraídas
// para utils/categoryTreeUtils.js.

// ── Charts
// v0.3.37 — Fase 4 (DEC-0038): BarChart/DonutChart extraídos para
// components/charts/.


// ── Simulation helpers ───────────────────────────────────────────────────────
// v0.3.37 — Fase 4 (DEC-0038): safeMoneyAmount/normalizeSimulationInstallments/
// getSimulationInstallmentValue/expandSim extraídos para
// services/simulationService.js (item 1 do backlog original da v0.3.37).

// v0.3.37 — Fase 4 (DEC-0038): CategorySelect extraído para
// components/molecules/CategorySelect.jsx.

// ── ParamsTab
// v0.3.37 — Fase 5 (DEC-0038): PessoasTab extraída para
// components/organisms/PessoasTab.jsx.

// ── MetaInput: inline editable limit field ───────────────────────────────────
// v0.3.37 — Fase 4 (DEC-0038): MetaInput extraído para
// components/molecules/MetaInput.jsx.

// v0.3.37 — Fase 5 (DEC-0038): ParamsTab extraída para
// components/organisms/ParamsTab.jsx.

// ── Main App
export default function App() {
  const [tab,      setTab]      = useState("dashboard");
  const [trans,    setTrans]    = useTransactionsStorage(INIT_TRANS); // v0.3.28 — normaliza dual-write (E2) na fronteira
  const [contas,   setContas]   = useLS("contas", INIT_CONTAS);
  const [metas,    setMetas]    = useLS("metas",  INIT_METAS);
  const [pessoas,  setPessoas]  = useLS("pessoas", INIT_PESSOAS);
  const [dividas,  setDividas]  = useLS("dividas", INIT_DIVIDAS);
  const [despPess, setDespPess] = useLS("despPess",INIT_DESPESAS_PESSOAS);
  const [cards,    setCards]    = useLS("cards",  INIT_CARDS);
  const [cats,     setCats]     = useLS("cats",   INIT_CATS);
  const [params,   setParams]   = useLS("params", INIT_PARAMS);
  const [saldosIniciais, setSaldosIniciais] = useLS("saldosIniciais", {});
  const [faturas, setFaturas] = useLS("faturas", []);
  // v0.3.38 Fase 1 (D7) — identificação de quem usa este navegador. Fica FORA
  // do backup e fora do payload de sincronização de propósito: a conta do
  // Supabase é compartilhada, então este campo é a única atribuição existente
  // e precisa ser diferente em cada dispositivo. Restaurar um backup do outro
  // notebook não pode trocar a identidade deste.
  const [usuario, setUsuario] = useLS("usuario", "");
  // v0.3.38 Fase 3 (DEC-0043) — metadado de sincronismo deste dispositivo:
  // qual foi a última versão do servidor que ele sincronizou com sucesso.
  // Mesma lógica do `usuario`: fica FORA do backup e fora do payload de sync,
  // é objeto plano na raiz (sem `id` dentro de array), então
  // `stampChangedRecords` não o carimba mesmo sem passar {stamp:false}.
  // versao:null significa "este dispositivo nunca sincronizou com sucesso".
  const [syncEstado, setSyncEstado] = useLS("syncEstado", { versao: null, sincronizadoEm: null });
  const [syncing, setSyncing] = useState(false);
  const { session: syncSession } = useSupabaseSession();
  // v0.3.38 Fase 4 — { conflitos, preliminar, versaoRemota, erro } enquanto o
  // usuário resolve o merge de três vias; null quando não há conflito aberto.
  const [syncConflito, setSyncConflito] = useState(null);
  const [selMonth, setSelMonth] = useState(todayMonthKey());
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState({});
  const [sims,     setSims]     = useLS("simulacoes", []);
  const [cofrinhos, setCofrinhos] = useLS("cofrinhos", []);
  const { toasts, pushToast, dismissToast } = useToasts();
  const [simForm,  setSimForm]  = useState({ modoParc:"total", parcelas:"" });
  const [showContaForm, setShowContaForm] = useState(false);
  const [novaContaForm, setNovaContaForm] = useState({ nome:"", tipo:"corrente" });
  const [impStep,  setImpStep]  = useState("upload");
  const [impMode,  setImpMode]  = useState("cartao");
  const [impCId,   setImpCId]   = useState("");
  const [impContaId, setImpContaId] = useState("");
  const [impBanco, setImpBanco] = useState("auto");
  const [impValeYear, setImpValeYear] = useState(String(new Date().getFullYear()));
  const [impCompetencia, setImpCompetencia] = useState(selMonth);
  const [impRows,  setImpRows]  = useState([]);
  const [impTog,   setImpTog]   = useState({});
  const [impErr,   setImpErr]   = useState("");
  const [impFile,  setImpFile]  = useState("");
  const [impDups,  setImpDups]  = useState(new Set());
  const [impIgnored, setImpIgnored] = useState([]);
  // v0.3.33 (Fase 2 — DEC-0034/RN031): vínculos de transferência CONFIRMADOS
  // pelo usuário na prévia de importação bancária. { [row._id]: existingTransactionId }.
  // Nunca preenchido automaticamente — só via ação explícita na linha (ver UI abaixo).
  const [impTransferLinks, setImpTransferLinks] = useState({});
  const [lastImportReport, setLastImportReport] = useState(null);
  const [requiredModal, setRequiredModal] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [transactionFilters, setTransactionFilters] = useState({
    dataInicio: "",
    dataFim: "",
    rootCatId: "",
    origem: "",
    tipo: "",
    status: "",
  });
  const [projectionMode, setProjectionMode] = useState("ano");
  const [projectionYear, setProjectionYear] = useState(String(Y));
  const [projectionStartMonth, setProjectionStartMonth] = useState(selMonth);
  const [projectionEndMonth, setProjectionEndMonth] = useState(monthOffset(selMonth, Math.max(1, parseInt(params.mesesProjecao, 10) || 3) - 1));
  const [projectionFilters, setProjectionFilters] = useState({
    origin:"todos",
    accountId:"",
    cardId:"",
    rootCatId:"",
    includeSimulations:true,
    includeRecurrences:true,
  });
  const [expandedProjectionMonths, setExpandedProjectionMonths] = useState({});

  useEffect(() => {
    const primeiraCC = contas.find(c => c.tipo === "corrente")?.id || contas[0]?.id || "cc1";
    const precisaMigrar = cards.some(c => !c.contaPagamentoId || !c.accountId);
    if (precisaMigrar) {
      // `stamp:false` — migração automática de campo não é edição do usuário
      // (mesma razão da normalização em useTransactionsStorage).
      setCards(prev => prev.map(c => {
        const contaAssociada = getCardPaymentAccountId(c, primeiraCC);
        return { ...c, contaPagamentoId: contaAssociada, accountId: contaAssociada };
      }), { stamp: false });
    }
  }, [cards, contas, setCards]);

  // v0.3.38 Fase 1 — mantém o carimbador ciente de quem está escrevendo. O
  // `recordStamp` vive fora do React (é chamado na fronteira de persistência),
  // então precisa ser alimentado por aqui.
  useEffect(() => { setStampUser(usuario); }, [usuario]);

  // v0.3.26.7 — L6: exibe aviso quando o LocalStorage falha ao gravar
  // (ex.: quota excedida). Sem isto, a perda de dados seria silenciosa.
  const [persistError, setPersistError] = useState(false);
  useEffect(() => onPersistError(() => setPersistError(true)), []);

  const contasCorrentes = useMemo(() => contas.filter(c => c.tipo === "corrente"), [contas]);
  const primeiraContaCorrenteId = contasCorrentes[0]?.id || contas[0]?.id || "cc1";

  const simTrans = useMemo(()=>sims.flatMap(sim => expandSim(sim, cards, faturas)),[sims, cards, faturas]);
  const [selYear, selMon] = selMonth.split("-").map(Number);
  const monthTrans = useMemo(()=>trans.filter(t=>transMonthKey(t)===selMonth),[trans,selMonth]);

  // ── Saldos mensais, previstos e realizados ────────────────────────────────
  // v0.3.35 — DEC-0036/E4: algoritmo O(C×M×N) (recursão sem cache,
  // refiltrando `trans` a cada mês) trocado por O(N + C×M) via
  // saldoService.createSaldoInicialResolver — índice de movimento por
  // conta+mês construído uma vez (O(N)), saldo inicial memoizado por
  // conta+mês (cada par só é calculado uma vez por render). Caracterização
  // da recursão original em tests/saldoService.test.js.
  const baseSaldoMonth = useMemo(() => {
    const keys = trans.map(t => transMonthKey(t)).filter(Boolean).sort();
    return keys[0] || selMonth;
  }, [trans, selMonth]);

  const saldoResolver = useMemo(
    () => createSaldoInicialResolver(trans, saldosIniciais, baseSaldoMonth),
    [trans, saldosIniciais, baseSaldoMonth]
  );
  const getSaldoInicialConta = saldoResolver.getSaldoInicialConta;

  const setSaldoInicialContaMes = useCallback((contaId, monthKey, value) => {
    setSaldosIniciais(prev => ({
      ...prev,
      [monthKey]: { ...(prev?.[monthKey] || {}), [contaId]: moneyToNumber(value) }
    }));
  }, [setSaldosIniciais]);

  // v0.3.28 — unificação: antes havia dois cálculos equivalentes (este e
  // computeCardInvoice em cardInvoiceOperations.js). Agora o App delega ao
  // serviço puro; o comportamento é idêntico (mesmo teste de caracterização
  // da v0.3.27 cobre este cálculo).
  const calcularFaturaCartao = useCallback((card, monthKey = selMonth) => {
    return computeCardInvoice(trans, card, monthKey);
  }, [trans, selMonth]);

  // Receitas/despesas realizadas = valores pagos/baixados. Previstos não impactam saldo realizado.
  // RN031: transferência entre contas não é receita nem despesa — exclui natureza:"transferencia".
  const receitaCorr  = useMemo(()=>monthTrans.filter(t=>t.tipo==="receita"&&t.origem==="corrente"&&!isTransfer(t)).reduce((s,t)=>s+valorRealizado(t),0),[monthTrans]);
  const receitaVales = useMemo(()=>monthTrans.filter(t=>t.tipo==="receita"&&(t.origem==="vale_alimentacao"||t.origem==="vale_refeicao")).reduce((s,t)=>s+valorRealizado(t),0),[monthTrans]);
  const receitas     = receitaCorr + receitaVales;

  const despCorr  = useMemo(()=>monthTrans.filter(t=>t.tipo==="despesa"&&t.origem==="corrente"&&!isTransfer(t)).reduce((s,t)=>s+valorRealizado(t),0),[monthTrans]);
  const despVales = useMemo(()=>monthTrans.filter(t=>t.tipo==="despesa"&&(t.origem==="vale_alimentacao"||t.origem==="vale_refeicao")).reduce((s,t)=>s+valorRealizado(t),0),[monthTrans]);
  const despCorrTotal = despCorr + despVales;

  const saldoInicialTotal = useMemo(()=>contas.reduce((s,c)=>s+getSaldoInicialConta(c, selMonth),0),[contas,getSaldoInicialConta,selMonth]);
  const saldoFinal = saldoInicialTotal + receitas - despCorrTotal;

  const faturasDoMes = useMemo(() => cards.map(c => ({ ...c, ...calcularFaturaCartao(c, selMonth) })), [cards, calcularFaturaCartao, selMonth]);
  const despCart = useMemo(()=>faturasDoMes.reduce((s,c)=>s+c.total,0),[faturasDoMes]);

  const flatCats = useMemo(()=>flattenCats(cats),[cats]);
  const getCatColor = useCallback((id)=>catColor(cats,id),[cats]);
  const getCatIcon  = useCallback((id)=>catIcon(cats,id),[cats]);
  const getCatLabel = useCallback((id)=>catLabel(cats,id),[cats]);
  const projectionCategoryIds = useMemo(() => {
    if (!projectionFilters.rootCatId) return [];
    const root = findCat(cats, projectionFilters.rootCatId);
    if (!root) return [projectionFilters.rootCatId];
    return flattenCats([root]).map(cat => cat.id);
  }, [cats, projectionFilters.rootCatId]);

  // RN031: transferência não entra em categoria nem no gráfico de despesas.
  const catBreakdown = useMemo(()=>{
    const map={};
    monthTrans.filter(t=>t.tipo==="despesa"&&!isTransfer(t)).forEach(t=>{ const root=findRootCat(cats,t.catId)?.nome||"Outros"; map[root]=(map[root]||0)+t.valor; });
    return Object.entries(map).map(([cat,val])=>({ cat,val, color:cats.find(c=>c.nome===cat)?.cor||"#B0BEC5" })).sort((a,b)=>b.val-a.val);
  },[monthTrans,cats]);

  const last6 = useMemo(()=>Array.from({length:6},(_,i)=>{ const dt=new Date(Y,M-5+i,1),k=dt.toISOString().slice(0,7); return { label:MONTHS[dt.getMonth()], value:trans.filter(t=>t.tipo==="despesa"&&!isTransfer(t)&&transMonthKey(t)===k).reduce((s,t)=>s+t.valor,0) }; }),[trans]);

  const cardTotals = useMemo(()=>cards.map(c=>{
    const fat = calcularFaturaCartao(c, selMonth);
    const gastoSim = simTrans.filter(t=>t.cartaoId===c.id&&transMonthKey(t)===selMonth).reduce((s,t)=>s+t.valor,0);
    const contaPag = contas.find(ct => ct.id === getCardPaymentAccountId(c));
    const invoiceId = invoiceIdFor(c.id, selMonth);
    const invoiceRecord = getInvoiceRecordFor(faturas, c.id, selMonth) || faturas.find(f => f.id === invoiceId);
    const paymentRecord = invoiceRecord?.paymentTransactionId
      ? trans.find(t => t.id === invoiceRecord.paymentTransactionId)
      : trans.find(t => t.invoiceId === invoiceId && t.natureza === "fatura_cartao");
    const totalFatura = roundMoney(Number(invoiceRecord?.finalAmount) || fat.total);
    const valorPagoFatura = roundMoney(Number(paymentRecord?.valorPago) || Number(invoiceRecord?.paidAmount) || 0);
    const valorPendenteFatura = Math.max(0, roundMoney(totalFatura - valorPagoFatura));
    const fechamentoTipo = getInvoiceClosureStatusForMonth(faturas, c, selMonth);
    return {
      ...c,
      ...fat,
      gasto: fat.total,
      gastoSim,
      contaPagamentoNome: contaPag?.nome || "Conta não definida",
      invoiceRecord,
      paymentRecord,
      invoiceClosureStatus: fechamentoTipo,
      invoiceClosureLabel: invoiceClosureLabel(fechamentoTipo),
      invoicePaymentStatusLabel: invoicePaymentLabel(valorPagoFatura, totalFatura),
      invoiceTotal: totalFatura,
      invoicePaidAmount: valorPagoFatura,
      invoicePendingAmount: valorPendenteFatura,
      get disponivel(){ return c.limite-this.gasto; },
      get dispComSim(){ return c.limite-this.gasto-this.gastoSim; },
    };
  }),[cards,contas,calcularFaturaCartao,simTrans,selMonth,faturas,trans]);

  const projections = useMemo(() => buildRealCashFlowProjection({
    transactions: trans,
    cards,
    invoices: faturas,
    simulationTransactions: simTrans,
    mode: projectionMode,
    year: projectionYear,
    startMonth: projectionStartMonth,
    endMonth: projectionEndMonth,
    selectedMonth: selMonth,
    numberOfMonths: params.mesesProjecao,
    monthLabels: MONTHS,
    getInitialBalanceForMonth: monthKey => contas.reduce((sum, conta) => sum + getSaldoInicialConta(conta, monthKey), 0),
    getCardInvoiceTotal: (card, monthKey) => calcularFaturaCartao(card, monthKey).total,
    getInvoiceId: invoiceIdFor,
    filters: {
      origin: projectionFilters.origin,
      accountId: projectionFilters.accountId,
      cardId: projectionFilters.cardId,
      categoryIds: projectionCategoryIds,
      includeSimulations: projectionFilters.includeSimulations,
      includeRecurrences: projectionFilters.includeRecurrences,
    },
  }), [
    trans, cards, faturas, simTrans, projectionMode, projectionYear,
    projectionStartMonth, projectionEndMonth, selMonth, params.mesesProjecao,
    contas, getSaldoInicialConta, calcularFaturaCartao, projectionFilters, projectionCategoryIds
  ]);

  const projectionTotals = useMemo(() => projections.reduce((acc, item) => ({
    receitas: acc.receitas + item.receitas,
    despesas: acc.despesas + item.despesas,
    faturas: acc.faturas + item.faturas,
    simulacoes: acc.simulacoes + item.simulacoes,
    entradas: acc.entradas + item.entradas,
    saidas: acc.saidas + item.saidas,
  }), { receitas:0, despesas:0, faturas:0, simulacoes:0, entradas:0, saidas:0 }), [projections]);

  const projectionFirst = projections[0];
  const projectionLast = projections[projections.length - 1];
  const projectionInsights = useMemo(() => buildProjectionInsights(projections), [projections]);

  // Styles
  const card  = (x={})=>({ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 22px", ...x });
  const lbl   = { fontSize:11, color:C.soft, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 };
  const big   = (col=C.text)=>({ fontSize:24, fontWeight:800, color:col, lineHeight:1.1 });
  const inp   = { background:C.navy, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"8px 12px", fontSize:14, width:"100%", outline:"none" };
  const btn   = (bg,x={})=>({ background:bg, border:"none", borderRadius:8, color:"#fff", padding:"9px 18px", fontWeight:700, cursor:"pointer", fontSize:14, ...x });
  const ghost = (x={})=>({ background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.soft, padding:"6px 12px", cursor:"pointer", fontSize:12, ...x });
  const requireField = (condition, nomeCampo, fieldKey) => {
    if (!condition) {
      setRequiredModal(requiredFieldInfo(nomeCampo, fieldKey));
      return false;
    }
    return true;
  };
  const inputStyle = (fieldKey, base = inp) => highlightIfRequired(base, requiredModal, fieldKey);
  const toggleCardAccordion = (id) => setExpandedCards(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));
  const toggleAccountAccordion = (id) => setExpandedAccounts(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));

  const prevMonth=()=>setSelMonth(new Date(selYear,selMon-2,1).toISOString().slice(0,7));
  const nextMonth=()=>setSelMonth(new Date(selYear,selMon,1).toISOString().slice(0,7));

  // Transaction
  const openAddTrans=()=>{
    const primeiraCC = contas.find(c=>c.tipo==="corrente");
    setModal("addTrans");
    setForm({ tipo:"despesa", origemTipo:"corrente", contaId:primeiraCC?.id||"", cartaoId:"",
              fixo:false, parcelado:false, modoParc:"total", parcelas:"",
              fixoDia:"", fixoMeses:12 });
  };
  const closeModal=()=>{ setModal(null); setForm({}); };

  const resolveCardCompetencia = useCallback((dateKey, cardId, manualMonth = "") => {
    if (manualMonth) return manualMonth;
    const card = cards.find(c => c.id === cardId);
    return getCardInvoiceCompetence(dateKey, card, faturas);
  }, [cards, faturas]);

  const assertCardInvoicesOpenForEntries = useCallback((entries) => {
    const closedEntry = entries.find(entry => {
      const entryCardId = entry.cardId || entry.cartaoId;
      const entryMonth = entry.competencia || entry.faturaCompetencia || entry.competenceMonth;
      const card = cards.find(c => c.id === entryCardId);
      return card && isInvoiceClosedForNewEntries(faturas, card, entryMonth);
    });

    if (!closedEntry) return true;

    const closedCardId = closedEntry.cardId || closedEntry.cartaoId;
    const closedMonth = closedEntry.competencia || closedEntry.faturaCompetencia || closedEntry.competenceMonth;
    const card = cards.find(c => c.id === closedCardId);
    const closureStatus = getInvoiceClosureStatusForMonth(faturas, card, closedMonth);
    alert(`A fatura de ${card?.nome || "cartão"} em ${formatMonthBR(closedMonth)} está ${invoiceClosureLabel(closureStatus).toLowerCase()}. Para incluir lançamentos, reabra a fatura e depois feche novamente manualmente para atualizar o pagamento previsto.`);
    return false;
  }, [cards, faturas]);

  const parcPreview=useMemo(()=>{
    if(!form.parcelado||!form.data) return [];
    const n=parseInt(form.parcelas)||1;
    const vp=form.modoParc==="total"?moneyToNumber(form.valor)/n:moneyToNumber(form.valor);
    const firstCompetence = form.origemTipo === "cartao"
      ? resolveCardCompetencia(form.data, form.cartaoId, form.faturaCompetencia)
      : mKey(form.data);
    return Array.from({length:n},(_,i)=>{
      const dateKey = addMonthsToDate(form.data, i);
      return { data:dateKey, competencia:monthOffset(firstCompetence, i), valor:vp };
    });
  },[form.parcelado,form.data,form.parcelas,form.valor,form.modoParc,form.origemTipo,form.cartaoId,form.faturaCompetencia,resolveCardCompetencia]);

  const addTransaction=()=>{
    // Validação básica
    const isCartao = form.origemTipo==="cartao";
    if(!requireField(Boolean(form.descricao?.trim()), "Descrição", "descricao")) return;
    if(!requireField(moneyToNumber(form.valor)>0, "Valor", "valor")) return;
    if(!requireField(Boolean(form.catId), "Categoria", "catId")) return;
    if(isCartao&&!requireField(Boolean(form.cartaoId), "Cartão", "cartaoId")) return;
    if(!isCartao&&!requireField(Boolean(form.contaId), "Conta / Vale", "contaId")) return;
    if(!form.fixo&&!requireField(Boolean(form.data), "Data", "data")) return;
    if(form.parcelado&&!requireField(Boolean(form.parcelas) && parseInt(form.parcelas, 10) >= 2, "Número de parcelas", "parcelas")) return;
    if(form.fixo&&!requireField(Boolean(form.fixoDia) && parseInt(form.fixoDia)>=1 && parseInt(form.fixoDia)<=31, "Dia do mês", "fixoDia")) return;

    // Derivar campos de origem
    const conta = contas.find(c=>c.id===form.contaId);
    const origem = isCartao ? "cartao" : (conta?.tipo||"corrente");
    const cartaoId = isCartao ? form.cartaoId : null;
    const contaId  = isCartao ? null : form.contaId;
    const base = { tipo:form.tipo, origem, catId:form.catId, descricao:form.descricao, cartaoId, contaId };
    const primeiraCompetenciaCartao = isCartao && form.data ? resolveCardCompetencia(form.data, form.cartaoId, form.faturaCompetencia) : null;

    // Cartão parcelado
    if(isCartao&&form.parcelado){
      const n=parseInt(form.parcelas)||1;
      const vp=form.modoParc==="total"?moneyToNumber(form.valor)/n:moneyToNumber(form.valor);
      const grp=uid();
      const novosLancamentos = Array.from({length:n},(_,i)=>{
        const dateKey = addMonthsToDate(form.data, i);
        const competencia = monthOffset(primeiraCompetenciaCartao, i);
        return { ...base, id:uid(), valor:parseFloat(vp.toFixed(2)), data:dateKey, competencia, faturaCompetencia:competencia, parcela:i+1, totalParcelas:n, parcelaGrupo:grp, fixo:false, status:"pago", valorPago:parseFloat(vp.toFixed(2)) };
      });
      if(!assertCardInvoicesOpenForEntries(novosLancamentos)) return;
      setTrans(p=>[...p,...novosLancamentos]);
    }
    // Lançamento fixo/recorrente — gera N meses a partir do mês selecionado
    else if(form.fixo){
      const dia   = parseInt(form.fixoDia);
      const meses = Math.max(2, parseInt(form.fixoMeses)||12);
      const grp   = uid();
      // Mês de início = mês do seletor de mês (selMonth) do dashboard
      const [startY, startM] = selMonth.split("-").map(Number);
      const novosLancamentos = Array.from({length:meses},(_,i)=>{
        // Garante que o dia existe no mês (ex: dia 31 em fev → último dia)
        // Se dia não existe no mês, JS avança automaticamente (ex: 31/fev→3/mar) — corrigi com clamp
        const maxDay = new Date(startY, startM+i, 0).getDate();
        const safeDay = Math.min(dia, maxDay);
        const dtSafe = new Date(startY, startM-1+i, safeDay);
        const dateKey = dtSafe.toISOString().slice(0,10);
        const competencia = isCartao ? resolveCardCompetencia(dateKey, form.cartaoId) : dateKey.slice(0,7);
        return { ...base, id:uid(), valor:parseFloat(moneyToNumber(form.valor).toFixed(2)),
                 data:dateKey, competencia, faturaCompetencia:isCartao ? competencia : undefined, fixo:true,
                 parcelaGrupo:grp, parcela:i+1, totalParcelas:meses, status:"previsto", valorPago:0 };
      });
      if(isCartao && !assertCardInvoicesOpenForEntries(novosLancamentos)) return;
      setTrans(p=>[...p,...novosLancamentos]);
    }
    // Lançamento simples
    else {
      const competencia = isCartao ? primeiraCompetenciaCartao : mKey(form.data);
      const novoLancamento = { ...base, id:uid(), valor:moneyToNumber(form.valor), data:form.data, competencia, faturaCompetencia:isCartao ? competencia : undefined, fixo:false, status:"pago", valorPago:moneyToNumber(form.valor) };
      if(isCartao && !assertCardInvoicesOpenForEntries([novoLancamento])) return;
      setTrans(p=>[...p,novoLancamento]);
    }
    closeModal();
  };
  const addCard=()=>{
    if(!requireField(Boolean(form.nome?.trim()), "Nome do cartão", "cardNome")) return;
    if(!requireField(Boolean(form.contaPagamentoId), "Conta corrente para pagamento da fatura", "cardContaPagamentoId")) return;
    setCards(p=>[...p,{ ...form, id:uid(), limite:moneyToNumber(form.limite)||1000, fechamento:parseInt(form.fechamento)||10, vencimento:parseInt(form.vencimento)||5, cor:form.cor||"#00A878", contaPagamentoId:form.contaPagamentoId, accountId:form.contaPagamentoId }]);
    closeModal();
  };
  const delTrans=(id)=>setTrans(p=>p.filter(t=>t.id!==id));

  const abrirEdicaoRecorrencia = (grupo) => {
    const ref = grupo.sample;
    const dia = parseInt((ref.data || "").slice(8, 10), 10) || 1;
    setModal("editRecorrencia");
    setForm({
      recorrenciaId: grupo.id,
      descricao: ref.descricao || "",
      valor: (Number(ref.valor) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      tipo: ref.tipo || "despesa",
      origemTipo: ref.origem === "cartao" ? "cartao" : "conta",
      contaId: ref.origem === "cartao" ? "" : (ref.contaId || contas[0]?.id || ""),
      cartaoId: ref.origem === "cartao" ? (ref.cartaoId || cards[0]?.id || "") : "",
      catId: ref.catId || "",
      fixoDia: dia,
      escopo: "futuros",
    });
  };

  const salvarEdicaoRecorrencia = () => {
    if (!form.recorrenciaId) return;
    if (!requireField(Boolean(form.descricao?.trim()), "Descrição", "descricao")) return;
    if (!requireField(moneyToNumber(form.valor) > 0, "Valor", "valor")) return;
    if (!requireField(Boolean(form.catId), "Categoria", "catId")) return;
    const isCartaoEdicao = form.origemTipo === "cartao";
    if (isCartaoEdicao && !requireField(Boolean(form.cartaoId), "Cartão", "cartaoId")) return;
    if (!isCartaoEdicao && !requireField(Boolean(form.contaId), "Conta / Vale", "contaId")) return;

    const dia = Math.min(Math.max(parseInt(form.fixoDia) || 1, 1), 31);
    const valor = parseFloat(moneyToNumber(form.valor).toFixed(2));
    const conta = contas.find(c => c.id === form.contaId);
    const origem = isCartaoEdicao ? "cartao" : (conta?.tipo || "corrente");

    setTrans(prev => prev.map(t => {
      const grupoId = t.parcelaGrupo || t.recorrenciaId || `single_${t.id}`;
      if (grupoId !== form.recorrenciaId) return t;

      const mes = transMonthKey(t);
      const dentroEscopo = form.escopo === "todos" || monthCompare(mes, selMonth) >= 0;
      const preservaHistorico = t.status === "pago" || t.status === "parcial";
      if (!dentroEscopo || preservaHistorico) return t;

      return {
        ...t,
        descricao: form.descricao.trim(),
        valor,
        tipo: form.tipo,
        origem,
        contaId: isCartaoEdicao ? null : form.contaId,
        cartaoId: isCartaoEdicao ? form.cartaoId : null,
        catId: form.catId,
        data: dateForMonthDay(mes, dia),
        competencia: mes,
        status: "previsto",
        valorPago: 0,
      };
    }));
    closeModal();
  };

  const excluirRecorrencia = (grupoId) => {
    const grupo = recorrenciasAgrupadas.find(g => g.id === grupoId);
    if (!grupo) return;
    const msg = `Excluir a recorrência "${grupo.sample.descricao}" e todos os seus ${grupo.lancamentos.length} lançamentos? Esta ação remove inclusive histórico pago.`;
    if (!window.confirm(msg)) return;
    const ids = new Set(grupo.lancamentos.map(t => t.id));
    setTrans(prev => prev.filter(t => !ids.has(t.id)));
  };

  const findarRecorrencia = (grupoId) => {
    const grupo = recorrenciasAgrupadas.find(g => g.id === grupoId);
    if (!grupo) return;
    const futuros = grupo.lancamentos.filter(t => {
      const mes = transMonthKey(t);
      const preservaHistorico = t.status === "pago" || t.status === "parcial";
      return monthCompare(mes, selMonth) > 0 && !preservaHistorico;
    });

    if (!futuros.length) {
      alert("Não há lançamentos previstos futuros para findar a partir do mês selecionado.");
      return;
    }

    if (!window.confirm(`Findar a recorrência "${grupo.sample.descricao}"? Serão removidos ${futuros.length} lançamentos previstos posteriores a ${selMonth}, preservando o histórico já pago/baixado.`)) return;
    const ids = new Set(futuros.map(t => t.id));
    setTrans(prev => prev.filter(t => !ids.has(t.id)));
  };

  const baixarTrans = (id, valor=null) => {
    const alvo = trans.find(t => t.id === id);
    if (!alvo) return;

    const invoiceAlvo = alvo.invoiceId ? faturas.find(f => f.id === alvo.invoiceId) : null;
    const total = roundMoney(Number(alvo.valor) || Number(invoiceAlvo?.finalAmount) || ((Number(alvo.valorPago) || 0) + (Number(alvo.pendingAmount) || 0)));
    const atual = roundMoney(Number(alvo.valorPago) || 0);
    const entrada = valor === null ? total - atual : moneyToNumber(valor);
    if (entrada <= 0 || total <= 0) return;

    const novoPago = Math.min(total, roundMoney(atual + entrada));
    const novoStatus = paymentStatusByPaidAmount(novoPago, total);

    setTrans(prev => prev.map(t => t.id === id ? {
      ...t,
      valor: total,
      amount: total,
      valorPago: novoPago,
      paidAmount: novoPago,
      pendingAmount: Math.max(0, roundMoney(total - novoPago)),
      status: novoStatus,
      updatedAt: new Date().toISOString()
    } : t));

    if (alvo.natureza === "fatura_cartao" && alvo.invoiceId) {
      setFaturas(prev => prev.map(f => f.id === alvo.invoiceId ? {
        ...f,
        finalAmount: total,
        paidAmount: novoPago,
        pendingAmount: Math.max(0, roundMoney(total - novoPago)),
        status: invoiceStatusByPayment(novoPago, total),
        paymentTransactionId: alvo.id,
        updatedAt: new Date().toISOString(),
      } : f));
    }
  };

  const baixarParcialTrans = (id) => {
    const t = trans.find(x => x.id === id);
    if (!t) return;
    const pend = saldoPendente(t);
    const valor = window.prompt(`Valor da baixa parcial. Pendente: ${fmtBRL(pend)}`, "");
    if (valor === null) return;
    baixarTrans(id, valor);
  };

  const adicionarAjusteFatura = (cardId, tipoAjuste) => {
    const card = cards.find(c => c.id === cardId);
    if (card && isInvoiceClosedForNewEntries(faturas, card, selMonth)) {
      const closureStatus = getInvoiceClosureStatusForMonth(faturas, card, selMonth);
      alert(`A fatura de ${card.nome} em ${formatMonthBR(selMonth)} está ${invoiceClosureLabel(closureStatus).toLowerCase()}. Para incluir ajuste, reabra a fatura e depois feche novamente manualmente para atualizar o pagamento previsto.`);
      return;
    }
    const valorRaw = window.prompt(tipoAjuste === "acrescimo" ? "Valor do acréscimo da fatura" : "Valor da redução da fatura", "");
    if (valorRaw === null) return;
    const valor = moneyToNumber(valorRaw);
    if (valor <= 0) { alert("Informe um valor válido."); return; }
    const descricao = window.prompt("Descrição do ajuste", tipoAjuste === "acrescimo" ? "Ajuste de acréscimo da fatura" : "Ajuste de redução da fatura");
    if (!descricao?.trim()) { alert("A descrição do ajuste é obrigatória."); return; }

    // v0.3.27 — operação atômica: o serviço puro devolve o próximo `trans`.
    const catId = resolveInvoiceCategoryId(cats, params.catIdPagamentoFatura); // v0.3.28 — E6
    const res = addInvoiceAdjustment(
      { trans, faturas, cards, contas },
      { cardId, monthKey: selMonth, tipoAjuste, valor, descricao, uid, day: TODAY.getDate(), catId }
    );
    if (!res.ok) {
      if (res.reason === "invoice_closed") {
        alert(`A fatura de ${card?.nome} está fechada. Reabra-a para incluir ajustes.`);
      } else {
        alert("Não foi possível registrar o ajuste.");
      }
      return;
    }
    setTrans(res.trans);
  };

  const fecharFaturaCartao = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const state = { trans, faturas, cards, contas };
    const catId = resolveInvoiceCategoryId(cats, params.catIdPagamentoFatura); // v0.3.28 — E6
    // 1ª tentativa sem confirmar atualização de pagamento existente.
    let res = closeInvoice(state, { cardId, monthKey: selMonth, uid, catId });
    if (!res.ok && res.reason === "needs_confirm_update") {
      const atualizar = window.confirm("Esta fatura já possui pagamento previsto. Deseja atualizar o valor previsto mantendo as baixas já feitas?");
      if (!atualizar) return;
      res = closeInvoice(state, { cardId, monthKey: selMonth, uid, catId, confirmUpdateExisting: true });
    }
    if (!res.ok) {
      if (res.reason === "no_account") alert("Cartão sem conta corrente associada.");
      else if (res.reason === "no_amount") alert("Não há valor de fatura para fechar neste mês.");
      return;
    }
    // v0.3.27 — operação atômica: ambos os estados vêm do mesmo snapshot.
    setTrans(res.trans);
    setFaturas(res.faturas);
  };

  const abrirFaturaCartao = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const res = reopenInvoice({ trans, faturas, cards, contas }, { cardId, monthKey: selMonth, uid });
    if (!res.ok) {
      if (res.reason === "no_account") alert("Cartão sem conta corrente associada.");
      return;
    }
    // v0.3.27 — operação atômica: ambos os estados vêm do mesmo snapshot.
    setTrans(res.trans);
    setFaturas(res.faturas);
  };

  // Simulation
  const addSim=()=>{
    const descricao = (simForm.descricao || "").trim();
    const valor = safeMoneyAmount(simForm.valor);
    const parcelas = normalizeSimulationInstallments(simForm.parcelas);

    if(!requireField(Boolean(descricao), "Descrição", "simDescricao")) return;
    if(!requireField(valor>0, "Valor", "simValor")) return;
    if(!requireField(Boolean(simForm.data), "Data da compra", "simData")) return;
    if(!requireField(Boolean(simForm.cartaoId), "Cartão", "simCartaoId")) return;
    if(!requireField(Boolean(simForm.catId), "Categoria", "simCatId")) return;
    if(!requireField(Boolean(simForm.parcelas) && parcelas >= 1, "Número de parcelas", "simParcelas")) return;

    const competencia = resolveCardCompetencia(simForm.data, simForm.cartaoId, simForm.faturaCompetencia);
    const novaSimulacao = {
      ...simForm,
      id:"sim_"+uid(),
      descricao,
      valor:roundMoney(valor),
      parcelas,
      faturaCompetencia:competencia,
      createdAt:new Date().toISOString(),
    };

    setSims(prev=>[...(Array.isArray(prev)?prev:[]), novaSimulacao]);
    setSimForm(p=>({ modoParc:p.modoParc || "total", parcelas:"", cartaoId:p.cartaoId, faturaCompetencia:"" }));
  };
  const delSim=(id)=>setSims(p=>p.filter(s=>s.id!==id));
  const refazerSim=(id)=>setSims(p=>p.map(s=>s.id===id?{...s, recalculatedAt:new Date().toISOString()}:s));
  const addContaFromForm=()=>{
    const nome=(novaContaForm.nome||"").trim();
    const tipo=novaContaForm.tipo||"corrente";
    if(!requireField(Boolean(nome), "Nome da conta", "novaContaNome")) return;
    const icons={corrente:"🏦",vale_alimentacao:"🛒",vale_refeicao:"🍽️"};
    const cors={corrente:"#0891B2",vale_alimentacao:"#84CC16",vale_refeicao:"#F97316"};
    setContas(p=>[...p,{ id:"ct"+uid(), nome, tipo, cor:cors[tipo], icon:icons[tipo] }]);
    setNovaContaForm({ nome:"", tipo:"corrente" });
    setShowContaForm(false);
  };

  // ── Backup / restore / reset ────────────────────────────────────────────────
  // v0.3.38 Fase 3 — devolve true/false (em vez de void): handleSyncNow precisa
  // saber se o backup automático de fato saiu antes de decidir sobrescrever
  // dados locais. Callers antigos (botão "Exportar backup") ignoram o retorno
  // sem quebrar nada.
  const handleExport = useCallback(() => {
    try {
      const importBatchIds = Array.from(new Set(
        trans.filter(t => t.importado && t.importBatchId).map(t => t.importBatchId)
      ));
      const importReports = lastImportReport ? [lastImportReport] : [];
      const data = {
        trans,
        cards,
        contas,
        metas,
        pessoas,
        dividas,
        despPess,
        cats,
        params: {
          ...params,
          autoCategoryRules: Array.isArray(params?.autoCategoryRules) ? params.autoCategoryRules : [],
        },
        saldosIniciais,
        faturas,
        simulacoes: sims,
        sims, // compatibilidade com backups anteriores da própria aplicação
        cofrinhos,
        importReports,
      };
      const payload = {
        app: "Financas PRO",
        version: LS_VERSION,
        backupSchemaVersion: BACKUP_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        summary: {
          transacoes: trans.length,
          contas: contas.length,
          cartoes: cards.length,
          pessoas: pessoas.length,
          simulacoes: sims.length,
          cofrinhos: cofrinhos.length,
          lotesImportados: importBatchIds.length,
        },
        data,
        rawLocalStorage: getFinancasProStorageSnapshot(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `financas-pro-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (erro) {
      console.error("[Financas PRO] handleExport:", erro);
      return false;
    }
  }, [trans, cards, contas, metas, pessoas, dividas, despPess, cats, params, saldosIniciais, faturas, sims, cofrinhos, lastImportReport]);

  // v0.3.38 Fase 1/3 — `stamp:false` em toda restauração de payload externo
  // (backup local ou estado vindo do servidor): as datas de alteração já
  // vêm carimbadas na origem e representam quando cada registro foi editado
  // de verdade. Recarimbar aqui apagaria essa história e faria o payload
  // restaurado parecer, para o merge da Fase 4, mais novo do que tudo que
  // existe no outro dispositivo. Reaproveitado por handleImport (arquivo
  // local) e por handleSyncNow (adoção do estado remoto).
  const restoreBackupPayload = useCallback((data) => {
    const semCarimbo = { stamp: false };
    setTrans(data.trans, semCarimbo);
    setCards(data.cards, semCarimbo);
    setContas(data.contas, semCarimbo);
    setMetas(data.metas, semCarimbo);
    setPessoas(data.pessoas, semCarimbo);
    setDividas(data.dividas, semCarimbo);
    setDespPess(data.despPess, semCarimbo);
    setCats(data.cats, semCarimbo);
    setParams(data.params, semCarimbo);
    setSaldosIniciais(data.saldosIniciais, semCarimbo);
    setFaturas(data.faturas, semCarimbo);
    setSims(data.simulacoes, semCarimbo);
    setCofrinhos(data.cofrinhos, semCarimbo);
  }, [setTrans, setCards, setContas, setMetas, setPessoas, setDividas, setDespPess, setCats, setParams, setSaldosIniciais, setFaturas, setSims, setCofrinhos]);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const data = normalizeBackupPayload(parsed);
        const confirmed = window.confirm(
          "A restauração substituirá os dados atuais do Finanças PRO neste navegador. Deseja continuar?"
        );
        if (!confirmed) return;

        restoreBackupPayload(data);
        setLastImportReport(data.importReports[0] || null);
        resetImport();
        alert("✅ Backup importado com sucesso! Os dados foram restaurados.");
      } catch(err) {
        alert("❌ Erro ao importar: " + err.message + " Nenhum dado atual foi substituído.");
      }
    };
    reader.onerror = () => alert("❌ Erro ao ler o arquivo de backup. Nenhum dado atual foi substituído.");
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Sincronização (v0.3.38 Fase 3, DEC-0043) ────────────────────────────────
  // Mesmo formato de payload de handleExport/normalizeBackupPayload (13 chaves
  // de BACKUP_STORAGE_KEYS), montado a partir do estado React atual.
  const buildSyncPayload = useCallback(() => ({
    trans,
    contas,
    metas,
    pessoas,
    dividas,
    despPess,
    cards,
    cats,
    params: {
      ...params,
      autoCategoryRules: Array.isArray(params?.autoCategoryRules) ? params.autoCategoryRules : [],
    },
    saldosIniciais,
    faturas,
    simulacoes: sims,
    cofrinhos,
  }), [trans, contas, metas, pessoas, dividas, despPess, cards, cats, params, saldosIniciais, faturas, sims, cofrinhos]);

  const handleSyncLogin = useCallback(async ({ email, password }) => {
    const r = await signIn({ email, password });
    if (!r.ok) {
      pushToast({ message: "Login falhou. Confira email e senha da conta compartilhada.", tone: "coral" });
    }
    return r.ok;
  }, [pushToast]);

  const handleSyncLogout = useCallback(async () => {
    await signOut();
  }, []);

  // v0.3.38 Fase 3 — payload remoto tem que trazer as 13 chaves esperadas
  // antes de ser adotado. normalizeBackupPayload() é deliberadamente tolerante
  // (aceita backup local antigo/parcial e preenche ausência com vazio) porque
  // handleImport tem confirmação humana no meio. Adoção automática de estado
  // remoto não pode herdar essa tolerância: um payload truncado ou gravado
  // pela metade não pode apagar categorias/contas silenciosamente.
  const payloadRemotoValido = (payload) =>
    !!payload && typeof payload === "object" && BACKUP_STORAGE_KEYS.every(k => Object.prototype.hasOwnProperty.call(payload, k));

  // v0.3.38 Fase 4 (DEC-0044/DEC-0045) — mesmo texto de recusa que a Fase 3 já
  // usava, reaproveitado para os dois motivos de degradação silenciosa
  // (decisão 3 da DEC-0044): ancestral indisponível (expurgado pela retenção
  // de 100 versões) e payload estruturalmente inconsistente (mergeTresVias
  // recusou). Nenhum dos dois ganha mensagem diferenciada.
  const recusarComoFase3 = useCallback(() => {
    const backupOk = handleExport();
    pushToast({
      message: backupOk
        ? "Recusado: outro dispositivo salvou uma versão mais nova. Backup baixado — nada foi perdido. Reconcilie manualmente por ora."
        : "Recusado: outro dispositivo salvou uma versão mais nova. O backup automático falhou — exporte manualmente antes de tentar de novo. Nada local foi alterado.",
      tone: "gold",
      durationMs: 9000,
    });
  }, [handleExport, pushToast]);

  // Aplica um merge já resolvido (sem conflitos, ou com todas as escolhas do
  // usuário): finalizarMerge valida escolhas e invariantes financeiros antes
  // de liberar; só então backup, gravação local e envio ao servidor. Devolve
  // { ok, erro? } para o chamador decidir se fecha o modal de conflito.
  const aplicarMergeResolvido = useCallback(async ({ preliminar, conflitos, escolhas, versaoRemota }) => {
    let final;
    try {
      final = finalizarMerge({ preliminar, conflitos, escolhas });
    } catch (erro) {
      // aplicarEscolhas lança se alguma escolha faltar/for inválida — não
      // deveria acontecer vindo do modal (que só libera o botão com todas
      // preenchidas), mas não deve travar a sessão se acontecer.
      return { ok: false, erro: erro.message };
    }
    if (!final.ok) {
      if (final.motivo === "invariante_financeira_violada") {
        return {
          ok: false,
          erro: "A mesclagem automática deixaria os dados financeiramente inconsistentes e foi bloqueada. Nada foi alterado — revise manualmente e sincronize de novo.",
        };
      }
      return { ok: false, erro: "Ainda há divergências pendentes de resolução." };
    }

    const backupOk = handleExport();
    if (!backupOk) {
      pushToast({ message: "Backup automático falhou. Reconciliação cancelada — nada foi alterado localmente.", tone: "coral", durationMs: 9000 });
      return { ok: false, erro: null };
    }

    const falhasGravacao = [];
    const registrarFalha = (e) => falhasGravacao.push(e.detail?.key);
    window.addEventListener("fpro:persist-error", registrarFalha);
    try {
      restoreBackupPayload(normalizeBackupPayload(final.payload));
      await Promise.resolve();
    } finally {
      window.removeEventListener("fpro:persist-error", registrarFalha);
    }
    if (falhasGravacao.length > 0) {
      pushToast({ message: `Falha ao gravar localmente (${falhasGravacao.join(", ")}). Recarregue a página e sincronize de novo antes de continuar.`, tone: "coral", durationMs: 12000 });
      return { ok: false, erro: null };
    }

    const push = await pushEstado({ payload: final.payload, usuario, versaoEsperada: versaoRemota });
    if (push.ok) {
      setSyncEstado({ versao: push.versao, sincronizadoEm: push.atualizadoEm });
      pushToast({ message: `Conflito reconciliado e sincronizado (versão ${push.versao}).`, tone: "emerald" });
    } else if (push.motivo === "conflito") {
      // Raro (uso caracterizado do projeto: casal, mesma casa, quase sempre
      // online) — outro dispositivo sincronizou de novo durante a
      // reconciliação. O merge já foi aplicado localmente com backup, então
      // nada foi perdido; só falta reenviar.
      pushToast({ message: "Outro dispositivo sincronizou de novo enquanto você reconciliava. Seus dados locais já foram atualizados e um backup foi salvo — sincronize novamente para enviar.", tone: "gold", durationMs: 9000 });
    } else {
      pushToast({ message: "Reconciliação aplicada localmente, mas falhou ao enviar ao servidor. Sincronize novamente.", tone: "coral", durationMs: 9000 });
    }
    return { ok: true };
  }, [handleExport, restoreBackupPayload, usuario, pushToast, setSyncEstado]);

  // Busca o remoto atual e o ancestral comum (a versão que este dispositivo
  // tinha carregado antes de editar) e mescla. Sem conflitos, aplica sozinho;
  // com conflitos, abre o modal de resumo por chave (DEC-0044 decisão 2).
  const resolverConflitoDeSincronizacao = useCallback(async (local) => {
    const fresco = await pullEstado();
    if (!fresco.ok || !fresco.existe) { recusarComoFase3(); return; }

    const ancestral = await pullAncestral(syncEstado.versao);
    if (!ancestral.ok || !ancestral.existe) { recusarComoFase3(); return; }

    const merge = mergeTresVias({ local, remoto: fresco.payload, ancestral: ancestral.payload });
    if (!merge.ok) { recusarComoFase3(); return; }

    if (merge.conflitos.length === 0) {
      await aplicarMergeResolvido({ preliminar: merge.preliminar, conflitos: [], escolhas: undefined, versaoRemota: fresco.versao });
      return;
    }

    setSyncConflito({
      conflitos: merge.conflitos, preliminar: merge.preliminar, versaoRemota: fresco.versao, erro: null,
      local, remoto: fresco.payload,
    });
  }, [syncEstado, recusarComoFase3, aplicarMergeResolvido]);

  const handleSyncConflitoConfirmar = useCallback(async (escolhas) => {
    if (!syncConflito) return;
    const r = await aplicarMergeResolvido({
      preliminar: syncConflito.preliminar, conflitos: syncConflito.conflitos, escolhas, versaoRemota: syncConflito.versaoRemota,
    });
    if (r.ok) setSyncConflito(null);
    else if (r.erro) setSyncConflito(prev => (prev ? { ...prev, erro: r.erro } : prev));
  }, [syncConflito, aplicarMergeResolvido]);

  const handleSyncConflitoCancelar = useCallback(() => {
    setSyncConflito(null);
    recusarComoFase3();
  }, [recusarComoFase3]);

  // Sem argumentos de propósito: é o mesmo gancho que a Fase 5 vai reaproveitar
  // para os gatilhos automáticos (ao abrir o app, ao sair). Lê tudo do estado
  // React via closure.
  const handleSyncNow = useCallback(async () => {
    if (!isSupabaseConfigured) {
      pushToast({ message: "Sincronização não configurada nesta build.", tone: "coral" });
      return;
    }
    if (!syncSession) {
      pushToast({ message: "Faça login para sincronizar.", tone: "coral" });
      return;
    }
    if (!String(usuario || "").trim()) {
      // RN034/RN035 — a conta do Supabase é compartilhada; sem `usuario`
      // preenchido não existe atribuição de autoria, e a sincronização fica
      // bloqueada de propósito.
      pushToast({ message: "Preencha sua identificação em Parâmetros → Geral antes de sincronizar.", tone: "coral" });
      return;
    }
    if (syncing) return;

    setSyncing(true);
    try {
      const pull = await pullEstado();
      if (!pull.ok) {
        pushToast({ message: "Falha ao conectar ao servidor. Nada foi alterado localmente.", tone: "coral" });
        return;
      }

      const payload = buildSyncPayload();

      if (!pull.existe) {
        // Ninguém sincronizou ainda: este dispositivo vira a base (D9).
        const push = await pushEstado({ payload, usuario, versaoEsperada: null });
        if (push.ok) {
          setSyncEstado({ versao: push.versao, sincronizadoEm: push.atualizadoEm });
          pushToast({ message: `Sincronizado (versão ${push.versao}).`, tone: "emerald" });
        } else if (push.motivo === "conflito") {
          const backupOk = handleExport();
          pushToast({
            message: backupOk
              ? "Outro dispositivo sincronizou primeiro. Backup baixado — sincronize de novo."
              : "Outro dispositivo sincronizou primeiro, e o backup automático falhou. Exporte manualmente antes de sincronizar de novo.",
            tone: "gold", durationMs: 9000,
          });
        } else {
          pushToast({ message: "Falha ao sincronizar. Nada foi alterado localmente.", tone: "coral" });
        }
        return;
      }

      if (syncEstado.versao == null) {
        // Servidor já tem estado, mas este dispositivo nunca sincronizou: não
        // há ancestral comum e a Fase 4 (merge de três vias) ainda não existe.
        // Adota o remoto — é a única sobrescrita cega deste fluxo, por isso as
        // três guardas abaixo: payload validado, confirmação humana e backup
        // confirmado antes de tocar em qualquer chave local.
        if (!payloadRemotoValido(pull.payload)) {
          pushToast({ message: "O estado do servidor está incompleto ou corrompido. Nada foi alterado localmente — avise antes de continuar usando a sincronização.", tone: "coral", durationMs: 12000 });
          return;
        }
        const confirmado = window.confirm(
          "O outro dispositivo já sincronizou dados e este nunca sincronizou antes. " +
          "Os dados deste navegador serão substituídos pelos do servidor (um backup será baixado antes). Continuar?"
        );
        if (!confirmado) return;

        const backupOk = handleExport();
        if (!backupOk) {
          pushToast({ message: "Backup automático falhou. Sincronização cancelada — nada foi alterado localmente.", tone: "coral", durationMs: 9000 });
          return;
        }

        const falhasGravacao = [];
        const registrarFalha = (e) => falhasGravacao.push(e.detail?.key);
        window.addEventListener("fpro:persist-error", registrarFalha);
        try {
          restoreBackupPayload(normalizeBackupPayload(pull.payload));
          // Cede um tick para o React processar as gravações em fila do useLS
          // antes de decidir se o carimbo de "sincronizado" pode ser gravado.
          await Promise.resolve();
        } finally {
          window.removeEventListener("fpro:persist-error", registrarFalha);
        }
        if (falhasGravacao.length > 0) {
          pushToast({ message: `Falha ao gravar localmente (${falhasGravacao.join(", ")}). Recarregue a página e sincronize de novo antes de continuar.`, tone: "coral", durationMs: 12000 });
          return;
        }

        setSyncEstado({ versao: pull.versao, sincronizadoEm: pull.atualizadoEm });
        pushToast({ message: `Dados do outro dispositivo aplicados (versão ${pull.versao}). Seus dados anteriores foram salvos em backup.`, tone: "gold", durationMs: 9000 });
        return;
      }

      const push = await pushEstado({ payload, usuario, versaoEsperada: syncEstado.versao });
      if (push.ok) {
        setSyncEstado({ versao: push.versao, sincronizadoEm: push.atualizadoEm });
        pushToast({ message: `Sincronizado (versão ${push.versao}).`, tone: "emerald" });
      } else if (push.motivo === "conflito") {
        // v0.3.38 Fase 4 — antes só recusava com backup; agora tenta o merge
        // assistido de três vias, e só degrada para a recusa (recusarComoFase3)
        // se o ancestral não existir mais ou o payload não bater estruturalmente.
        await resolverConflitoDeSincronizacao(payload);
      } else {
        pushToast({ message: "Falha ao sincronizar. Nada foi alterado localmente.", tone: "coral" });
      }
    } catch (erro) {
      pushToast({ message: "Falha inesperada ao sincronizar. Nada foi alterado localmente.", tone: "coral" });
      console.error("[Financas PRO] handleSyncNow:", erro);
    } finally {
      setSyncing(false);
    }
  }, [syncSession, usuario, syncing, syncEstado, buildSyncPayload, handleExport, restoreBackupPayload, pushToast, setSyncEstado, resolverConflitoDeSincronizacao]);

  // v0.3.38 Fase 5 (D6) — sync ao abrir, ao sair, além do botão manual que já
  // existia. `handleSyncNow` já cobre todas as guardas (config, login, usuario
  // preenchido, `syncing` em andamento) — os dois gatilhos abaixo só chamam a
  // mesma função, sem duplicar lógica de decisão.
  const syncAoAbrirDisparado = useRef(false);
  useEffect(() => {
    if (syncAoAbrirDisparado.current) return;
    if (!isSupabaseConfigured || !syncSession || !String(usuario || "").trim()) return;
    syncAoAbrirDisparado.current = true;
    handleSyncNow();
  }, [syncSession, usuario, handleSyncNow]);

  useEffect(() => {
    const aoTrocarVisibilidade = () => {
      if (document.visibilityState !== "hidden") return;
      if (!isSupabaseConfigured || !syncSession || !String(usuario || "").trim()) return;
      handleSyncNow();
    };
    document.addEventListener("visibilitychange", aoTrocarVisibilidade);
    return () => document.removeEventListener("visibilitychange", aoTrocarVisibilidade);
  }, [syncSession, usuario, handleSyncNow]);

  // v0.3.38 Fase 5 (T4) — antes só zerava localmente; "Apagar dados
  // financeiros" agora propaga ao servidor como o próprio apagamento (não
  // fica pendurado esperando o próximo sync manual encontrar a divergência).
  // A confirmação por digitação e o backup obrigatório vivem na chamada
  // (aplicarResetLocal continua síncrono e é reaproveitado por baixo).
  const aplicarResetLocal = () => {
    const emptyState = {
      trans: [],
      cards: [],
      contas: [],
      metas,
      pessoas,
      dividas,
      despPess,
      cats,
      params,
      saldosIniciais: {},
      faturas: [],
    };

    // Remove chaves antigas/prefixed e grava explicitamente o estado financeiro zerado.
    // Configurações estruturais e Pessoas são preservadas conforme regra atual do projeto.
    clearFinancasProStorage();
    Object.entries(emptyState).forEach(([key, value]) => lsSave(key, value));
    // v0.3.38 Fase 1 — `clearFinancasProStorage` apaga todas as chaves `fpro_`,
    // inclusive a identificação do dispositivo, que não é dado financeiro. Sem
    // esta linha o campo sumiria do LocalStorage mas continuaria em memória, e
    // a divergência só apareceria no próximo reload.
    lsSave("usuario", usuario);
    // v0.3.38 Fase 3 — mesmo raciocínio para o metadado de sincronismo: sem
    // isto, "Apagar dados financeiros" tem resultado diferente dependendo de
    // haver reload depois (ver DEC-0043). `handleReset` (acima) grava a
    // versão nova depois do push — isto aqui só preserva o valor atual até lá.
    lsSave("syncEstado", syncEstado);

    setTrans(emptyState.trans);
    setCards(emptyState.cards);
    setContas(emptyState.contas);
    setMetas(emptyState.metas);
    setPessoas(emptyState.pessoas);
    setDividas(emptyState.dividas);
    setDespPess(emptyState.despPess);
    setCats(emptyState.cats);
    setParams(emptyState.params);
    setSaldosIniciais(emptyState.saldosIniciais);
    setFaturas(emptyState.faturas);
    setSims([]);
    setCofrinhos([]);
    setModal(null);
    setForm({});
    setSelMonth(todayMonthKey());
    resetImport();
    setTab("dashboard");
  };

  const handleReset = async () => {
    // T4 — backup automático obrigatório antes de apagar. Se falhar, aborta:
    // nada é apagado sem uma cópia de segurança gerada com sucesso.
    const backupOk = handleExport();
    if (!backupOk) {
      pushToast({ message: "Backup automático falhou. Nada foi apagado.", tone: "coral", durationMs: 9000 });
      return;
    }

    // Payload do estado zerado, montado ANTES de aplicar localmente — os
    // setters são assíncronos, e o fechamento aqui já tem os valores certos
    // (metas/pessoas/dividas/despPess/cats/params preservados, o resto vazio).
    const payloadVazio = {
      trans: [], contas: [], metas, pessoas, dividas, despPess, cards: [], cats,
      params: { ...params, autoCategoryRules: Array.isArray(params?.autoCategoryRules) ? params.autoCategoryRules : [] },
      saldosIniciais: {}, faturas: [], simulacoes: [], cofrinhos: [],
    };

    aplicarResetLocal();

    // T4 — propaga o apagamento ao servidor quando a sincronização está
    // configurada e logada. Sem isso, o servidor continuaria com os dados
    // antigos até o próximo "Sincronizar agora" encontrar a divergência.
    if (!isSupabaseConfigured || !syncSession || !String(usuario || "").trim()) {
      pushToast({ message: "Dados apagados neste dispositivo.", tone: "emerald" });
      return;
    }

    const push = await pushEstado({ payload: payloadVazio, usuario, versaoEsperada: syncEstado.versao });
    if (push.ok) {
      setSyncEstado({ versao: push.versao, sincronizadoEm: push.atualizadoEm });
      pushToast({ message: "Dados apagados e propagados ao servidor.", tone: "emerald" });
    } else if (push.motivo === "conflito") {
      pushToast({
        message: "Dados apagados neste dispositivo, mas outro sincronizou primeiro no servidor. Sincronize novamente para propagar o apagamento.",
        tone: "gold", durationMs: 9000,
      });
    } else {
      pushToast({ message: "Dados apagados neste dispositivo, mas falhou ao propagar ao servidor. Sincronize novamente.", tone: "coral", durationMs: 9000 });
    }
  };

  // Category CRUD
  const addRootCat=(nome,cor,icon)=>setCats(p=>[...p,{ id:"cat"+uid(), nome, cor:cor||"#B0BEC5", icon:icon||"📦", subs:[] }]);
  const addSubCat=(parentId,nome)=>{ const ins=(list)=>list.map(c=>c.id===parentId?{ ...c, subs:[...(c.subs||[]),{ id:"sub"+uid(), nome, subs:[] }] }:{ ...c, subs:ins(c.subs||[]) }); setCats(ins); };
  const delCat=(id)=>{
    const ids = collectCatAndDescendantIds(cats, id);
    const emUso = trans.filter(t=>ids.has(t.catId)).length + despPess.filter(d=>ids.has(d.catId)).length;
    if (emUso > 0) {
      alert(`Não é possível excluir. Existem ${emUso} lançamento(s)/despesa(s) usando esta categoria ou suas subcategorias. Recategorize-os antes de excluir.`);
      return;
    }
    const rem=(list)=>list.filter(c=>c.id!==id).map(c=>({ ...c, subs:rem(c.subs||[]) }));
    setCats(rem);
    setMetas(prev => { const next = {...prev}; ids.forEach(cid=>delete next[cid]); return next; });
    setParams(prev => ({ ...prev, autoCategoryRules: (Array.isArray(prev.autoCategoryRules)?prev.autoCategoryRules:[]).filter(r=>!ids.has(r.catId)) }));
  };
  const renameCat=(id,nome)=>{ const upd=(list)=>list.map(c=>c.id===id?{ ...c,nome }:{ ...c, subs:upd(c.subs||[]) }); setCats(upd); };
  const recolorCat=(id,cor)=>setCats(p=>p.map(c=>c.id===id?{ ...c,cor }:c));

  // Referential-integrity checks used to block exclusão de cartão/conta em uso (E3/L5)
  const cardDependents = (cardId) => ({
    lanc: trans.filter(t=>t.cartaoId===cardId).length,
    fat: faturas.filter(f=>f.cardId===cardId).length,
    comp: despPess.filter(d=>d.cartaoId===cardId).length,
    sim: sims.filter(s=>s.cartaoId===cardId).length,
  });
  const contaDependents = (contaId) => ({
    lanc: trans.filter(t=>t.contaId===contaId).length,
    cartoesVinc: cards.filter(cd=>getCardPaymentAccountId(cd)===contaId).length,
    fat: faturas.filter(f=>f.accountId===contaId||f.contaPagamentoId===contaId).length,
  });

  // v0.3.32 — Reatribuição em massa (mover lançamentos antes de excluir) +
  // recategorização de categoria inteira. Toda mutação passa pelo serviço puro
  // reassignmentService (snapshot completo, operação atômica) e por um toast com
  // undo que restaura o snapshot anterior.
  const REASSIGN_REASON_MSG = {
    source_invoice_closed: "Este cartão tem fatura fechada. Reabra a(s) fatura(s) antes de mover os lançamentos.",
    dest_invoice_closed: "Os lançamentos cairiam numa fatura já fechada do cartão de destino. Reabra-a antes de mover.",
    card_not_found: "Cartão de destino inválido.",
    account_not_found: "Conta de destino inválida.",
    same_card: "Escolha um cartão de destino diferente.",
    same_account: "Escolha uma conta de destino diferente.",
  };

  // Move os lançamentos do cartão `fromId` para `toId` e exclui o cartão de
  // origem. Retorna o resultado do serviço (para a UI exibir o motivo de bloqueio).
  const reassignAndDeleteCard = (fromId, toId) => {
    const res = moveCardTransactions({ trans, faturas, despPess, sims, cards }, { fromCardId: fromId, toCardId: toId });
    if (!res.ok) return res;
    const before = { trans, faturas, despPess, sims, cards };
    const toNome = cards.find(c=>c.id===toId)?.nome || "cartão";
    setTrans(res.trans); setFaturas(res.faturas); setDespPess(res.despPess); setSims(res.sims);
    setCards(cards.filter(c=>c.id!==fromId));
    pushToast({
      message: `${res.moved} lançamento(s) movido(s) para ${toNome} e cartão excluído.`,
      onUndo: () => { setTrans(before.trans); setFaturas(before.faturas); setDespPess(before.despPess); setSims(before.sims); setCards(before.cards); },
    });
    return res;
  };

  // Move os lançamentos da conta `fromId` para `toId` e exclui a conta de origem.
  const reassignAndDeleteAccount = (fromId, toId) => {
    const res = moveAccountTransactions({ trans, cards, faturas, contas }, { fromAccountId: fromId, toAccountId: toId });
    if (!res.ok) return res;
    const before = { trans, cards, faturas, contas };
    const toNome = contas.find(c=>c.id===toId)?.nome || "conta";
    setTrans(res.trans); setCards(res.cards); setFaturas(res.faturas);
    setContas(contas.filter(c=>c.id!==fromId));
    pushToast({
      message: `${res.moved} lançamento(s) movido(s) para ${toNome} e conta excluída.`,
      onUndo: () => { setTrans(before.trans); setCards(before.cards); setFaturas(before.faturas); setContas(before.contas); },
    });
    return res;
  };

  // ── Transferência entre contas (v0.3.33, Fase 1 — DEC-0034 / RN031) ────────
  // transferService: par atômico (snapshot completo de trans), aplicado num
  // único setTrans. Movimento nulo — não é receita nem despesa (RN031).
  const TRANSFER_REASON_MSG = {
    account_not_found: "Escolha as duas contas.",
    same_account: "Escolha uma conta de destino diferente da origem.",
    invalid_amount: "Informe um valor maior que zero.",
    missing_date: "Informe a data da transferência.",
  };

  const realizarTransferencia = () => {
    const res = createTransfer({ trans, contas }, {
      fromAccountId: form.fromAccountId,
      toAccountId: form.toAccountId,
      valor: moneyToNumber(form.valor),
      data: form.data,
      descricao: form.descricao,
      uid,
    });
    if (!res.ok) { alert(TRANSFER_REASON_MSG[res.reason] || "Não foi possível criar a transferência."); return; }
    setTrans(res.trans);
    closeModal();
  };

  const excluirTransferencia = (transferId) => {
    const before = trans;
    const res = deleteTransfer({ trans }, { transferId });
    if (!res.ok) return res;
    setTrans(res.trans);
    pushToast({
      message: "Transferência excluída.",
      onUndo: () => setTrans(before),
    });
    return res;
  };

  // ── Cofrinhos (v0.3.34 — DEC-0035/RN032) ──────────────────────────────────
  const COFRINHO_REASON_MSG = {
    missing_name: "Informe um nome para o cofrinho.",
    invalid_amount: "Informe um valor maior que zero.",
    missing_date: "Informe a data-alvo do cofrinho.",
    invalid_type: "Tipo de movimento inválido.",
    insufficient_balance: "Saldo insuficiente para essa retirada.",
    not_found: "Cofrinho não encontrado.",
  };

  const criarCofrinho = () => {
    const res = createCofrinho({ cofrinhos }, {
      nome: form.nome, valorAlvo: moneyToNumber(form.valorAlvo), dataAlvo: form.dataAlvo, uid,
    });
    if (!res.ok) { alert(COFRINHO_REASON_MSG[res.reason] || "Não foi possível criar o cofrinho."); return; }
    setCofrinhos(res.cofrinhos);
    closeModal();
  };

  const excluirCofrinho = (id) => {
    const before = cofrinhos;
    const res = deleteCofrinho({ cofrinhos }, { id });
    if (!res.ok) return;
    setCofrinhos(res.cofrinhos);
    pushToast({ message: "Cofrinho excluído.", onUndo: () => setCofrinhos(before) });
  };

  const registrarMovimentoCofrinho = () => {
    const res = addMovimentoCofrinho({ cofrinhos }, {
      cofrinhoId: form.cofrinhoId, valor: moneyToNumber(form.valor), data: form.data, tipo: form.tipoMovimento || "aporte", uid,
    });
    if (!res.ok) { alert(COFRINHO_REASON_MSG[res.reason] || "Não foi possível registrar o movimento."); return; }
    setCofrinhos(res.cofrinhos);
    closeModal();
  };

  const excluirMovimentoCofrinho = (cofrinhoId, movimentoId) => {
    const before = cofrinhos;
    const res = removeMovimentoCofrinho({ cofrinhos }, { cofrinhoId, movimentoId });
    if (!res.ok) return;
    setCofrinhos(res.cofrinhos);
    pushToast({ message: "Movimento removido.", onUndo: () => setCofrinhos(before) });
  };

  // Recategoriza por completo: move todos os lançamentos/despesas de `fromCatId`
  // (e descendentes) para `toCatId`. A categoria de origem permanece (o usuário
  // decide depois se a exclui).
  const recategorizeWholeCat = (fromCatId, toCatId) => {
    const fromCatIds = collectCatAndDescendantIds(cats, fromCatId);
    const res = recategorizeCategory({ trans, despPess }, { fromCatIds, toCatId });
    if (!res.ok) return res;
    const before = { trans, despPess };
    const toNome = flatCats.find(f=>f.id===toCatId)?.nome || "categoria";
    setTrans(res.trans); setDespPess(res.despPess);
    pushToast({
      message: `${res.moved} lançamento(s) recategorizado(s) para ${toNome}.`,
      onUndo: () => { setTrans(before.trans); setDespPess(before.despPess); },
    });
    return res;
  };

  // Import
  const categorizeImportRow=(desc,tipo="despesa")=>guessCategoryForTransaction({
    desc,
    tipo,
    params,
    trans,
    cats,
  });

  const extractPdfTextFromFile=async(file)=>{
    const pdfjsLib=await loadPdfjs();
    const buffer=await file.arrayBuffer();
    const pdf=await pdfjsLib.getDocument({ data:buffer }).promise;
    const pages=[];
    for(let pageNum=1;pageNum<=pdf.numPages;pageNum+=1){
      const page=await pdf.getPage(pageNum);
      const content=await page.getTextContent();
      const items=(content.items||[])
        .map(item=>({ text:String(item.str||"").trim(), x:item.transform?.[4]||0, y:item.transform?.[5]||0 }))
        .filter(item=>item.text);
      items.sort((a,b)=>Math.abs(b.y-a.y)>2?b.y-a.y:a.x-b.x);
      const lines=[];
      items.forEach(item=>{
        const last=lines[lines.length-1];
        if(last&&Math.abs(last.y-item.y)<=2) last.parts.push(item);
        else lines.push({ y:item.y, parts:[item] });
      });
      pages.push(lines.map(line=>line.parts.sort((a,b)=>a.x-b.x).map(part=>part.text).join(" ")).join("\n"));
    }
    return pages.join("\n");
  };

  const readFileAsText=(file,encoding="ISO-8859-1")=>new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=e=>resolve(String(e.target.result||""));
    reader.onerror=()=>reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsText(file,encoding);
  });

  const handleFile=(file)=>{
    if(!file) return;
    if(impMode==="cartao"&&!impCId){ setImpErr("Selecione o cartão antes de carregar o arquivo."); return; }
    if(impMode==="cartao"&&!impCompetencia){ setImpErr("Informe a competência da fatura antes de carregar o arquivo."); return; }
    if(impMode==="cartao"){
      const card = cards.find(c => c.id === impCId);
      if(card && isInvoiceClosedForNewEntries(faturas, card, impCompetencia)){
        setImpErr(`A fatura de ${card.nome} em ${formatMonthBR(impCompetencia)} está ${invoiceClosureLabel(getInvoiceClosureStatusForMonth(faturas, card, impCompetencia)).toLowerCase()}. Reabra a fatura antes de importar lançamentos.`);
        return;
      }
    }
    if((impMode==="bancario"||impMode==="vale")&&!impContaId){ setImpErr("Selecione a conta de destino antes de carregar o arquivo."); return; }
    if(impMode==="vale"&&!impValeYear){ setImpErr("Informe o ano do extrato antes de carregar o arquivo."); return; }
    setImpErr(""); setImpFile(file.name); setImpIgnored([]); setLastImportReport(null);

    const processText=(t,ext)=>{
      let rows=[];
      const ignoredRows = extractIgnoredBankRows(t, { mode: impMode, createId: uid });
      setImpIgnored(ignoredRows);
      try{
        if(impMode==="vale") rows=parseValePluxeeText(t, { valeYear: impValeYear, contaId: impContaId, categorize: categorizeImportRow, createId: uid });
        else if(impMode==="bancario") rows=parseBankFile(t, ext, { bancoImportacao: impBanco, contaId: impContaId, categorize: categorizeImportRow, createId: uid });
        else if(ext==="ofx"||ext==="qfx"||t.includes("<STMTTRN>")) rows=parseOFX(t, { mode:"cartao", bancoImportacao: impBanco, categorize: categorizeImportRow, createId: uid });
        else rows=parseCardCSV(t, { categorize: categorizeImportRow, createId: uid });
      }catch(err){ setImpErr("Erro: "+err.message); return; }
      if(impMode === "cartao") {
        // v0.3.26.5: identifica o master lógico antes da expansão e evita falso duplicado entre parcelas futuras.
        // Regra: cartão + descrição base + data da compra + valor da parcela com tolerância de R$ 0,05.
        // Linhas que já pertencem a master existente não devem ser expandidas novamente.
        const preparedRows = prepareCardImportRows(rows, { transactions:trans, cartaoId:impCId, defaultCompetencia:impCompetencia });
        const { expandable, blocked } = splitCardRowsForExpansion(preparedRows);
        const expandedRows = expandImportedRows(expandable, { impCompetencia, createId: uid });
        rows = prepareCardImportRows([...expandedRows, ...blocked], { transactions:trans, cartaoId:impCId, defaultCompetencia:impCompetencia });
      } else {
        rows=expandImportedRows(rows, { impCompetencia, createId: uid });
      }
      if(!rows.length){ setImpErr(ignoredRows.length ? `Nenhuma transação importável encontrada. ${ignoredRows.length} linha(s) foram ignoradas por regra de importação.` : "Nenhuma transação encontrada."); return; }
      const destinationId = impMode === "cartao" ? impCId : impContaId;
      let dups;
      if(impMode === "cartao") {
        dups = buildCardImportDuplicateSet(rows, { transactions:trans, cartaoId:impCId });
      } else {
        const exactKeys = new Set(trans.filter(t2=>t2.contaId===impContaId&&t2.origem!=="cartao").map(t2=>buildImportKey({ ...t2, importTipo:impMode }, t2.contaId, mKey(t2.data), impMode)));
        const legacyKeys = new Set(trans.filter(t2=>t2.contaId===impContaId&&t2.origem!=="cartao").map(t2=>buildLegacyImportKey({ ...t2, importTipo:impMode }, t2.contaId, impMode)));
        const strictKeys = buildExistingImportDuplicateKeys(trans, { mode:impMode, contaId:impContaId, cartaoId:impCId });
        const seen=new Set();
        const seenStrict=new Set();
        dups=new Set();
        rows.forEach(r2=>{
          const exact=buildImportKey(r2);
          const legacy=buildLegacyImportKey(r2);
          const strictCandidates=buildImportDuplicateKeyCandidates(r2, { mode:impMode, destinationId });
          const hasStrictDuplicate = strictCandidates.some(key => strictKeys.has(key) || seenStrict.has(key));
          if(exactKeys.has(exact)||legacyKeys.has(legacy)||hasStrictDuplicate||seen.has(exact)) dups.add(r2._id);
          seen.add(exact);
          strictCandidates.forEach(key => seenStrict.add(key));
        });
      }
      setImpDups(dups);
      setImpTog(Object.fromEntries(rows.map(r2=>[r2._id,!dups.has(r2._id) && !(impMode==="cartao" && isCardCreditRowBlocked(r2))])));
      setImpRows(rows);
      setImpTransferLinks({});
      setImpStep("review");
    };

    const ext=file.name.split(".").pop().toLowerCase();
    if(ext==="pdf"){
      if(impMode!=="vale"){ setImpErr("PDF está disponível nesta etapa apenas para extratos Pluxee de vales."); return; }
      extractPdfTextFromFile(file)
        .then(text=>processText(text,ext))
        .catch(err=>setImpErr("Erro ao ler PDF. Verifique se a dependência pdfjs-dist está instalada. Detalhe: "+err.message));
      return;
    }
    readFileAsText(file,"ISO-8859-1")
      .then(text=>processText(text,ext))
      .catch(err=>setImpErr("Erro: "+err.message));
  };
  const confirmImport=()=>{
    if(impMode==="cartao"&&!impCId){ setImpErr("Selecione o cartão."); return; }
    if(impMode==="cartao"&&!impCompetencia){ setImpErr("Informe a competência da fatura."); return; }
    if(impMode==="cartao"){
      const card = cards.find(c => c.id === impCId);
      if(card && isInvoiceClosedForNewEntries(faturas, card, impCompetencia)){
        setImpErr(`A fatura de ${card.nome} em ${formatMonthBR(impCompetencia)} está ${invoiceClosureLabel(getInvoiceClosureStatusForMonth(faturas, card, impCompetencia)).toLowerCase()}. Reabra a fatura antes de salvar a importação.`);
        return;
      }
    }
    if((impMode==="bancario"||impMode==="vale")&&!impContaId){ setImpErr("Selecione a conta de destino."); return; }
    const destinationId = impMode === "cartao" ? impCId : impContaId;
    const selectedRows = impRows.filter(r=>impTog[r._id]);
    // v0.3.33 (Fase 2 — DEC-0034/RN031): duas linhas não podem vincular a
    // transferência para a MESMA transação já existente — ambíguo e, se
    // permitido, a segunda tentativa de vínculo falharia silenciosamente
    // (already_linked) e cairia como despesa comum sem o usuário perceber.
    if(impMode==="bancario"){
      const linkedTargets = selectedRows.map(r=>impTransferLinks[r._id]).filter(Boolean);
      const seenTargets = new Set();
      const targetDuplicado = linkedTargets.find(id=>{ if(seenTargets.has(id)) return true; seenTargets.add(id); return false; });
      if(targetDuplicado){
        setImpErr("Duas linhas selecionadas estão vinculadas à mesma transação de destino. Ajuste os vínculos de transferência (🔁) antes de confirmar.");
        return;
      }
    }
    if(impMode==="cartao" && selectedRows.some(r=>isCardCreditRowBlocked(r))){
      setImpErr("Classifique todos os créditos selecionados (pagamento de fatura anterior, reparcelamento de compra à vista ou estorno) antes de importar.");
      return;
    }
    if(impMode==="cartao"){
      const card = cards.find(c => c.id === impCId);
      const creditoComFaturaFechada = selectedRows.find(r=>{
        if(r.tipo!=="receita"||r.creditoTipo===CARD_CREDIT_TYPES.PAGAMENTO_FATURA_ANTERIOR) return false;
        const alvo = resolveCardCreditCompetencia(r, impCompetencia);
        return alvo && card && isInvoiceClosedForNewEntries(faturas, card, alvo);
      });
      if(creditoComFaturaFechada){
        const alvo = resolveCardCreditCompetencia(creditoComFaturaFechada, impCompetencia);
        setImpErr(`A fatura de ${card.nome} em ${formatMonthBR(alvo)} está ${invoiceClosureLabel(getInvoiceClosureStatusForMonth(faturas, card, alvo)).toLowerCase()}. Reabra a fatura antes de lançar este crédito nela.`);
        return;
      }
    }
    let duplicateIds = new Set(impDups);
    if(impMode === "cartao") {
      duplicateIds = revalidateSelectedCardImportRows(selectedRows, { transactions:trans, cartaoId:impCId, initialDuplicateIds:duplicateIds });
    } else {
      const strictKeys = buildExistingImportDuplicateKeys(trans, { mode:impMode, contaId:impContaId, cartaoId:impCId });
      const seenStrict = new Set();
      selectedRows.forEach(r=>{
        const strictCandidates = buildImportDuplicateKeyCandidates(r, { mode:impMode, destinationId });
        if(strictCandidates.some(key => strictKeys.has(key) || seenStrict.has(key))) duplicateIds.add(r._id);
        strictCandidates.forEach(key => seenStrict.add(key));
      });
    }
    if(duplicateIds.size !== impDups.size) {
      setImpDups(duplicateIds);
      setImpTog(prev=>Object.fromEntries(impRows.map(r=>[r._id, Boolean(prev[r._id]) && !duplicateIds.has(r._id)])));
    }
    const ok=selectedRows.filter(r=>!duplicateIds.has(r._id));
    const creditosDesconsiderados = impMode==="cartao" ? ok.filter(isCardCreditDiscardedOnImport) : [];
    const okFinal = impMode==="cartao" ? ok.filter(r=>!isCardCreditDiscardedOnImport(r)) : ok;
    const importBatchId=`batch_${uid()}`;
    const duplicadas = impRows.filter(r=>duplicateIds.has(r._id));
    const desmarcadas = impRows.filter(r=>!impTog[r._id]&&!duplicateIds.has(r._id));
    const reportBase = {
      id:importBatchId,
      arquivo:impFile,
      data:new Date().toISOString(),
      modo:impMode,
      destino:impMode==="cartao"?(cards.find(c=>c.id===impCId)?.nome||"Cartão"):(contas.find(c=>c.id===impContaId)?.nome||"Conta"),
      competencia:impMode==="cartao"?impCompetencia:(impMode==="vale"?impValeYear:null),
      totalLidas:impRows.length + impIgnored.length,
      importadas:okFinal.length,
      duplicadas:duplicadas.length,
      ignoradas:impIgnored.length,
      desmarcadas:desmarcadas.length,
      creditosDesconsiderados:creditosDesconsiderados.length,
      valorLiquido:okFinal.reduce((s,r)=>s+(r.tipo==="receita"?r.valor:-r.valor),0),
      ignoradasDetalhe:impIgnored.slice(0,20),
      duplicadasDetalhe:duplicadas.slice(0,20).map(r=>({ data:r.data, descricao:r.descricao, valor:r.valor, tipo:r.tipo, motivo:r._cardInstallmentReason || "Duplicidade identificada" })),
      creditosDesconsideradosDetalhe:creditosDesconsiderados.slice(0,20).map(r=>({ data:r.data, descricao:r.descricao, valor:r.valor })),
    };
    if(impMode==="bancario"||impMode==="vale"){
      const conta=contas.find(c=>c.id===impContaId);
      // v0.3.33 (Fase 2 — DEC-0034/RN031): linhas com vínculo de transferência
      // CONFIRMADO pelo usuário (impTransferLinks) não viram despesa comum —
      // a transação de crédito já existente é convertida em perna de entrada
      // e só a perna de saída é criada nova (ver transferMatchService.js).
      const linkedRows = impMode==="bancario" ? okFinal.filter(r=>impTransferLinks[r._id]) : [];
      const linkedIds = new Set(linkedRows.map(r=>r._id));
      const normalRows = okFinal.filter(r=>!linkedIds.has(r._id));
      setTrans(prev=>{
        let next=[...prev,...normalRows.map(r=>({
          id:uid(), tipo:r.tipo, origem:conta?.tipo||"corrente", cartaoId:null, contaId:impContaId,
          catId:r.catId, descricao:r.descricao, valor:r.valor, data:r.data,
          fixo:false, importado:true, importTipo:impMode, bancoImportacao:impMode==="bancario"?impBanco:null, fornecedorVale:r.fornecedorVale||null, carteiraVale:r.carteiraVale||null, hora:r.hora||null, importBatchId, status:"pago", valorPago:r.valor, competencia:mKey(r.data),
        }))];
        linkedRows.forEach(r=>{
          const res = linkImportedRowAsTransfer({ trans: next }, {
            existingTransactionId: impTransferLinks[r._id],
            sourceContaId: impContaId,
            valor: r.valor,
            data: r.data,
            descricao: r.descricao,
            importBatchId,
            importTipo: impMode,
            bancoImportacao: impBanco,
            uid,
          });
          if(res.ok){
            next = res.trans;
          } else {
            // Fallback conservador: se o vínculo não puder ser aplicado (ex.:
            // a transação de destino mudou de estado entre a prévia e a
            // confirmação), a linha NUNCA é descartada silenciosamente — cai
            // como despesa comum, igual ao comportamento sem vínculo.
            next = [...next, {
              id:uid(), tipo:r.tipo, origem:conta?.tipo||"corrente", cartaoId:null, contaId:impContaId,
              catId:r.catId, descricao:r.descricao, valor:r.valor, data:r.data,
              fixo:false, importado:true, importTipo:impMode, bancoImportacao:impMode==="bancario"?impBanco:null, importBatchId, status:"pago", valorPago:r.valor, competencia:mKey(r.data),
            }];
          }
        });
        return next;
      });
    } else {
      setTrans(p=>[...p,...okFinal.map(r=>({
        id:uid(), tipo:r.tipo||"despesa", origem:"cartao", cartaoId:impCId, contaId:null,
        catId:r.catId, descricao:r.descricao, valor:r.valor, data:r.data, dataCompra:r.dataCompra||r.data,
        competencia:resolveCardCreditCompetencia(r, impCompetencia), fixo:false, importado:true, importTipo:"cartao", importBatchId,
        parcela:r.parcela||null, totalParcelas:r.totalParcelas||null, parcelaGrupo:r.parcelaGrupo||buildCardInstallmentGroupId(r, { cartaoId:impCId })||null, descricaoBaseParcelamento:r.descricaoBaseParcelamento||null, parcelado:Boolean(r.parcela&&r.totalParcelas), status:"pago", valorPago:r.valor,
        creditoTipo:r.creditoTipo||null,
      }))]);
    }
    setLastImportReport(reportBase);
    setImpStep("done");
  };
  const resetImport=()=>{ setImpStep("upload"); setImpRows([]); setImpTog({}); setImpErr(""); setImpFile(""); setImpDups(new Set()); setImpIgnored([]); setImpTransferLinks({}); };

  // v0.3.33 (Fase 2 — DEC-0034/RN031): candidatos a transferência entre
  // contas na importação bancária. Só CALCULA — nunca vincula sozinho (ver
  // toggleTransferLink, acionado explicitamente pelo usuário na prévia).
  const transferMatchCandidates = useMemo(() => {
    if (impMode !== "bancario" || !impContaId) return {};
    return findTransferMatchCandidates({
      rows: impRows,
      trans,
      contas,
      sourceContaId: impContaId,
      duplaEntradaDias: params.duplaEntradaDias,
    });
  }, [impMode, impContaId, impRows, trans, contas, params.duplaEntradaDias]);

  // Alterna o vínculo de transferência de uma linha. Confirmação explícita:
  // marcar liga a candidata escolhida (a melhor, por padrão — a primeira do
  // array já ordenado por proximidade de data); desmarcar volta a linha para
  // importação normal como despesa. RN031: nunca automático.
  const toggleTransferLink = (rowId, transactionId) => {
    setImpTransferLinks(prev => {
      const next = { ...prev };
      if (next[rowId] === transactionId) delete next[rowId];
      else next[rowId] = transactionId;
      return next;
    });
  };

  const installmentDivergenceRows = useMemo(() => (
    impMode === "cartao"
      ? impRows.filter(row => row?._cardInstallmentCanCorrectSequence && row?._cardInstallmentCorrection)
      : []
  ), [impMode, impRows]);

  const installmentCorrectionPreview = useMemo(() => {
    if (impMode !== "cartao") return {};
    return Object.fromEntries(installmentDivergenceRows.map(row => [
      row._id,
      getCardInstallmentCorrectionPreview(trans, row._cardInstallmentCorrection),
    ]));
  }, [impMode, installmentDivergenceRows, trans]);

  // Linhas selecionadas que de fato serão importadas. No modo cartão, créditos
  // classificados como "pagamento da fatura anterior" são descartados no
  // confirmImport; a prévia (Total selecionado e contador) deve refleti-lo.
  const impSelectedForImport = useMemo(() => {
    const selecionadas = impRows.filter(r => impTog[r._id]);
    return impMode === "cartao" ? selecionadas.filter(r => !isCardCreditDiscardedOnImport(r)) : selecionadas;
  }, [impRows, impTog, impMode]);

  const markInstallmentDivergenceAsKept = (row) => {
    if (!row?._id) return;
    setImpTog(prev => ({ ...prev, [row._id]: false }));
    setImpRows(prev => prev.map(item => item._id === row._id ? {
      ...item,
      _cardInstallmentUserDecision: "mantido sem alteração",
    } : item));
    setImpErr("Divergência mantida sem alteração. A linha continuará fora da importação.");
  };

  const applyInstallmentDivergenceResolution = (row, mode) => {
    if (impMode !== "cartao" || !row?._cardInstallmentCanCorrectSequence || !row?._cardInstallmentCorrection) return;
    const correction = row._cardInstallmentCorrection;
    const actionLabel = mode === "current_only" ? "alterar somente a parcela desta competência" : "alterar a parcela atual e as subsequentes";
    const msg = `Confirmar correção do parcelamento?\n\nAção: ${actionLabel}.\nCompetência inicial: ${correction.competencia}.\nArquivo: ${correction.parcela || row.parcela}/${correction.totalParcelas || row.totalParcelas}.\n\nNenhuma nova parcela final será criada automaticamente. Esta ação altera lançamentos já gravados no cartão.`;
    if (!window.confirm(msg)) return;

    const result = applyCardInstallmentSequenceCorrection(trans, correction, { mode });
    if (result.error) {
      setImpErr(result.error);
      return;
    }

    setTrans(result.transactions);
    const refreshedRows = prepareCardImportRows(impRows, { transactions:result.transactions, cartaoId:impCId, defaultCompetencia:impCompetencia })
      .map(item => item._id === row._id ? {
        ...item,
        _cardInstallmentUserDecision: mode === "current_only" ? "alterada somente a competência atual" : "alterada competência atual e futuras",
      } : item);
    const refreshedDups = buildCardImportDuplicateSet(refreshedRows, { transactions:result.transactions, cartaoId:impCId });
    setImpRows(refreshedRows);
    setImpDups(refreshedDups);
    setImpTog(Object.fromEntries(refreshedRows.map(r=>[r._id,!refreshedDups.has(r._id) && !isCardCreditRowBlocked(r)])));
    setImpErr(`Correção aplicada em ${result.changedCount} parcela(s). Revise a prévia novamente antes de confirmar a importação.`);
  };

  const importBatches = useMemo(()=>{
    const map = new Map();
    trans.filter(t=>t.importado&&t.importBatchId).forEach(t=>{
      const key=t.importBatchId;
      const prev=map.get(key)||{ id:key, qtd:0, valorLiquido:0, primeiraData:t.data, ultimaData:t.data, tipo:t.importTipo||"importado", destinoId:t.cartaoId||t.contaId, destinoNome:"", createdAt:t.createdAt||"" };
      prev.qtd += 1;
      prev.valorLiquido += (t.tipo==="receita"?Number(t.valor)||0:-(Number(t.valor)||0));
      if(t.data && (!prev.primeiraData || t.data<prev.primeiraData)) prev.primeiraData=t.data;
      if(t.data && (!prev.ultimaData || t.data>prev.ultimaData)) prev.ultimaData=t.data;
      prev.createdAt = prev.createdAt || t.createdAt || "";
      map.set(key, prev);
    });
    return [...map.values()].map(b=>{
      const destino = b.tipo==="cartao" ? cards.find(c=>c.id===b.destinoId)?.nome : contas.find(c=>c.id===b.destinoId)?.nome;
      return { ...b, destinoNome:destino||b.destinoId||"—" };
    }).sort((a,b)=>(b.createdAt||b.ultimaData||"").localeCompare(a.createdAt||a.ultimaData||""));
  },[trans,cards,contas]);

  const undoImportBatch=(batchId)=>{
    const lote=importBatches.find(b=>b.id===batchId);
    if(!lote) return;
    if(!window.confirm(`Desfazer o lote ${batchId}? ${lote.qtd} lançamento(s) importado(s) serão removidos.`)) return;
    // v0.3.33 (Fase 2 — DEC-0034/RN031): antes de remover as linhas do lote,
    // reverte qualquer conversão de crédito em transferência originada dele —
    // a perna de saída nova (deste lote) é removida pelo filtro abaixo, mas a
    // perna de crédito convertida (de OUTRO lote/manual) só volta a ser um
    // lançamento comum, nunca é apagada (ver transferMatchService.js).
    setTrans(prev=>revertTransferLinksFromBatch(prev, batchId).filter(t=>t.importBatchId!==batchId));
    if(lastImportReport?.id===batchId) setLastImportReport(null);
  };

  const exportCreditCardExpensesTxt=(cardId, monthKey=selMonth)=>{
    const card=cards.find(c=>c.id===cardId);
    if(!card) return;
    const rows=trans
      .filter(t=>t.origem==="cartao"&&t.cartaoId===cardId&&transMonthKey(t)===monthKey)
      .sort((a,b)=>(a.data||"").localeCompare(b.data||""));
    if(!rows.length){ alert("Não há despesas de cartão para exportar nesta competência."); return; }
    const header=["competencia","cartao","data_compra","descricao","categoria","parcela","total_parcelas","tipo","valor"].join(";");
    const esc=(v)=>`"${String(v??"").replace(/"/g,'""')}"`;
    const body=rows.map(t=>[
      monthKey,
      card.nome,
      t.dataCompra||t.data,
      t.descricao,
      catLabel(cats,t.catId),
      t.parcela||"",
      t.totalParcelas||"",
      t.natureza==="ajuste_fatura_cartao"?"ajuste_fatura":"despesa_cartao",
      signedCardAmount(t).toFixed(2).replace(".",",")
    ].map(esc).join(";")).join("\n");
    const total=rows.reduce((s,t)=>s+signedCardAmount(t),0);
    const footer=["TOTAL",esc(monthKey),esc(card.nome),esc(total.toFixed(2).replace(".",","))].join(";");
    const txt=[`Finanças PRO - Despesas do cartão`, `Gerado em: ${new Date().toLocaleString("pt-BR")}`, `Competência: ${monthKey}`, `Cartão: ${card.nome}`, "", header, body, "", footer].join("\n");
    const blob=new Blob([txt],{ type:"text/plain;charset=utf-8" });
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`despesas-cartao-${normText(card.nome).replace(/[^a-z0-9]+/g,"-")}-${monthKey}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived data required by tabs/modals ───────────────────────────────────
  const rootCats = useMemo(() => cats, [cats]);

  const filteredTransactions = useMemo(() => filterTransactions({
    transactions: trans,
    monthTransactions: monthTrans,
    filters: transactionFilters,
    cats,
    findRootCat,
  }), [transactionFilters, trans, monthTrans, cats]);

  const updateTransactionCategory = useCallback((transactionId, catId) => {
    setTrans(prev => prev.map(t => t.id === transactionId ? { ...t, catId, updatedAt:new Date().toISOString() } : t));
  }, [setTrans]);

  const renderCategoryEditor = useCallback((t, compact = false) => {
    const editing = editingCategoryId === t.id;
    return (
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:compact?"nowrap":"wrap" }}>
        {editing ? (
          <>
            <CategorySelect
              cats={cats}
              value={t.catId}
              onChange={v=>updateTransactionCategory(t.id, v)}
              style={{ fontSize:compact?10:11, padding:compact?"4px 7px":"5px 8px", minWidth:compact?145:170 }}
            />
            <button onClick={()=>setEditingCategoryId(null)} style={ghost({ padding:compact?"3px 6px":"4px 8px", fontSize:compact?10:11, color:C.emerald })}>OK</button>
          </>
        ) : (
          <>
            <span style={{ fontSize:compact?10:11, background:getCatColor(t.catId)+"22", color:getCatColor(t.catId), padding:compact?"2px 5px":"2px 7px", borderRadius:20, fontWeight:600, whiteSpace:"nowrap" }}>
              {getCatIcon(t.catId)} {getCatLabel(t.catId)}
            </span>
            <button onClick={()=>setEditingCategoryId(t.id)} style={ghost({ padding:compact?"2px 5px":"3px 7px", fontSize:compact?10:11, color:C.gold })}>Editar</button>
          </>
        )}
      </div>
    );
  }, [editingCategoryId, cats, updateTransactionCategory, getCatColor, getCatIcon, getCatLabel]);

  const gastoCatMes = useMemo(() => {
    const map = {};
    monthTrans
      .filter(t =>
        t.tipo === "despesa" &&
        (t.origem === "corrente" ||
         t.origem === "vale_alimentacao" ||
         t.origem === "vale_refeicao")
      )
      .forEach(t => {
        const root = findRootCat(cats, t.catId);
        const nome = root?.nome || "Outros";
        map[nome] = (map[nome] || 0) + t.valor;
      });
    return map;
  }, [monthTrans, cats]);

  const contasDisponiveis = useMemo(() => contas, [contas]);
  const isCartao = form.origemTipo === "cartao";

  const recPreview = useMemo(() => {
    if (!form.fixo || !form.fixoDia || !form.fixoMeses) return [];

    const meses = Math.min(4, parseInt(form.fixoMeses) || 0);
    const dia = parseInt(form.fixoDia) || 1;
    const [startY, startM] = selMonth.split("-").map(Number);

    return Array.from({ length: meses }, (_, i) => {
      const maxDay = new Date(startY, startM + i, 0).getDate();
      const safeDay = Math.min(dia, maxDay);
      const dt = new Date(startY, startM - 1 + i, safeDay);

      return {
        data: dt.toISOString().slice(0, 10),
        mes: `${MONTHS[dt.getMonth()]}/${dt.getFullYear()}`
      };
    });
  }, [form.fixo, form.fixoDia, form.fixoMeses, selMonth]);

  const recorrenciasAgrupadas = useMemo(() => {
    const grupos = new Map();

    trans.filter(t => t.fixo).forEach(t => {
      const id = t.parcelaGrupo || t.recorrenciaId || `single_${t.id}`;
      if (!grupos.has(id)) grupos.set(id, { id, lancamentos: [] });
      grupos.get(id).lancamentos.push(t);
    });

    return Array.from(grupos.values()).map(g => {
      const ordenados = [...g.lancamentos].sort((a, b) => (a.data || "").localeCompare(b.data || ""));
      const sample = ordenados[0] || {};
      const futurosPendentes = ordenados.filter(t => monthCompare(transMonthKey(t), selMonth) > 0 && t.status !== "pago" && t.status !== "parcial").length;
      const previstosEditaveis = ordenados.filter(t => t.status !== "pago" && t.status !== "parcial").length;
      const totalPrevisto = ordenados.reduce((s, t) => s + (Number(t.valor) || 0), 0);
      const totalRealizado = ordenados.reduce((s, t) => s + valorRealizado(t), 0);
      const totalPendente = ordenados.reduce((s, t) => s + saldoPendente(t), 0);

      return {
        ...g,
        lancamentos: ordenados,
        sample,
        inicio: transMonthKey(ordenados[0] || {}),
        fim: transMonthKey(ordenados[ordenados.length - 1] || {}),
        futurosPendentes,
        previstosEditaveis,
        totalPrevisto,
        totalRealizado,
        totalPendente,
      };
    }).sort((a, b) => {
      const byStatus = Number(b.futurosPendentes > 0) - Number(a.futurosPendentes > 0);
      if (byStatus) return byStatus;
      return (a.sample.descricao || "").localeCompare(b.sample.descricao || "");
    });
  }, [trans, selMonth]);

  return (
    <AppShell
      appVersion={APP_VERSION}
      persistError={persistError} setPersistError={setPersistError}
      tab={tab} setTab={setTab}
      selMon={selMon} selYear={selYear} prevMonth={prevMonth} nextMonth={nextMonth}
      openAddTrans={openAddTrans} btn={btn}
      overlays={<>
        <RequiredFieldModal info={requiredModal} onClose={()=>setRequiredModal(null)} />

        {syncConflito && (
          <SyncConflictModal
            conflitos={syncConflito.conflitos}
            local={syncConflito.local}
            remoto={syncConflito.remoto}
            erro={syncConflito.erro}
            onConfirmar={handleSyncConflitoConfirmar}
            onCancelar={handleSyncConflitoCancelar}
            colors={C}
          />
        )}

        <ToastHost toasts={toasts} onDismiss={dismissToast} onUndo={(t)=>t.onUndo&&t.onUndo()} colors={C} />

        <ModalHost
          modal={modal} closeModal={closeModal}
          form={form} setForm={setForm} inp={inp} lbl={lbl} inputStyle={inputStyle} requiredModal={requiredModal}
          cats={cats} cards={cards} contas={contas} contasDisponiveis={contasDisponiveis} contasCorrentes={contasCorrentes}
          isCartao={isCartao} resolveCardCompetencia={resolveCardCompetencia} parcPreview={parcPreview} recPreview={recPreview}
          selMon={selMon} selYear={selYear} selMonth={selMonth}
          addTransaction={addTransaction} realizarTransferencia={realizarTransferencia} criarCofrinho={criarCofrinho}
          registrarMovimentoCofrinho={registrarMovimentoCofrinho} salvarEdicaoRecorrencia={salvarEdicaoRecorrencia} addCard={addCard}
        />
      </>}
    >

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <DashboardTab
            card={card} lbl={lbl} big={big}
            saldoInicialTotal={saldoInicialTotal} contas={contas} getSaldoInicialConta={getSaldoInicialConta} selMonth={selMonth}
            receitas={receitas} receitaCorr={receitaCorr} receitaVales={receitaVales} despCorrTotal={despCorrTotal} despCorr={despCorr} despVales={despVales}
            cardTotals={cardTotals} despCart={despCart} saldoFinal={saldoFinal} monthTrans={monthTrans} last6={last6} catBreakdown={catBreakdown} selMon={selMon} params={params}
          />
        )}

        {/* LANÇAMENTOS */}
        {tab==="lancamentos"&&(
          <LancamentosTab
            transactionFilters={transactionFilters} setTransactionFilters={setTransactionFilters} rootCats={rootCats} card={card} lbl={lbl} inp={inp} ghost={ghost}
            contasCorrentes={contasCorrentes} setForm={setForm} setModal={setModal} openAddTrans={openAddTrans}
            filteredTransactions={filteredTransactions} cards={cards} renderCategoryEditor={renderCategoryEditor} valorExibicaoLancamento={valorExibicaoLancamento}
            baixarTrans={baixarTrans} baixarParcialTrans={baixarParcialTrans} delTrans={delTrans} excluirTransferencia={excluirTransferencia} selMonth={selMonth}
          />
        )}

        {/* RECORRÊNCIAS */}
        {tab==="recorrencias"&&(
          <RecorrenciasTab
            recorrenciasAgrupadas={recorrenciasAgrupadas} cards={cards} contas={contas} getCatColor={getCatColor} getCatIcon={getCatIcon} getCatLabel={getCatLabel}
            card={card} ghost={ghost} openAddTrans={openAddTrans} abrirEdicaoRecorrencia={abrirEdicaoRecorrencia} findarRecorrencia={findarRecorrencia} excluirRecorrencia={excluirRecorrencia}
          />
        )}

        {/* CARTÕES */}
        {tab==="cartoes"&&(
          <CartoesTab
            cardTotals={cardTotals} selMonth={selMonth} monthTrans={monthTrans} params={params} expandedCards={expandedCards} toggleCardAccordion={toggleCardAccordion}
            primeiraContaCorrenteId={primeiraContaCorrenteId} setModal={setModal} setForm={setForm} card={card} lbl={lbl} ghost={ghost} btn={btn}
            renderCategoryEditor={renderCategoryEditor} adicionarAjusteFatura={adicionarAjusteFatura} abrirFaturaCartao={abrirFaturaCartao} fecharFaturaCartao={fecharFaturaCartao} exportCreditCardExpensesTxt={exportCreditCardExpensesTxt}
          />
        )}

        {/* CONTAS */}
        {tab==="contas"&&(
          <ContasTab
            showContaForm={showContaForm} setShowContaForm={setShowContaForm} novaContaForm={novaContaForm} setNovaContaForm={setNovaContaForm} addContaFromForm={addContaFromForm} inputStyle={inputStyle}
            contas={contas} monthTrans={monthTrans} getSaldoInicialConta={getSaldoInicialConta} selMonth={selMonth} expandedAccounts={expandedAccounts} toggleAccountAccordion={toggleAccountAccordion}
            setSaldoInicialContaMes={setSaldoInicialContaMes} renderCategoryEditor={renderCategoryEditor} card={card} lbl={lbl} inp={inp} ghost={ghost}
          />
        )}

        {/* METAS */}
        {tab==="metas"&&(
          <MetasTab rootCats={rootCats} metas={metas} setMetas={setMetas} gastoCatMes={gastoCatMes} selMon={selMon} selYear={selYear} />
        )}

        {/* COFRINHOS — v0.3.34 (DEC-0035/RN032). Extraído para organism
            próprio na Fase 4 (DEC-0038). */}
        {tab==="cofrinhos"&&(
          <CofrinhosTab
            cofrinhos={cofrinhos} selMonth={selMonth} setForm={setForm} setModal={setModal}
            excluirCofrinho={excluirCofrinho} excluirMovimentoCofrinho={excluirMovimentoCofrinho}
          />
        )}

        {/* PESSOAS */}
        {tab==="pessoas"&&<PessoasTab
            pessoas={pessoas} setPessoas={setPessoas}
            dividas={dividas} setDividas={setDividas}
            despPess={despPess} setDespPess={setDespPess}
            cards={cards} cats={cats}
            getCatColor={getCatColor} getCatIcon={getCatIcon} getCatLabel={getCatLabel}
            fmtBRL={fmtBRL} fmtDate={fmtDate} lbl={lbl} big={big}
            card={card} btn={btn} inp={inp} ghost={ghost}
            C={C} uid={uid} selMonth={selMonth}
          />}

        {/* PROJEÇÕES */}
        {tab==="projecoes"&&(
          <ProjecoesTab
            card={card} lbl={lbl} big={big} inp={inp}
            projectionMode={projectionMode} setProjectionMode={setProjectionMode} projectionYear={projectionYear} setProjectionYear={setProjectionYear}
            projectionStartMonth={projectionStartMonth} setProjectionStartMonth={setProjectionStartMonth} projectionEndMonth={projectionEndMonth} setProjectionEndMonth={setProjectionEndMonth}
            projectionFilters={projectionFilters} setProjectionFilters={setProjectionFilters} contas={contas} cards={cards} cats={cats}
            projectionFirst={projectionFirst} projectionTotals={projectionTotals} projectionLast={projectionLast} projectionInsights={projectionInsights} projections={projections}
            expandedProjectionMonths={expandedProjectionMonths} setExpandedProjectionMonths={setExpandedProjectionMonths} getCatLabel={getCatLabel} last6={last6}
          />
        )}

        {/* SIMULAÇÕES */}
        {tab==="simulacoes"&&(
          <SimulacoesTab
            cats={cats} cards={cards} params={params} sims={sims} simTrans={simTrans}
            simForm={simForm} setSimForm={setSimForm} requiredModal={requiredModal} inputStyle={inputStyle} inp={inp}
            addSim={addSim} refazerSim={refazerSim} delSim={delSim} resolveCardCompetencia={resolveCardCompetencia} calcularFaturaCartao={calcularFaturaCartao}
            getCatColor={getCatColor} getCatIcon={getCatIcon} getCatLabel={getCatLabel}
          />
        )}

        {/* IMPORTAÇÃO */}
        {tab==="importacao"&&(
          <ImportacaoTab
            card={card} lbl={lbl} inp={inp} ghost={ghost} btn={btn}
            importBatches={importBatches} undoImportBatch={undoImportBatch}
            impStep={impStep} impMode={impMode} setImpMode={setImpMode} setImpErr={setImpErr} setImpRows={setImpRows} setImpTog={setImpTog} setImpDups={setImpDups} setImpTransferLinks={setImpTransferLinks}
            impCId={impCId} setImpCId={setImpCId} impCompetencia={impCompetencia} setImpCompetencia={setImpCompetencia} impBanco={impBanco} setImpBanco={setImpBanco}
            impContaId={impContaId} setImpContaId={setImpContaId} impValeYear={impValeYear} setImpValeYear={setImpValeYear}
            cards={cards} contas={contas} cats={cats} handleFile={handleFile} impErr={impErr} impFile={impFile} resetImport={resetImport}
            impRows={impRows} impDups={impDups} impIgnored={impIgnored} impTog={impTog} transferMatchCandidates={transferMatchCandidates} impTransferLinks={impTransferLinks} toggleTransferLink={toggleTransferLink}
            installmentDivergenceRows={installmentDivergenceRows} installmentCorrectionPreview={installmentCorrectionPreview} markInstallmentDivergenceAsKept={markInstallmentDivergenceAsKept} applyInstallmentDivergenceResolution={applyInstallmentDivergenceResolution}
            impSelectedForImport={impSelectedForImport} confirmImport={confirmImport} lastImportReport={lastImportReport} setTab={setTab}
          />
        )}

        {/* PARÂMETROS */}
        {tab==="parametros"&&<ParamsTab cats={cats} params={params} setParams={setParams} flatCats={flatCats} addRootCat={addRootCat} addSubCat={addSubCat} delCat={delCat} renameCat={renameCat} recolorCat={recolorCat} cards={cards} setCards={setCards} contas={contas} setContas={setContas} cardDependents={cardDependents} contaDependents={contaDependents} reassignAndDeleteCard={reassignAndDeleteCard} reassignAndDeleteAccount={reassignAndDeleteAccount} recategorizeWholeCat={recategorizeWholeCat} reassignReasonMsg={REASSIGN_REASON_MSG} onExport={handleExport} onImport={handleImport} onReset={handleReset} usuario={usuario} setUsuario={setUsuario} isSupabaseConfigured={isSupabaseConfigured} syncSession={syncSession} syncing={syncing} syncEstado={syncEstado} onSyncLogin={handleSyncLogin} onSyncLogout={handleSyncLogout} onSyncNow={handleSyncNow}/>}

    </AppShell>
  );
}
