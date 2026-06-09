"use client";

import React from "react";

interface MarginNoteProps {
  children: React.ReactNode;
  rotate?: number;
  color?: string;
  size?: number;
  className?: string;
}

export function MarginNote({
  children,
  rotate = -1,
  color = "var(--color-terra)",
  size = 19,
  className = "",
}: MarginNoteProps) {
  return (
    <span
      className={`font-hand inline-block leading-tight ${className}`}
      style={{
        fontSize: size,
        color: color,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </span>
  );
}
