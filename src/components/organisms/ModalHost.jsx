// ModalHost.jsx — v0.3.37 Fase 5 (DEC-0038)
// Overlay + caixa do modal + roteamento por `modal`, extraídos do return
// de App(). Os 6 modais já eram componentes próprios desde a Fase 4; o
// que saiu daqui foi só a moldura e o switch que os escolhe.
//
// Comportamento preservado: clicar no backdrop (e só nele) fecha o modal.
import { C } from "../../theme/tokens.js";
import { AddTransModal } from "./modals/AddTransModal.jsx";
import { TransferModal } from "./modals/TransferModal.jsx";
import { AddCofrinhoModal } from "./modals/AddCofrinhoModal.jsx";
import { MovimentoCofrinhoModal } from "./modals/MovimentoCofrinhoModal.jsx";
import { EditRecorrenciaModal } from "./modals/EditRecorrenciaModal.jsx";
import { AddCardModal } from "./modals/AddCardModal.jsx";

export function ModalHost({
  modal, closeModal,
  form, setForm, inp, lbl, inputStyle, requiredModal,
  cats, cards, contas, contasDisponiveis, contasCorrentes,
  isCartao, resolveCardCompetencia, parcPreview, recPreview, selMon, selYear, selMonth,
  addTransaction, realizarTransferencia, criarCofrinho, registrarMovimentoCofrinho,
  salvarEdicaoRecorrencia, addCard,
}) {
  if (!modal) return null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }} onClick={e=>e.target===e.currentTarget&&closeModal()}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:26, width:420, maxWidth:"92vw" }}>
        {modal==="addTrans"&&(
          <AddTransModal
            form={form} setForm={setForm} inp={inp} lbl={lbl} inputStyle={inputStyle} cats={cats} requiredModal={requiredModal} cards={cards}
            contasDisponiveis={contasDisponiveis} isCartao={isCartao} resolveCardCompetencia={resolveCardCompetencia} parcPreview={parcPreview} recPreview={recPreview}
            selMon={selMon} selYear={selYear} closeModal={closeModal} addTransaction={addTransaction}
          />
        )}
        {modal==="addTransfer"&&(
          <TransferModal form={form} setForm={setForm} inp={inp} lbl={lbl} contasCorrentes={contasCorrentes} closeModal={closeModal} realizarTransferencia={realizarTransferencia} />
        )}
        {modal==="addCofrinho"&&(
          <AddCofrinhoModal form={form} setForm={setForm} inp={inp} closeModal={closeModal} criarCofrinho={criarCofrinho} />
        )}
        {modal==="movimentoCofrinho"&&(
          <MovimentoCofrinhoModal form={form} setForm={setForm} inp={inp} closeModal={closeModal} registrarMovimentoCofrinho={registrarMovimentoCofrinho} />
        )}
        {modal==="editRecorrencia"&&(
          <EditRecorrenciaModal
            form={form} setForm={setForm} inp={inp} lbl={lbl} inputStyle={inputStyle} selMonth={selMonth} cats={cats} cards={cards} contas={contas} requiredModal={requiredModal}
            closeModal={closeModal} salvarEdicaoRecorrencia={salvarEdicaoRecorrencia}
          />
        )}
        {modal==="addCard"&&(
          <AddCardModal form={form} setForm={setForm} inp={inp} lbl={lbl} inputStyle={inputStyle} contasCorrentes={contasCorrentes} closeModal={closeModal} addCard={addCard} />
        )}
      </div>
    </div>
  );
}
