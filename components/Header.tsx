"use client";

import { ReactNode } from "react";

interface HeaderProps {
  left?: ReactNode;
  title: string;
  right?: ReactNode;
}

export function Header({ left, title, right }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 shrink-0">
      <div className="w-10 flex items-center justify-start">
        {left || <div />}
      </div>
      <div className="border border-gray-700 rounded-xl px-4 py-1.5">
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
      </div>
      <div className="w-10 flex items-center justify-end">
        {right || <div />}
      </div>
    </header>
  );
}
