import { useEffect, useState } from "react";
import { brazilianDateToIso, isoToBrazilianDate, maskBrazilianDate } from "../../utils/dateUtils.js";

export function DateInput({ value, onChange, style, placeholder = "dd/mm/aaaa", onInvalidDate, ...props }) {
  const [displayValue, setDisplayValue] = useState(() => isoToBrazilianDate(value));

  useEffect(() => {
    setDisplayValue(isoToBrazilianDate(value));
  }, [value]);

  const handleChange = event => {
    const masked = maskBrazilianDate(event.target.value);
    setDisplayValue(masked);

    if (!masked) {
      onChange?.("");
      return;
    }

    if (masked.length === 10) {
      const isoValue = brazilianDateToIso(masked);
      onChange?.(isoValue);
      if (!isoValue) onInvalidDate?.(masked);
    }
  };

  const handleBlur = () => {
    if (!displayValue) return;
    if (displayValue.length < 10 || !brazilianDateToIso(displayValue)) {
      onChange?.("");
      onInvalidDate?.(displayValue);
    }
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      maxLength={10}
      placeholder={placeholder}
      style={style}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
