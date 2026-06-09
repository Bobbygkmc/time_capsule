"use client";

import React from "react";

interface GardenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  secondary?: boolean;
  ghost?: boolean;
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
}

export function GardenButton({
  children,
  secondary,
  ghost,
  size = "md",
  className = "",
  leftIcon,
  ...rest
}: GardenButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2.5 text-[12.5px]",
    md: "px-5.5 py-3.5 text-[13.5px]",
    lg: "px-7.5 py-4 text-[14.5px]",
  };

  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors cursor-pointer tracking-tight";
  
  let variantClasses = "bg-walnut text-bone";
  if (ghost) variantClasses = "bg-transparent text-walnut border border-rule hover:bg-bone-soft/30";
  else if (secondary) variantClasses = "bg-bone-hi text-walnut border border-rule hover:bg-bone-soft/50";

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`}
      {...rest}
    >
      {leftIcon && <span className="flex items-center shrink-0">{leftIcon}</span>}
      {children}
    </button>
  );
}
