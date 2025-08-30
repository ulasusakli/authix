"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export function OtpInput({ length = 6, onChange }: { length?: number; onChange: (value: string) => void }) {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, val: string) {
    const newValues = [...values];
    newValues[index] = val.slice(-1); // sadece son karakter
    setValues(newValues);
    onChange(newValues.join(""));

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {values.map((v, i) => (
        <Input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          value={v}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-12 text-center text-lg font-bold"
        />
      ))}
    </div>
  );
}