"use client";

import React from "react";

interface StepDotsProps {
  steps: string[];
  current: number;
}

export function StepDots({ steps, current }: StepDotsProps) {
  return (
    <div className="flex items-center gap-4 font-body text-[11px] text-walnut-mute tracking-[0.16em] uppercase">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2">
            <div
              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-display text-[11px] font-medium transition-colors ${
                i < current
                  ? "bg-moss text-bone"
                  : i === current
                  ? "bg-walnut text-bone"
                  : "bg-transparent text-walnut-mute border border-rule"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={
                i === current ? "text-walnut font-medium" : "hidden md:inline"
              }
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-4 h-px bg-rule hidden md:block" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
