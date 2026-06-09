"use client";

import React from "react";

interface PaperInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  hint?: string;
  suffix?: string;
  multiline?: boolean;
  rows?: number;
}

export function PaperInput({
  label,
  hint,
  suffix,
  multiline,
  className = "",
  ...rest
}: PaperInputProps) {
  const InputComponent = multiline ? "textarea" : "input";

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-baseline mb-2">
        <label className="font-display text-lg font-medium text-walnut">
          {label}
        </label>
        {suffix && (
          <span className="text-xs text-walnut-mute uppercase tracking-wider">
            {suffix}
          </span>
        )}
      </div>
      
      <InputComponent
        className="w-full px-4 py-3 bg-bone-hi border border-rule rounded-lg focus:outline-none focus:ring-2 focus:ring-terra/20 focus:border-terra text-walnut placeholder:text-walnut-mute/50 transition-all resize-none"
        {...(rest as any)}
      />
      
      {hint && (
        <p className="mt-2 text-xs text-walnut-soft italic">
          {hint}
        </p>
      )}
    </div>
  );
}
