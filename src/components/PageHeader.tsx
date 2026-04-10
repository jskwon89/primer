"use client";

import { useState } from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  detailTooltip?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  icon?: React.ReactNode;
  iconBgClass?: string;
  iconTextClass?: string;
}

export default function PageHeader({ title, subtitle, detailTooltip, breadcrumbs, action, icon, iconBgClass, iconTextClass }: PageHeaderProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-gray-700 mb-3">
          <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-gray-900 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass || "bg-gray-100"} ${iconTextClass || "text-gray-600"}`}>
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {subtitle && (
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-gray-600 text-sm leading-relaxed">{subtitle}</p>
                {detailTooltip && (
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors shrink-0"
                    >
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    {showTooltip && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-gray-900 text-white text-xs rounded-xl p-4 shadow-2xl z-50 leading-relaxed whitespace-pre-line">
                        {detailTooltip}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-2.5 h-2.5 bg-gray-900 rotate-45 -mb-1.5" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
