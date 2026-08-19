// mergeInvariants.js — v0.3.38 Fase 4 (DEC-0045)
//
// O merge de três vias (mergeService.js) resolve campo a campo dentro de um
// mesmo registro quando os dois lados mudaram campos diferentes — é o que
// permite auto-resolver "filhos diferentes do mesmo pai" sem virar conflito
// (ex.: uma dívida com amortização nova de um lado e nome corrigido do
// outro). Mas em registros com campos financeiramente interdependentes
// (valor/valorPago/status de uma transação, total de uma fatura fechada,
// soma de amortizações de uma dívida, saldo de um cofrinho, pernas de uma
// transferência) essa granularidade pode produzir um resultado sem nenhum
// conflito registrado e ainda assim financeiramente inconsistente — achado
// concreto do especialista-financas na revisão de 2026-08-18 (ver sessão da
// Fase 4).
//
// Este módulo NÃO decide como resolver — só verifica, sobre o payload já
// mesclado (e com as escolhas do usuário já aplicadas), se os invariantes
// financeiros conhecidos ainda se sustentam. `finalizarMerge`
// (mergeService.js) chama isto antes de liberar qualquer payload gravável:
// o que não fechar bloqueia o push, não passa liso.
//
// Cobertura desta fase (achados demonstrados na revisão): coerência
// valor/valorPago/status/pendingAmount de uma transação; total de fatura
// fechada batendo com o recálculo a partir de `trans`; pernas de
// transferência completas; saldo de cofrinho não-negativo; soma de
// amortizações coerente com o status da dívida.
//
// Limitação conhecida, não coberta nesta fase: consistência de grupos de
// parcelamento (`parcelaGrupo`) após merge — cenário mais raro (exige duas
// edições concorrentes na mesma compra parcelada) e mais complexo de
// verificar de forma genérica; registrado como gap para revisão futura, não
// como bug ignorado.

import { computeCardInvoice } from "./cardInvoiceOperations.js";
import { saldoCofrinho } from "./cofrinhoService.js";

const TOLERANCIA = 0.01;

function proximo(a, b) {
  return Math.abs((Number(a) || 0) - (Number(b) || 0)) <= TOLERANCIA;
}

function verificarTransacoes(trans, violacoes) {
  for (const t of trans || []) {
    const valor = Number(t.valor ?? t.amount) || 0;
    const pago = Number(t.valorPago ?? t.paidAmount) || 0;

    if (t.status === "pago" && !proximo(pago, valor)) {
      violacoes.push({
        tipo: "transacao_paga_incoerente",
        id: t.id,
        detalhe: `status "pago" com valorPago (${pago}) diferente do valor (${valor})`,
      });
    }
    if (t.status === "parcial" && (pago <= 0 || pago >= valor)) {
      violacoes.push({
        tipo: "transacao_parcial_incoerente",
        id: t.id,
        detalhe: `status "parcial" com valorPago (${pago}) fora do intervalo (0, ${valor})`,
      });
    }
    if (t.pendingAmount !== undefined && !proximo(t.pendingAmount, Math.max(0, valor - pago))) {
      violacoes.push({
        tipo: "pendingAmount_incoerente",
        id: t.id,
        detalhe: `pendingAmount (${t.pendingAmount}) não bate com valor menos pago (${Math.max(0, valor - pago)})`,
      });
    }
  }
}

function verificarTransferencias(trans, violacoes) {
  const grupos = new Map();
  for (const t of trans || []) {
    if (!t.transferId) continue;
    if (!grupos.has(t.transferId)) grupos.set(t.transferId, []);
    grupos.get(t.transferId).push(t);
  }
  for (const [transferId, pernas] of grupos) {
    if (pernas.length !== 2) {
      violacoes.push({
        tipo: "transferencia_incompleta",
        id: transferId,
        detalhe: `esperado 2 pernas ligadas por transferId, encontrado ${pernas.length}`,
      });
      continue;
    }
    const tipos = pernas.map((p) => p.tipo).sort().join(",");
    if (tipos !== "despesa,receita") {
      violacoes.push({
        tipo: "transferencia_incoerente",
        id: transferId,
        detalhe: `pernas com tipos inesperados: ${pernas.map((p) => p.tipo).join(", ")}`,
      });
    }
  }
}

function verificarFaturas(payload, violacoes) {
  const { faturas = [], trans = [], cards = [] } = payload;
  for (const fatura of faturas) {
    if (fatura.status === "aberta") continue; // sem invariante de total fechado a checar
    const card = cards.find((c) => c.id === (fatura.cardId || fatura.cartaoId));
    if (!card) continue;
    const monthKey = fatura.competenceMonth || fatura.competencia;
    if (!monthKey) continue;

    const calc = computeCardInvoice(trans, card, monthKey);
    if (!proximo(calc.total, fatura.finalAmount)) {
      violacoes.push({
        tipo: "fatura_total_incoerente",
        id: fatura.id,
        detalhe: `fatura fechada com finalAmount (${fatura.finalAmount}) divergente do total recalculado das despesas (${calc.total})`,
      });
    }
  }
}

function verificarCofrinhos(cofrinhos, violacoes) {
  for (const c of cofrinhos || []) {
    const saldo = saldoCofrinho(c);
    if (saldo < -TOLERANCIA) {
      violacoes.push({
        tipo: "cofrinho_saldo_negativo",
        id: c.id,
        detalhe: `saldo ${saldo.toFixed(2)} ficou negativo após o merge`,
      });
    }
  }
}

function verificarDividas(dividas, violacoes) {
  for (const d of dividas || []) {
    const somaAmortizado = (d.amortizacoes || []).reduce((s, a) => s + (Number(a.valor) || 0), 0);
    const total = Number(d.total) || 0;
    const quitadaPelaSoma = total > 0 && somaAmortizado >= total - TOLERANCIA;

    if (quitadaPelaSoma && d.status !== "quitada") {
      violacoes.push({
        tipo: "divida_status_desatualizado",
        id: d.id,
        detalhe: `soma de amortizações (${somaAmortizado}) já quita o total (${total}), mas status é "${d.status}"`,
      });
    }
    if (!quitadaPelaSoma && d.status === "quitada") {
      violacoes.push({
        tipo: "divida_status_inconsistente",
        id: d.id,
        detalhe: `status "quitada" mas soma de amortizações (${somaAmortizado}) não cobre o total (${total})`,
      });
    }
  }
}

export function validarInvariantesFinanceiros(payload) {
  const violacoes = [];
  verificarTransacoes(payload.trans, violacoes);
  verificarTransferencias(payload.trans, violacoes);
  verificarFaturas(payload, violacoes);
  verificarCofrinhos(payload.cofrinhos, violacoes);
  verificarDividas(payload.dividas, violacoes);
  return violacoes;
}
