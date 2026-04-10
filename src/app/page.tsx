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
    <div className="min-h-screen bg-[#faf9f6] text-gray-900">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${scrolled ? "bg-teal-500" : "bg-white/20 backdrop-blur-sm"}`}>
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className={`text-lg sm:text-xl font-bold tracking-tight ${scrolled ? "text-teal-600" : "text-white"}`}>
              {siteConfig.name}
            </span>
          </Link>
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${scrolled ? "text-gray-600" : "text-white/90"}`}>
            <Link href="/dashboard" className="hover:opacity-70 transition-opacity">시작하기</Link>
            <a href="#services" className="hover:opacity-70 transition-opacity">서비스</a>
            <a href="#how-it-works" className="hover:opacity-70 transition-opacity">이용절차</a>
            <Link href="/board" className="hover:opacity-70 transition-opacity">게시판</Link>
            <a href="#contact" className="hover:opacity-70 transition-opacity">문의</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className={`hidden sm:block text-sm font-medium px-4 py-2 rounded-lg transition-colors ${scrolled ? "text-gray-600 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}>
              로그인
            </Link>
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors bg-teal-500 text-white hover:bg-teal-600"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.png"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-5 sm:px-6 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 sm:mb-6 whitespace-pre-line">
            {siteConfig.heroTitle}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-10 leading-relaxed whitespace-pre-line">
            {siteConfig.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-teal-500 text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-teal-600 transition-colors shadow-lg text-center"
            >
              {siteConfig.ctaText}
            </Link>
            <a
              href="#services"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/15 backdrop-blur-sm border border-white/30 text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-white/25 transition-colors text-center"
            >
              서비스 둘러보기
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-24 px-4 sm:px-6 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">지원 서비스</h2>
            <p className="text-sm text-gray-500">PRIMER가 직접 도와드리는 영역입니다</p>
            <div className="w-12 sm:w-16 h-1 bg-teal-400 mx-auto rounded-full mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {services.map((svc) => (
              <ServiceCard key={svc.key} image={svc.image} title={svc.title} description={svc.description} href={svc.href} />
            ))}
          </div>

          {/* 고급 서비스 → ResearchOn 연동 안내 */}
          {advancedServices.length > 0 && (
            <div className="mt-8 sm:mt-12 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">전문적인 자료 분석이나 고급분석이 필요하신가요?</h3>
                  <p className="text-sm text-gray-500">제휴 기관 <strong className="text-teal-600">ResearchOn</strong>에서 전문적으로 수행합니다.</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {advancedServices.map((svc) => (
                      <span key={svc.key} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{svc.title}</span>
                    ))}
                  </div>
                </div>
                <a
                  href={siteConfig.partnerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-6 py-3 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm"
                >
                  ResearchOn 바로가기 &rarr;
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PRIMER 특징 */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">PRIMER는 이렇게 도와드립니다</h2>
            <div className="w-12 sm:w-16 h-1 bg-teal-400 mx-auto rounded-full mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <ValueCard
              icon={<svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
              title="연구 방향 설정"
              description="연구 주제 선정부터 문헌 탐색, 연구 질문 구체화까지 함께 고민합니다."
            />
            <ValueCard
              icon={<svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
              title="통계 방법 안내"
              description="연구에 적합한 통계 방법과 도구를 추천하고, 분석 절차를 안내합니다."
            />
            <ValueCard
              icon={<svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
              title="1:1 맞춤 소통"
              description="요청부터 완료까지 담당자와 직접 소통합니다. 궁금한 점은 언제든 물어보세요."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-12 sm:py-24 px-4 sm:px-6 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">이용 절차</h2>
            <div className="w-12 sm:w-16 h-1 bg-teal-400 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <StepCard step={1} title="회원가입" description="간편 가입 후 바로 시작" />
              <StepCard step={2} title="지원 요청" description="필요한 상담 서비스 선택" />
              <StepCard step={3} title="자료 공유" description="연구 관련 자료 업로드" />
              <StepCard step={4} title="의견 확인" description="최종의견 및 피드백 제시" />
            </div>
            <div className="relative h-48 sm:h-80 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
              <Image src="/images/이용절차.png" alt="이용 절차" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section id="contact" className="py-12 sm:py-24 px-4 sm:px-6 bg-[#2c3e50] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">연구, 함께 시작해볼까요?</h2>
          <p className="text-sm sm:text-lg text-white/70 mb-6 sm:mb-10">
            궁금한 점이 있으시면 편하게 문의해주세요
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 max-w-md mx-auto">
            <input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
            <button className="shrink-0 px-6 py-3 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors">
              문의하기
            </button>
          </div>
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-block px-10 py-4 bg-teal-500 text-white rounded-xl text-base font-semibold hover:bg-teal-600 transition-colors shadow-lg"
            >
              {siteConfig.ctaText}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e293b] text-white/60 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{siteConfig.name}</h3>
            <p className="text-sm">{siteConfig.subtitle}</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#services" className="hover:text-white transition-colors">서비스</a>
            <span className="hover:text-white transition-colors cursor-pointer">이용약관</span>
            <span className="hover:text-white transition-colors cursor-pointer">개인정보처리방침</span>
          </div>
          <p className="text-xs text-white/40">&copy; 2026 {siteConfig.name}. All rights reserved.</p>
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

function ServiceCard({ image, title, description, href }: { image: string; title: string; description: string; href: string }) {
  return (
    <Link href={href} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden block">
      <div className="relative h-32 sm:h-48 overflow-hidden">
        <Image src={image} alt={title} fill sizes="(max-width: 640px) 100vw, 33vw" quality={90} className="object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{title}</h3>
        <p className="text-[11px] sm:text-sm text-gray-500 leading-relaxed mb-2 sm:mb-4 line-clamp-2">{description}</p>
        <span className="hidden sm:inline text-sm font-medium text-teal-500 group-hover:underline">자세히 보기 &rarr;</span>
      </div>
    </Link>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-[#faf9f6] border border-gray-200 rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 text-center flex flex-col items-center">
      <div className="text-3xl sm:text-5xl font-extrabold text-teal-500 mb-2 sm:mb-4 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
        {step}
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5 sm:mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500">{description}</p>
    </div>
  );
}
