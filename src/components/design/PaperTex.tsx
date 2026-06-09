"use client";

import React from "react";

interface PaperTexProps {
  opacity?: number;
  seed?: number;
}

export function PaperTex({ opacity = 0.35, seed = 4 }: PaperTexProps) {
  const id = "pt-" + seed;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed={seed} />
        <feColorMatrix values="0 0 0 0 0.36  0 0 0 0 0.27  0 0 0 0 0.16  0 0 0 0.06 0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}
