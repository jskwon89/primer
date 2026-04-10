"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserAuthContext";
import { saveDraft, loadDraft } from "@/lib/formDraft";

interface ContactInquiry {
  id: string;
  email: string;
  name: string;
  category: string;
  subject: string;
  message: string;
  status: "pending" | "replied";
  createdAt: string;
  adminReply: string;
  repliedAt: string;
}

const categories = [
  "일반 문의",
  "서비스 이용",
  "크레딧/결제",
  "기술 문의",
  "데이터 관련",
  "기타",
];

export default function ContactPage() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("일반 문의");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    const d = loadDraft(pathname);
    if (d) {
      if (d.email) setEmail(d.email as string);
      if (d.name) setName(d.name as string);
      if (d.category) setCategory(d.category as string);
      if (d.subject) setSubject(d.subject as string);
      if (d.message) setMessage(d.message as string);
    }
  }, [user]);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      setInquiries(data.inquiries ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleSubmit = async () => {
    if (!user) {
      saveDraft(pathname, { email, name, category, subject, message });
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!email.trim() || !subject.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          category,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setEmail("");
        setName("");
        setCategory("일반 문의");
        setSubject("");
        setMessage("");
        await fetchInquiries();
      }
    } catch {
      console.error("문의 등록 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedInquiry = inquiries.find((i) => i.id === selectedId);
  const sorted = [...inquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        대시보드로 돌아가기
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#c49a2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold">문의사항</h1>
          <p className="text-gray-500 text-sm">궁금한 점이 있으시면 문의해 주세요</p>
        </div>
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 font-medium">문의가 접수되었습니다. 빠른 시일 내 답변 드리겠습니다.</p>
          </div>
        </div>
      )}

      {/* Inquiry form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">새 문의 작성</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="답변 받을 이메일 주소"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 (선택)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">문의 유형</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="문의 제목"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e]"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">문의 내용</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="문의하실 내용을 자세히 작성해주세요"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e] resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || !email.trim() || !subject.trim()}
            className="px-6 py-2.5 bg-[#c49a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#b08a28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "제출 중..." : "문의하기"}
          </button>
        </div>
      </div>

      {/* Previous inquiries */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold">내 문의 내역</h2>
        </div>
        {sorted.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">아직 문의 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sorted.map((inq) => (
              <div
                key={inq.id}
                className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedId(selectedId === inq.id ? null : inq.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900 truncate">{inq.subject}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        inq.status === "replied"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {inq.status === "replied" ? "답변 완료" : "대기중"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{inq.category}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(inq.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${selectedId === inq.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {selectedId === inq.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{inq.message}</p>
                    {inq.status === "replied" && inq.adminReply && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-blue-700">관리자 답변</span>
                          {inq.repliedAt && (
                            <span className="text-xs text-gray-400">{new Date(inq.repliedAt).toLocaleDateString("ko-KR")}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{inq.adminReply}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ link */}
      <div className="mt-6 text-center">
        <Link href="/faq" className="text-sm text-[#c49a2e] hover:underline">
          자주 묻는 질문 확인하기 &rarr;
        </Link>
      </div>
    </div>
  );
}
