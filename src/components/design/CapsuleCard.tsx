"use client";

import React from "react";
import { Hourglass } from "./Hourglass";

interface CapsuleCardProps {
  title: string;
  from: string;
  sealed?: string;
  unlocks: string;
  remaining: string;
  progress: number;
  accent?: boolean;
  large?: boolean;
  opened?: string;
  draft?: boolean;
  posthumous?: boolean;
  onClick?: () => void;
}

export function CapsuleCard({
  title,
  from,
  sealed,
  unlocks,
  remaining,
  progress,
  accent,
  large,
  opened,
  draft,
  posthumous,
  onClick,
}: CapsuleCardProps) {
  const isItalic = title && (title.startsWith("Letter") || title.startsWith("If"));

  return (
    <div
      onClick={onClick}
      className={`relative p-6 md:p-8 bg-bone-hi border border-rule rounded-lg flex flex-col justify-between cursor-pointer transition-shadow hover:shadow-lg hover:shadow-walnut/5 ${
        large ? "min-h-[260px]" : "min-h-[200px]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] text-walnut-mute tracking-[0.16em] uppercase flex items-center gap-2">
            {draft ? (
              <>draft · in progress</>
            ) : opened ? (
              <>opened {opened}</>
            ) : (
              <>sealed · {sealed}</>
            )}
            {posthumous && (
              <span className="text-terra italic normal-case tracking-normal">
                · for after
              </span>
            )}
          </div>
          <h3
            className={`font-display text-walnut mt-2 leading-tight tracking-tight ${
              large ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
            } ${isItalic ? "italic" : "font-medium"}`}
          >
            {title}
          </h3>
          <div className="text-[12.5px] text-walnut-soft mt-2">{from}</div>
        </div>
        <Hourglass size={large ? 56 : 40} progress={progress} accent={accent} />
      </div>

      <div className="mt-6 pt-4 border-t border-rule-soft flex items-end justify-between">
        <div>
          <div className="text-[10px] text-walnut-mute tracking-[0.16em] uppercase">
            opens
          </div>
          <div
            className={`font-display text-walnut font-medium mt-0.5 ${
              large ? "text-xl" : "text-base"
            }`}
          >
            {unlocks}
          </div>
        </div>
        <div
          className={`font-hand leading-none ${
            accent ? "text-terra" : "text-moss"
          } ${large ? "text-3xl" : "text-2xl"}`}
        >
          {remaining}
        </div>
      </div>
    </div>
  );
}
