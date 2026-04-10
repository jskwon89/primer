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
  judgment: StatusBreakdown;
  survey: StatusBreakdown;
  dataAnalysis: StatusBreakdown;
}

export default function DashboardPage() {
  const { user, signOut: userSignOut } = useUser();
  const emptyBreakdown: StatusBreakdown = { total: 0, pending: 0, received: 0, in_progress: 0, completed: 0 };
  const [stats, setStats] = useState<ServiceStats>({ researchDesign: { ...emptyBreakdown }, judgment: { ...emptyBreakdown }, survey: { ...emptyBreakdown }, dataAnalysis: { ...emptyBreakdown } });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // 로그인하지 않은 경우 의뢰 데이터를 가져오지 않음
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const emailParam = user.email ? `?email=${encodeURIComponent(user.email)}` : "";
      const [researchRes, statsDesignRes, surveyRes] = await Promise.all([
        fetch(`/api/research-design${emailParam}`),
        fetch(`/api/stats-design${emailParam}`),
        fetch(`/api/survey${emailParam}`),
      ]);
      const researchData = await researchRes.json();
      const statsDesignData = await statsDesignRes.json();
      const surveyData = await surveyRes.json();

      const countByStatus = (...lists: { status?: string }[][]) => {
        const all = lists.flat();
        return {
          total: all.length,
          pending: all.filter(r => r.status === "pending" || r.status === "received").length,
          received: all.filter(r => r.status === "received").length,
          in_progress: all.filter(r => r.status === "in_progress").length,
          completed: all.filter(r => r.status === "completed").length,
        };
      };

      const rdReqs = [...(researchData.requests || []), ...(statsDesignData.requests || [])];
      const surveyReqs = surveyData.requests || [];

      setStats({
        researchDesign: countByStatus(rdReqs),
        judgment: countByStatus([]),
        survey: countByStatus(surveyReqs),
        dataAnalysis: countByStatus([]),
      });
    } catch {
      console.error("데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalStats: StatusBreakdown = {
    total: stats.researchDesign.total + stats.judgment.total + stats.survey.total + stats.dataAnalysis.total,
    pending: stats.researchDesign.pending + stats.judgment.pending + stats.survey.pending + stats.dataAnalysis.pending,
    received: stats.researchDesign.received + stats.judgment.received + stats.survey.received + stats.dataAnalysis.received,
    in_progress: stats.researchDesign.in_progress + stats.judgment.in_progress + stats.survey.in_progress + stats.dataAnalysis.in_progress,
    completed: stats.researchDesign.completed + stats.judgment.completed + stats.survey.completed + stats.dataAnalysis.completed,
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/images/dashboard-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      <div className="p-3 sm:p-4 lg:p-6 max-w-full mx-2 sm:mx-4 lg:mx-6 relative z-10">
        {/* Welcome Banner + Stats */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0f1a2e] to-[#1a2744] p-5 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-lg">
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5 sm:mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  환영합니다
                </h1>
                <p className="text-[#d4a843] mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-base leading-relaxed">
                  {siteConfig.name}에서 연구를 시작하세요
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user ? (
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#c49a2e]/30 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-[#c49a2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-xs text-white/70 hidden sm:inline">{user.email}</span>
                    <button
                      onClick={() => userSignOut()}
                      className="text-[10px] text-white/40 hover:text-white/70 transition-colors ml-1"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 bg-[#c49a2e] hover:bg-[#d4a843] rounded-lg px-4 py-2 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm text-white font-semibold">로그인</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats inside banner */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
              <StatCard label="전체 의뢰" breakdown={totalStats} icon="folder" color="blue" />
              <StatCard label="연구설계" breakdown={stats.researchDesign} icon="lightbulb" color="green" resultsHref="/data-generation" />
              <StatCard label="판결문 분석" breakdown={stats.judgment} icon="document" color="amber" resultsHref="/judgment-results" />
              <StatCard label="설문조사" breakdown={stats.survey} icon="clipboard" color="purple" resultsHref="/survey-results" />
              <StatCard label="데이터 분석" breakdown={stats.dataAnalysis} icon="chart" color="rose" resultsHref="/quant-results" />
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full bg-[#c49a2e]/10" />
        </div>

        {/* Service Cards */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-sm">서비스</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
            {serviceCards.map((card) => (
              <Link key={card.title} href={card.href} className="group block">
                <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-[#c49a2e]/40 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="relative bg-gray-50 h-28 sm:h-44">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      quality={90}
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-5 border-t border-gray-100">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900">{card.title}</h3>
                    <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1.5 line-clamp-2">{card.desc}</p>
                    <span className="hidden sm:inline-block text-sm text-[#c49a2e] font-medium group-hover:underline underline-offset-4 mt-2">시작하기 &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({
  label,
  breakdown,
  icon,
  color,
  resultsHref,
}: {
  label: string;
  breakdown: StatusBreakdown;
  icon: string;
  color: string;
  resultsHref?: string;
}) {
  const colorMap: Record<string, { text: string; iconBg: string }> = {
    blue: { text: "text-blue-300", iconBg: "bg-blue-400/20" },
    amber: { text: "text-[#d4a843]", iconBg: "bg-[#c49a2e]/20" },
    green: { text: "text-emerald-400", iconBg: "bg-emerald-400/20" },
    purple: { text: "text-purple-400", iconBg: "bg-purple-400/20" },
    rose: { text: "text-rose-400", iconBg: "bg-rose-400/20" },
  };

  const c = colorMap[color] || colorMap.blue;

  const icons: Record<string, React.ReactNode> = {
    folder: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    lightbulb: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    document: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    clipboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    chart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 p-3 sm:p-5 hover:bg-white/15 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${c.iconBg} ${c.text} flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4 sm:[&_svg]:w-5 sm:[&_svg]:h-5 mb-2 sm:mb-3`}>
            {icons[icon]}
          </div>
          <div className="text-xl sm:text-3xl font-bold text-white tracking-tight">{breakdown.total}</div>
          <span className="text-[10px] sm:text-xs text-white/60 font-medium mt-0.5 sm:mt-1 block">{label}</span>
        </div>
        <div className="flex flex-col gap-1.5 sm:gap-2 text-right">
          {resultsHref ? (
            <>
              <Link href={`${resultsHref}?status=pending`} className="text-[10px] sm:text-xs text-gray-400 flex items-center justify-end gap-1.5 hover:text-white transition-colors rounded px-1 -mx-1">
                접수 <span className="font-bold text-white/90 text-xs sm:text-sm min-w-[16px]">{breakdown.pending}</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
              </Link>
              <Link href={`${resultsHref}?status=in_progress`} className="text-[10px] sm:text-xs text-blue-400 flex items-center justify-end gap-1.5 hover:text-white transition-colors rounded px-1 -mx-1">
                진행 <span className="font-bold text-white/90 text-xs sm:text-sm min-w-[16px]">{breakdown.in_progress}</span>
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              </Link>
              <Link href={`${resultsHref}?status=completed`} className="text-[10px] sm:text-xs text-green-400 flex items-center justify-end gap-1.5 hover:text-white transition-colors rounded px-1 -mx-1">
                완료 <span className="font-bold text-white/90 text-xs sm:text-sm min-w-[16px]">{breakdown.completed}</span>
                <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              </Link>
            </>
          ) : (
            <>
              <span className="text-[10px] sm:text-xs text-gray-400 flex items-center justify-end gap-1.5">
                접수 <span className="font-bold text-white/90 text-xs sm:text-sm min-w-[16px]">{breakdown.pending}</span>
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
              </span>
              <span className="text-[10px] sm:text-xs text-blue-400 flex items-center justify-end gap-1.5">
                진행 <span className="font-bold text-white/90 text-xs sm:text-sm min-w-[16px]">{breakdown.in_progress}</span>
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              </span>
              <span className="text-[10px] sm:text-xs text-green-400 flex items-center justify-end gap-1.5">
                완료 <span className="font-bold text-white/90 text-xs sm:text-sm min-w-[16px]">{breakdown.completed}</span>
                <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
