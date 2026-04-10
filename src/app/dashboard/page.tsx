"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserAuthContext";
import { siteConfig } from "@/lib/siteMode";

interface StatusBreakdown {
  total: number;
  pending: number;
  received: number;
  in_progress: number;
  completed: number;
}

interface ServiceStats {
  researchDesign: StatusBreakdown;
  statsDesign: StatusBreakdown;
  survey: StatusBreakdown;
}

export default function DashboardPage() {
  const { user, signOut: userSignOut } = useUser();
  const empty: StatusBreakdown = { total: 0, pending: 0, received: 0, in_progress: 0, completed: 0 };
  const [stats, setStats] = useState<ServiceStats>({ researchDesign: { ...empty }, statsDesign: { ...empty }, survey: { ...empty } });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const ep = user.email ? `?email=${encodeURIComponent(user.email)}` : "";
      const [r1, r2, r3] = await Promise.all([
        fetch(`/api/research-design${ep}`),
        fetch(`/api/stats-design${ep}`),
        fetch(`/api/survey${ep}`),
      ]);
      const d1 = await r1.json();
      const d2 = await r2.json();
      const d3 = await r3.json();

      const count = (list: { status?: string }[]) => ({
        total: list.length,
        pending: list.filter(r => r.status === "pending" || r.status === "received").length,
        received: list.filter(r => r.status === "received").length,
        in_progress: list.filter(r => r.status === "in_progress").length,
        completed: list.filter(r => r.status === "completed").length,
      });

      setStats({
        researchDesign: count(d1.requests || []),
        statsDesign: count(d2.requests || []),
        survey: count(d3.requests || []),
      });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = {
    total: stats.researchDesign.total + stats.statsDesign.total + stats.survey.total,
    pending: stats.researchDesign.pending + stats.statsDesign.pending + stats.survey.pending,
    in_progress: stats.researchDesign.in_progress + stats.statsDesign.in_progress + stats.survey.in_progress,
    completed: stats.researchDesign.completed + stats.statsDesign.completed + stats.survey.completed,
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">

        {/* 환영 + 유저 */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user ? `안녕하세요 :)` : "환영합니다"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{siteConfig.name}에서 연구를 시작하세요</p>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-sm font-bold text-teal-600">{user.email?.[0]?.toUpperCase()}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-gray-600">{user.email}</p>
                <button onClick={() => userSignOut()} className="text-[10px] text-gray-400 hover:text-gray-600">로그아웃</button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="px-5 py-2 bg-teal-500 text-white rounded-full text-sm font-semibold hover:bg-teal-600 transition-colors">
              로그인
            </Link>
          )}
        </div>

        {/* 요청 현황 — 가로 행 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 sm:mb-10 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">요청 현황</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <StatusRow label="전체" total={total.total} pending={total.pending} inProgress={total.in_progress} completed={total.completed} bold />
            <StatusRow label="연구설계" total={stats.researchDesign.total} pending={stats.researchDesign.pending} inProgress={stats.researchDesign.in_progress} completed={stats.researchDesign.completed} href="/data-generation" />
            <StatusRow label="통계설계" total={stats.statsDesign.total} pending={stats.statsDesign.pending} inProgress={stats.statsDesign.in_progress} completed={stats.statsDesign.completed} href="/stats-design" />
            <StatusRow label="설문설계" total={stats.survey.total} pending={stats.survey.pending} inProgress={stats.survey.in_progress} completed={stats.survey.completed} href="/survey-request" />
          </div>
        </div>

        {/* 서비스 바로가기 */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-base font-bold text-gray-900 mb-4">상담 서비스</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ServiceLink href="/data-generation" title="연구설계" desc="연구 주제, 방법론 상담" icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            <ServiceLink href="/stats-design" title="통계분석" desc="통계 방법, 도구 설계" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            <ServiceLink href="/survey-request" title="설문구성" desc="설문 구성, 조사 설계" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </div>
        </div>

        {/* 커뮤니티 바로가기 */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">커뮤니티</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/board" className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-sky-600 transition-colors">자유게시판</h3>
                <p className="text-xs text-gray-400">자유로운 이야기를 나눠보세요</p>
              </div>
            </Link>
            <Link href="/board?category=통계" className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-violet-600 transition-colors">질문과 답변</h3>
                <p className="text-xs text-gray-400">통계, 연구방법, 논문작성</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── 요청 현황 행 ── */
function StatusRow({ label, total, pending, inProgress, completed, href, bold }: {
  label: string; total: number; pending: number; inProgress: number; completed: number; href?: string; bold?: boolean;
}) {
  const inner = (
    <div className={`flex items-center px-6 py-3.5 ${href ? "hover:bg-gray-50 transition-colors" : ""}`}>
      <span className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-700"} w-20 shrink-0`}>{label}</span>
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">전체</span>
          <span className="text-sm font-bold text-gray-900">{total}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs text-gray-400">접수</span>
          <span className="text-sm font-semibold text-gray-700">{pending}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-xs text-gray-400">진행</span>
          <span className="text-sm font-semibold text-gray-700">{inProgress}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-gray-400">완료</span>
          <span className="text-sm font-semibold text-gray-700">{completed}</span>
        </div>
      </div>
      {href && (
        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : <div>{inner}</div>;
}

/* ── 서비스 바로가기 카드 ── */
function ServiceLink({ href, title, desc, icon }: { href: string; title: string; desc: string; icon: string }) {
  return (
    <Link href={href} className="group flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
      <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
        <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{title}</h3>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </Link>
  );
}
