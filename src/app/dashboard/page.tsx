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

        {/* 헤더 */}
        <div className="mb-10 sm:mb-14">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {user ? `안녕하세요 :)` : "요청 현황"}
          </h1>
          <p className="text-sm text-gray-500">{siteConfig.name} 상담 요청 현황을 확인하세요</p>
        </div>

        {/* 요청 현황 — 큰 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10">
          <StatCard label="전체 요청" count={total.total} pending={total.pending} inProgress={total.in_progress} completed={total.completed} color="teal" />
          <StatCard label="연구설계" count={stats.researchDesign.total} pending={stats.researchDesign.pending} inProgress={stats.researchDesign.in_progress} completed={stats.researchDesign.completed} color="sky" href="/data-generation" />
          <StatCard label="통계설계" count={stats.statsDesign.total} pending={stats.statsDesign.pending} inProgress={stats.statsDesign.in_progress} completed={stats.statsDesign.completed} color="violet" href="/stats-design" />
          <StatCard label="설문설계" count={stats.survey.total} pending={stats.survey.pending} inProgress={stats.survey.in_progress} completed={stats.survey.completed} color="amber" href="/survey-request" />
        </div>

      </div>
    </div>
  );
}

/* ── 요청 현황 카드 ── */
function StatCard({ label, count, pending, inProgress, completed, color, href }: {
  label: string; count: number; pending: number; inProgress: number; completed: number; color: string; href?: string;
}) {
  const colors: Record<string, { bg: string; border: string; text: string; num: string }> = {
    teal: { bg: "bg-teal-100/70", border: "border-teal-200", text: "text-teal-800", num: "text-teal-700" },
    sky: { bg: "bg-sky-100/70", border: "border-sky-200", text: "text-sky-800", num: "text-sky-700" },
    violet: { bg: "bg-violet-100/70", border: "border-violet-200", text: "text-violet-800", num: "text-violet-700" },
    amber: { bg: "bg-amber-100/70", border: "border-amber-200", text: "text-amber-800", num: "text-amber-700" },
  };
  const c = colors[color] || colors.teal;
  const card = (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-6 sm:p-8 ${href ? "hover:shadow-lg cursor-pointer" : ""} transition-all`}>
      <p className={`text-sm font-semibold ${c.text} mb-3`}>{label}</p>
      <p className={`text-4xl sm:text-5xl font-bold ${c.num} mb-5`}>{count}</p>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-gray-500">접수</span>
          <span className="font-bold text-gray-700">{pending}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <span className="text-gray-500">진행</span>
          <span className="font-bold text-gray-700">{inProgress}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-gray-500">완료</span>
          <span className="font-bold text-gray-700">{completed}</span>
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{card}</Link> : card;
}

