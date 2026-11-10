import React, { useEffect, useState } from 'react';

/**
 * Campo de dinero con formato colombiano mientras se escribe (ronda 2):
 * 3000000 → 3.000.000 · decimales con coma (3.000.000,50, máx. 2).
 * Entrega el valor como número (o undefined si está vacío).
 */

const group = (digits: string) => digits.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatMoneyText = (value: number | undefined | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) return '';
  const [int, dec] = value.toFixed(2).split('.');
  return dec === '00' ? group(int) : `${group(int)},${dec.replace(/0$/, '')}`;
};

const normalize = (text: string): { text: string; value: number | undefined } => {
  const cleaned = text.replace(/[^\d,]/g, '');
  const [intRaw, ...rest] = cleaned.split(',');
  const intDigits = intRaw || (rest.length ? '0' : '');
  const decimals = rest.join('').slice(0, 2);
  if (!intDigits && !decimals) return { text: '', value: undefined };
  const hasComma = cleaned.includes(',');
  const shown = `${group(intDigits)}${hasComma ? `,${decimals}` : ''}`;
  const value = Number(`${intDigits || '0'}.${decimals || '0'}`);
  return { text: shown, value };
};

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
}

export const MoneyInput: React.FC<Props> = ({ value, onValueChange, ...rest }) => {
  const [text, setText] = useState(formatMoneyText(value));
  // Si el valor cambia desde afuera (p. ej. al limpiar el formulario), se refleja.
  useEffect(() => {
    if (normalize(text).value !== value) setText(formatMoneyText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <input
      {...rest}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const next = normalize(e.target.value);
        setText(next.text);
        onValueChange(next.value);
      }}
    />
  );
};
