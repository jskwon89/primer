"use client";

import Link from "next/link";

interface CreditConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceName: string;
  creditCost: number;
  currentBalance: number;
  details?: string[];
  loading?: boolean;
}

export default function CreditConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  creditCost,
  currentBalance,
  details,
  loading,
}: CreditConfirmDialogProps) {
  if (!isOpen) return null;

  const remaining = currentBalance - creditCost;
  const insufficient = remaining < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#1e2d47] rounded-xl border border-[#2a3a54] shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-white">{serviceName}</h3>
          <p className="text-sm text-gray-400 mt-1">
            아래 크레딧이 소모됩니다. 진행하시겠습니까?
          </p>
        </div>

        {/* Details */}
        {details && details.length > 0 && (
          <div className="px-6 pb-2">
            <div className="bg-[#0f1a2e] rounded-lg px-4 py-3 space-y-1">
              {details.map((item, i) => (
                <div key={i} className="text-xs text-gray-300 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credit breakdown */}
        <div className="px-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">보유</span>
              <span className="text-sm text-white">
                {currentBalance.toLocaleString()} 크레딧
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">차감</span>
              <span className="text-sm font-medium text-red-600">
                -{creditCost.toLocaleString()} 크레딧
              </span>
            </div>
            <div className="border-t border-[#2a3a54] pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">잔여</span>
              <span
                className={`text-sm font-bold ${
                  insufficient ? "text-red-600" : "text-green-600"
                }`}
              >
                {remaining.toLocaleString()} 크레딧
              </span>
            </div>
          </div>

          {/* Insufficient warning */}
          {insufficient && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                크레딧이 부족합니다
              </p>
              <Link
                href="/credits"
                className="text-sm text-red-600 underline hover:text-red-800 mt-1 inline-block"
              >
                크레딧 충전하기
              </Link>
            </div>
          )}
        </div>

        {/* Divider + Buttons */}
        <div className="border-t border-[#2a3a54] px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#2a3a54] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#243350] transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={insufficient || loading}
            className="px-5 py-2 bg-[#c49a2e] text-[#0f1a2e] rounded-lg text-sm font-medium hover:bg-[#d4a843] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : "진행"}
          </button>
        </div>
      </div>
    </div>
  );
}
