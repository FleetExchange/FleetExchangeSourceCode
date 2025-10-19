"use client";
import React from "react";

export function sanitizeDecimal(raw: string): string {
  const s1 = raw.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const parts = s1.split(".");
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : s1;
}

type DecimalInputProps = {
  value: string;
  onValueChange: (v: string) => void;
  onNumberChange?: (n: number) => void; // optional parsed callback
  placeholder?: string;
  name?: string;
  required?: boolean;
};

export default function DecimalInput({
  value,
  onValueChange,
  onNumberChange,
  placeholder = "e.g., 2.5",
  name,
  required,
}: DecimalInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = sanitizeDecimal(e.target.value);
    onValueChange(normalized);
    if (onNumberChange) {
      const n =
        normalized === "" || normalized === "." ? NaN : parseFloat(normalized);
      onNumberChange(Number.isNaN(n) ? 0 : n);
    }
  };

  return (
    <label className="form-control w-full">
      <input
        type="text"
        name={name}
        inputMode="decimal"
        pattern="^[0-9]*\.?[0-9]*$"
        title="Only digits and a dot (.) are allowed"
        className="input input-bordered w-full focus:outline-none focus:border-primary"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === ",") e.preventDefault();
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          const next = sanitizeDecimal(text);
          if (next !== text) {
            e.preventDefault();
            const el = e.currentTarget;
            const start = el.selectionStart ?? 0;
            const end = el.selectionEnd ?? 0;
            const merged =
              el.value.slice(0, start) + next + el.value.slice(end);
            onValueChange(merged);
            if (onNumberChange) {
              const n =
                merged === "" || merged === "." ? NaN : parseFloat(merged);
              onNumberChange(Number.isNaN(n) ? 0 : n);
            }
          }
        }}
        required={required}
      />
    </label>
  );
}
