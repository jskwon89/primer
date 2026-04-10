"use client";

import { useState } from "react";
import Link from "next/link";

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    category: "서비스 일반",
    q: "ResearchOn은 어떤 서비스인가요?",
    a: "ResearchOn은 연구자를 위한 통합 연구 지원 플랫폼입니다. 연구 설계, 설문조사, 판결문 코딩, 뉴스 수집, 계량분석, 텍스트 분석, 질적분석 등 연구에 필요한 다양한 서비스를 제공합니다.",
  },
  {
    category: "서비스 일반",
    q: "서비스 이용 절차는 어떻게 되나요?",
    a: "1) 원하는 서비스 페이지에서 의뢰 양식을 작성합니다.\n2) 담당자가 의뢰 내용을 검토하고 안내를 드립니다.\n3) 분석/작업이 진행됩니다.\n4) 결과 확인 페이지에서 진행 상황과 결과를 확인할 수 있습니다.",
  },
  {
    category: "서비스 일반",
    q: "결과는 어떻게 확인하나요?",
    a: "각 서비스별 '결과 확인' 페이지에서 의뢰 상태와 결과를 확인할 수 있습니다. 의뢰 시 입력한 이메일로도 안내를 보내드립니다. 결과 확인 페이지에서는 담당자와 채팅으로 소통할 수도 있습니다.",
  },
  {
    category: "크레딧",
    q: "크레딧은 무엇인가요?",
    a: "크레딧은 ResearchOn 플랫폼에서 서비스를 이용할 때 사용되는 포인트입니다. 각 서비스마다 필요한 크레딧이 다르며, 크레딧 관리 페이지에서 잔액을 확인할 수 있습니다.",
  },
  {
    category: "크레딧",
    q: "크레딧 충전은 어떻게 하나요?",
    a: "현재 크레딧 충전은 관리자에게 문의하시면 처리해 드립니다. 문의사항 페이지를 통해 연락하시거나, 이메일로 연락 주시면 됩니다.",
  },
  {
    category: "연구 설계",
    q: "연구 주제 설계 지원은 어떤 내용인가요?",
    a: "연구 주제 및 방향 설계, 연구 질문 구체화, 연구 방법론 제안, 변수 설정 등을 지원합니다. 관련 선행 연구와 트렌드를 분석하여 최적의 연구 설계를 도와드립니다.",
  },
  {
    category: "연구 설계",
    q: "통계분석 설계란 무엇인가요?",
    a: "연구 질문에 적합한 통계 분석 방법을 설계해 드립니다. 기초통계, 회귀분석, 구조방정식, 패널분석 등 연구 목적에 맞는 분석 전략을 수립하고, 필요한 변수와 데이터 요건을 안내해 드립니다.",
  },
  {
    category: "데이터 수집",
    q: "설문조사 의뢰 시 어떤 지원을 받을 수 있나요?",
    a: "설문 문항 설계, 설문지 작성, 응답 데이터 수집, 데이터 정리까지 전 과정을 지원합니다. 연구 목적에 맞는 표본 설계와 배포도 도와드립니다.",
  },
  {
    category: "데이터 수집",
    q: "판결문 수집은 어떻게 진행되나요?",
    a: "원하는 조건(법원, 사건 유형, 기간 등)에 맞는 판결문을 수집하고, 전문가가 주요 정보를 코딩·추출합니다. 코딩 결과는 프로젝트 페이지에서 확인하고 수정할 수 있습니다.",
  },
  {
    category: "데이터 수집",
    q: "뉴스/언론 보도 수집 범위는 어떻게 되나요?",
    a: "키워드, 기간, 매체 등의 조건을 지정하면 해당 조건에 맞는 뉴스 기사를 수집합니다. 수집된 기사의 메타데이터(제목, 날짜, 매체 등)와 본문을 함께 제공합니다.",
  },
  {
    category: "데이터 분석",
    q: "계량분석은 어떤 분석을 포함하나요?",
    a: "기초통계(기술통계, 빈도분석), 회귀분석(OLS, 로지스틱, 패널), 인과추론(DID, RDD, IV), 구조방정식(SEM), 시계열분석 등 다양한 계량 분석 방법을 지원합니다.",
  },
  {
    category: "데이터 분석",
    q: "텍스트 분석에는 어떤 기법이 있나요?",
    a: "토픽모델링, 워드클라우드, 감성분석, 키워드 빈도 분석, 키워드 네트워크 분석, 텍스트 요약 등을 지원합니다. 각 분석 기법의 세부 옵션도 설정할 수 있습니다.",
  },
  {
    category: "데이터 분석",
    q: "질적분석은 어떻게 의뢰하나요?",
    a: "인터뷰 분석, 관찰 분석, 주제분석(Thematic Analysis), 근거이론(Grounded Theory), 내러티브 분석, 담론분석 등을 의뢰할 수 있습니다. 분석할 데이터와 분석 목표를 설명해주시면 됩니다.",
  },
  {
    category: "데이터 분석",
    q: "데이터 전처리는 어떤 작업을 해주나요?",
    a: "변수 리코딩, 데이터 병합, 결측치 처리, 이상치 처리, 더미변수 생성, 역코딩, 척도 합산, 데이터 재구조화(wide↔long) 등의 전처리 작업을 수행합니다.",
  },
  {
    category: "기타",
    q: "의뢰 후 수정이 가능한가요?",
    a: "의뢰 접수 후 결과 확인 페이지의 채팅 기능을 통해 추가 요청이나 수정 사항을 전달하실 수 있습니다. 담당자가 확인 후 반영해 드립니다.",
  },
  {
    category: "기타",
    q: "데이터 보안은 어떻게 관리되나요?",
    a: "제출하신 데이터는 분석 목적으로만 사용되며, 분석 완료 후 요청에 따라 삭제할 수 있습니다. 개인정보 및 민감 데이터 보호에 최선을 다하고 있습니다.",
  },
];

const categories = [...new Set(faqs.map((f) => f.category))];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [openId, setOpenId] = useState<number | null>(null);

  const filtered = activeCategory === "전체" ? faqs : faqs.filter((f) => f.category === activeCategory);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        대시보드로 돌아가기
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold">자주 묻는 질문</h1>
          <p className="text-gray-500 text-sm">ResearchOn 서비스에 대한 궁금증을 해결해 드립니다</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mt-6 mb-6 flex-wrap">
        {["전체", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setOpenId(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-teal-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="space-y-3">
        {filtered.map((faq, i) => {
          const globalIdx = faqs.indexOf(faq);
          const isOpen = openId === globalIdx;
          return (
            <div key={globalIdx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : globalIdx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-teal-500 font-bold text-sm shrink-0">Q</span>
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                </div>
                <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <div className="flex gap-3 pt-4">
                    <span className="text-blue-500 font-bold text-sm shrink-0">A</span>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{faq.a}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact CTA */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-sm text-gray-600 mb-3">원하는 답변을 찾지 못하셨나요?</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-full text-sm font-medium hover:bg-teal-600 transition-colors"
        >
          문의하기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
