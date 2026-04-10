"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/contexts/UserAuthContext";
import { siteConfig } from "@/lib/siteMode";

const serviceCards = [
  { title: "연구 설계 상담", desc: "연구 주제 설계, 방법론 안내", href: "/data-generation", image: "/images/서비스_연구설계지원.png" },
  { title: "통계분석 설계", desc: "분석 방법 선정 및 설계 지원", href: "/stats-design", image: "/images/서비스_계량통계분석.png" },
  { title: "설문구성 / 조사설계", desc: "설문 구성 및 조사 설계 안내", href: "/survey-request", image: "/images/서비스_설문조사.png" },
];

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

        {/* 서비스 카드 — 이미지 포함 */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-base font-bold text-gray-900 mb-4">상담 서비스</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {serviceCards.map((card) => (
              <Link key={card.title} href={card.href} className="group block">
                <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative bg-gray-50 h-28 sm:h-44">
                    <Image src={card.image} alt={card.title} fill sizes="(max-width: 640px) 50vw, 33vw" quality={90} className="object-cover" />
                  </div>
                  <div className="p-3 sm:p-5 border-t border-gray-50">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900">{card.title}</h3>
                    <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1.5 line-clamp-2">{card.desc}</p>
                    <span className="hidden sm:inline-block text-sm text-teal-500 font-medium group-hover:underline underline-offset-4 mt-2">시작하기 &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
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

