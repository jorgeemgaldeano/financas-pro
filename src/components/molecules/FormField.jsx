// FormField.jsx — v0.3.37 Fase 3 (DEC-0038)
// Molecule: Label + campo, para o padrão hoje pareado à mão em 46+ pontos
// de App.jsx (`<div style={lbl}>Nome</div><input .../>`).
import { Label } from "../atoms/Label.jsx";

export function FormField({ label, children, style }) {
  return (
    <div style={style}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default FormField;
