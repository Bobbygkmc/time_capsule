"use client";

import React from "react";

interface SprigProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Sprig({ size = 80, color = "var(--color-moss)", className = "" }: SprigProps) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 80 96"
      className={`block pointer-events-none ${className}`}
    >
      <path
        d="M 40 96 C 40 70, 38 50, 38 30 C 38 18, 42 8, 42 0"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* leaves */}
      <path d="M 38 78 C 26 76, 18 70, 14 60 C 22 62, 32 68, 38 78 Z" fill={color} fillOpacity="0.55" />
      <path d="M 40 64 C 50 60, 60 52, 64 42 C 56 44, 46 52, 40 64 Z" fill={color} fillOpacity="0.55" />
      <path d="M 38 48 C 28 44, 22 36, 20 26 C 28 28, 36 36, 38 48 Z" fill={color} fillOpacity="0.55" />
      <path d="M 41 34 C 49 30, 56 22, 58 12 C 52 14, 44 22, 41 34 Z" fill={color} fillOpacity="0.55" />
    </svg>
  );
}
