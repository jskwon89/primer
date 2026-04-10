"use client";

import { useState } from "react";

export default function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors mt-0.5"
      >
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-gray-900 text-white text-xs rounded-xl p-4 shadow-2xl z-50 leading-relaxed whitespace-pre-line">
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-2.5 h-2.5 bg-gray-900 rotate-45 -mb-1.5" />
        </div>
      )}
    </div>
  );
}
