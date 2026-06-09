"use client";

import React from "react";

interface HourglassProps {
  size?: number;
  progress?: number;
  accent?: boolean;
  stroke?: number;
  className?: string;
}

export function Hourglass({
  size = 64,
  progress = 0.2,
  accent = false,
  stroke = 1.4,
  className = "",
}: HourglassProps) {
  const color = accent ? "var(--color-terra)" : "var(--color-walnut)";
  const w = size * 0.62;
  const h = size;
  const cx = size / 2;
  const cy = size / 2;
  const topY = cy - h * 0.46;
  const botY = cy + h * 0.46;
  const neckW = w * 0.12;
  const halfW = w / 2;

  // Sand polygons — clipped to triangles.
  const topFill = 1 - progress;
  const botFill = progress;

  const sandTopLevel = topY + (cy - topY) * (1 - topFill);
  const sandTopHalfW = halfW * (1 - (sandTopLevel - topY) / (cy - topY));

  const sandBotLevel = botY - (botY - cy) * botFill;
  const sandBotHalfW = halfW * ((botY - sandBotLevel) / (botY - cy));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`block pointer-events-none ${className}`}
    >
      {/* sand top */}
      {topFill > 0.01 && (
        <polygon
          points={`${cx - sandTopHalfW},${sandTopLevel} ${cx + sandTopHalfW},${sandTopLevel} ${cx + neckW * 0.5},${cy - 0.5} ${cx - neckW * 0.5},${cy - 0.5}`}
          fill={color}
          fillOpacity={0.8}
        />
      )}
      {/* sand bot */}
      {botFill > 0.01 && (
        <polygon
          points={`${cx - neckW * 0.5},${cy + 0.5} ${cx + neckW * 0.5},${cy + 0.5} ${cx + sandBotHalfW},${sandBotLevel} ${cx - sandBotHalfW},${sandBotLevel}`}
          fill={color}
          fillOpacity={0.8}
        />
      )}
      {/* falling grain */}
      {progress > 0.02 && progress < 0.98 && (
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={sandBotLevel}
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      )}
      {/* glass outline — top triangle */}
      <path
        d={`M ${cx - halfW} ${topY} L ${cx + halfW} ${topY} L ${cx + neckW * 0.5} ${cy} L ${cx - neckW * 0.5} ${cy} Z`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      <path
        d={`M ${cx - neckW * 0.5} ${cy} L ${cx + neckW * 0.5} ${cy} L ${cx + halfW} ${botY} L ${cx - halfW} ${botY} Z`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      {/* caps */}
      <line
        x1={cx - halfW - size * 0.06}
        y1={topY}
        x2={cx + halfW + size * 0.06}
        y2={topY}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <line
        x1={cx - halfW - size * 0.06}
        y1={botY}
        x2={cx + halfW + size * 0.06}
        y2={botY}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}
