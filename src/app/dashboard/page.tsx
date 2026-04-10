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
    <div
      className="min-h-screen"
      style={{ backgroundImage: "url('/images/dashboard-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
    >
      <div className="absolute inset-0 bg-[#faf9f6]/80 pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">

        {/* 환영 + 유저 */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user ? `안녕하세요 :)` : "환영합니다"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{siteConfig.name}에서 연구를 시작하세요</p>
          </div>
        </div>

        {/* 요청 현황 — 카드 그리드 */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-base font-bold text-gray-900 mb-4">요청 현황</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="전체 요청" count={total.total} sub={`접수 ${total.pending} · 진행 ${total.in_progress} · 완료 ${total.completed}`} color="teal" />
            <StatCard label="연구설계" count={stats.researchDesign.total} sub={`접수 ${stats.researchDesign.pending} · 진행 ${stats.researchDesign.in_progress} · 완료 ${stats.researchDesign.completed}`} color="sky" href="/data-generation" />
            <StatCard label="통계설계" count={stats.statsDesign.total} sub={`접수 ${stats.statsDesign.pending} · 진행 ${stats.statsDesign.in_progress} · 완료 ${stats.statsDesign.completed}`} color="violet" href="/stats-design" />
            <StatCard label="설문설계" count={stats.survey.total} sub={`접수 ${stats.survey.pending} · 진행 ${stats.survey.in_progress} · 완료 ${stats.survey.completed}`} color="amber" href="/survey-request" />
          </div>
        </div>


      </div>
    </div>
  );
}

/* ── 요청 현황 카드 ── */
function StatCard({ label, count, sub, color, href }: {
  label: string; count: number; sub: string; color: string; href?: string;
}) {
  const colors: Record<string, { bg: string; text: string; num: string }> = {
    teal: { bg: "bg-teal-50", text: "text-teal-700", num: "text-teal-600" },
    sky: { bg: "bg-sky-50", text: "text-sky-700", num: "text-sky-600" },
    violet: { bg: "bg-violet-50", text: "text-violet-700", num: "text-violet-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", num: "text-amber-600" },
  };
  const c = colors[color] || colors.teal;
  const card = (
    <div className={`${c.bg} rounded-2xl p-5 ${href ? "hover:shadow-md cursor-pointer" : ""} transition-all`}>
      <p className={`text-xs font-semibold ${c.text} mb-2`}>{label}</p>
      <p className={`text-3xl sm:text-4xl font-bold ${c.num} mb-2`}>{count}</p>
      <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  );
  return href ? <Link href={href} className="block">{card}</Link> : card;
}

