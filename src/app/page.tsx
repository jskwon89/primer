"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig, services, advancedServices } from "@/lib/siteMode";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-800" style={{ fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className={`text-lg font-bold tracking-tight ${scrolled ? "text-gray-900" : "text-white"}`}>{siteConfig.name}</span>
          </Link>
          <div className={`hidden md:flex items-center gap-8 text-[15px] font-semibold ${scrolled ? "text-gray-600" : "text-white/90"}`}>
            <a href="#services" className="hover:text-teal-500 transition-colors">서비스</a>
            <a href="#how-it-works" className="hover:text-teal-500 transition-colors">이용절차</a>
            <a href="#contact" className="hover:text-teal-500 transition-colors">문의</a>
            <Link href="/dashboard" className="hover:text-teal-500 transition-colors">요청현황</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className={`hidden sm:block text-[15px] font-medium transition-colors ${scrolled ? "text-gray-500 hover:text-gray-900" : "text-white/80 hover:text-white"}`}>로그인</Link>
            <Link href="/dashboard" className="text-sm font-semibold px-5 py-2.5 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-colors">시작하기</Link>
          </div>
        </div>
      </nav>

      {/* Hero — 좌측 텍스트 + 우측 이미지 */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/hero.png" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 w-full">
          <div className="max-w-xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white/80 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              무료 연구지원 서비스
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] mb-5 whitespace-pre-line tracking-tight">
              {siteConfig.heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-white/70 mb-8 leading-relaxed max-w-md whitespace-pre-line">
              {siteConfig.heroDesc}
            </p>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="px-7 py-3.5 bg-teal-500 text-white rounded-full text-sm font-semibold hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/25">
                {siteConfig.ctaText}
              </Link>
              <a href="#services" className="px-7 py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/20 transition-all border border-white/20">
                자세히 보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8"><hr className="border-gray-300" /></div>

      {/* Services — 가로형 카드 */}
      <section id="services" className="py-16 sm:py-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-teal-500 text-sm font-semibold mb-2 tracking-wide">SERVICES</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-10 sm:mb-14">직접 도와드리는<br className="sm:hidden" /> 지원 서비스</h2>

          <div className="space-y-4">
            {services.map((svc, i) => (
              <Link key={svc.key} href={svc.href} className="group flex flex-col sm:flex-row items-stretch bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative w-full sm:w-72 h-44 sm:h-auto shrink-0 overflow-hidden">
                  <Image src={svc.image} alt={svc.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                  <span className="text-teal-400 text-xs font-bold tracking-widest mb-2">0{i + 1}</span>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">{svc.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{svc.description}</p>
                  <span className="text-sm text-teal-500 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    지원 요청 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 고급 서비스 배너 */}
          {advancedServices.length > 0 && (
            <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold text-gray-400 tracking-wide mb-1">ADVANCED</p>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">전문 분석이 필요하신가요?</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {advancedServices.map((svc) => (
                      <span key={svc.key} className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[11px] font-medium">{svc.title}</span>
                    ))}
                  </div>
                </div>
                <a href={siteConfig.partnerUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                  ResearchOn &rarr;
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-8"><hr className="border-gray-300" /></div>

      {/* 특징 — 큰 텍스트 인라인 */}
      <section className="py-16 sm:py-28 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-teal-500 text-sm font-semibold mb-2 tracking-wide">WHY PRIMER</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-12 sm:mb-16">이렇게 도와드립니다</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "연구 방향 설정", desc: "연구 주제 선정부터 문헌 탐색,\n연구 질문 구체화까지 함께 고민합니다." },
              { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "통계 방법 안내", desc: "연구에 적합한 통계 방법과 도구를\n추천하고, 분석 절차를 안내합니다." },
              { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "1:1 맞춤 소통", desc: "요청부터 완료까지 담당자와\n직접 소통합니다." },
            ].map((item) => (
              <div key={item.title} className="group">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                  <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-8"><hr className="border-gray-300" /></div>

      {/* How it Works — 타임라인 */}
      <section id="how-it-works" className="py-16 sm:py-28 px-5 sm:px-8 bg-[#faf9f6]">
        <div className="max-w-6xl mx-auto">
          <p className="text-teal-500 text-sm font-semibold mb-2 tracking-wide">PROCESS</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-12 sm:mb-16">이용 절차</h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
            {[
              { step: 1, title: "회원가입", desc: "간편 가입 후 바로 시작" },
              { step: 2, title: "지원 요청", desc: "필요한 상담 서비스 선택" },
              { step: 3, title: "자료 공유", desc: "연구 관련 자료 업로드" },
              { step: 4, title: "의견 확인", desc: "최종의견 및 피드백 제시" },
            ].map((item, i) => (
              <div key={item.step} className="relative flex sm:flex-col items-start sm:items-center text-left sm:text-center pb-8 sm:pb-0">
                {/* 연결선 */}
                {i < 3 && <div className="hidden sm:block absolute top-5 left-1/2 w-full h-[2px] bg-teal-200 z-0" />}
                {/* 숫자 원 */}
                <div className="relative z-10 w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold shrink-0 mr-4 sm:mr-0 sm:mb-4 shadow-md shadow-teal-500/20">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-8"><hr className="border-gray-300" /></div>

      {/* Contact */}
      <section id="contact" className="py-16 sm:py-28 px-5 sm:px-8 bg-white">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-teal-500 text-sm font-semibold mb-2 tracking-wide">CONTACT</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">연구, 함께 시작해볼까요?</h2>
          <p className="text-sm text-gray-500 mb-8">궁금한 점이 있으시면 편하게 문의해주세요</p>
          <div className="flex gap-2 mb-6">
            <input type="email" placeholder="이메일 주소" className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400" />
            <button className="px-5 py-3 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors shrink-0">문의</button>
          </div>
          <Link href="/dashboard" className="inline-flex px-8 py-3.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
            {siteConfig.ctaText}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 sm:px-8 border-t border-gray-200 bg-[#faf9f6]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span className="font-semibold text-gray-600">{siteConfig.name}</span>
          <div className="flex items-center gap-5">
            <a href="#services" className="hover:text-gray-600 transition-colors">서비스</a>
            <span className="hover:text-gray-600 transition-colors cursor-pointer">이용약관</span>
            <span className="hover:text-gray-600 transition-colors cursor-pointer">개인정보처리방침</span>
          </div>
          <span>&copy; 2026 {siteConfig.name}</span>
        </div>
      </footer>

      <style jsx global>{`
        html { scroll-behavior: smooth; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
      `}</style>
    </div>
  );
}
