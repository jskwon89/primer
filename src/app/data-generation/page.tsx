"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import InfoTooltip from "@/components/InfoTooltip";
import { useUser } from "@/contexts/UserAuthContext";
import { saveDraft, loadDraft } from "@/lib/formDraft";

interface ResearchRequest {
  id: string;
  keywords: string;
  description: string;
  field: string;
  email: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  aiDraft: string;
  adminResponse: string;
  respondedAt: string;
}

interface ChatMessage {
  id: string;
  requestId: string;
  sender: "user" | "admin";
  message: string;
  createdAt: string;
}

const fieldOptions = [
  "법학",
  "사회복지학",
  "심리학",
  "범죄학",
  "사회학",
  "교육학",
  "기타",
];

const researchTypeOptions = [
  { value: "domestic_journal", label: "학술논문 (국내)" },
  { value: "international_journal", label: "학술논문 (국외)" },
  { value: "masters_thesis", label: "학위논문 (석사)" },
  { value: "doctoral_thesis", label: "학위논문 (박사)" },
  { value: "report", label: "연구보고서" },
  { value: "other", label: "기타" },
];

const statusConfig = {
  pending: { label: "대기중", bg: "bg-gray-100", text: "text-gray-600" },
  in_progress: { label: "분석중", bg: "bg-blue-50", text: "text-blue-600" },
  completed: { label: "완료", bg: "bg-green-50", text: "text-green-600" },
};

export default function ResearchDesignPage() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [keywords, setKeywords] = useState("");
  const [field, setField] = useState("");
  const [researchTypes, setResearchTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<ResearchRequest[]>([]);

  // Detail panel state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    const d = loadDraft(pathname);
    if (d) {
      if (d.keywords) setKeywords(d.keywords as string);
      if (d.field) setField(d.field as string);
      if (d.researchTypes) setResearchTypes(d.researchTypes as string[]);
      if (d.description) setDescription(d.description as string);
      if (d.email) setEmail(d.email as string);
    }
  }, [user]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/research-design");
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Fetch messages for selected request
  const fetchMessages = useCallback(async (reqId: string) => {
    try {
      const res = await fetch(`/api/research-design/${reqId}/messages`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      // ignore
    }
  }, []);

  // Poll messages every 5 seconds when panel is open
  useEffect(() => {
    if (!selectedId) return;
    fetchMessages(selectedId);
    const interval = setInterval(() => {
      fetchMessages(selectedId);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedId, fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedRequest = requests.find((r) => r.id === selectedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      saveDraft(pathname, { keywords, field, researchTypes, description, email });
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!keywords.trim() || !field) return;
    setSubmitting(true);
    try {
      await fetch("/api/research-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywords.trim(),
          description: description.trim(),
          field,
          researchTypes,
          email: email.trim(),
        }),
      });
      setKeywords("");
      setField("");
      setResearchTypes([]);
      setDescription("");
      setEmail("");
      await fetchRequests();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedId || !chatInput.trim() || sendingChat) return;
    setSendingChat(true);
    try {
      await fetch(`/api/research-design/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "user", message: chatInput.trim() }),
      });
      setChatInput("");
      await fetchMessages(selectedId);
    } catch {
      // ignore
    } finally {
      setSendingChat(false);
    }
  };

  // Check if there are unread admin messages for a request
  const hasUnread = useCallback(
    (reqId: string) => {
      // We only know unread state for currently loaded messages if it's the selected request
      // For a simple approach, we mark requests that have admin messages
      // A more robust solution would track per-request read state
      if (reqId !== selectedId) return false;
      if (messages.length === 0) return false;
      const lastUserMsgIdx = [...messages]
        .reverse()
        .findIndex((m) => m.sender === "user");
      if (lastUserMsgIdx === -1) {
        // No user messages, any admin message is "unread"
        return messages.some((m) => m.sender === "admin");
      }
      const lastUserMsg = [...messages].reverse()[lastUserMsgIdx];
      return messages.some(
        (m) =>
          m.sender === "admin" &&
          new Date(m.createdAt).getTime() >
            new Date(lastUserMsg.createdAt).getTime()
      );
    },
    [messages, selectedId]
  );

  const sorted = [...requests].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all mb-4"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        대시보드로 돌아가기
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">연구 주제 및 방향 설계</h1>
        <div className="flex items-start gap-2 mt-2">
          <p className="text-gray-600 text-sm leading-relaxed">
            연구 키워드를 입력하시면, 전문가가 선행연구 동향, 연구 방향, 변수 구성,
            통계분석 방법 등을 종합적으로 분석하여 제공합니다.
          </p>
          <InfoTooltip text={"📋 요청 순서:\n① 연구 키워드 입력\n② 연구 분야 선택\n③ 상세 설명 작성\n④ 이메일 입력 → 의뢰 접수\n⑤ 아래 의뢰 내역에서 진행 상황 확인·채팅\n\n지원 내용:\n• 선행연구 트렌드 분석\n• 연구 질문·가설 구체화\n• 이론적 프레임워크 제안\n• 변수 구성·조작적 정의 가이드\n• 적합한 연구 방법론 추천"} />
        </div>
      </div>

      {/* Request Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold">새 의뢰</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연구 키워드
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="예: 가정폭력, 보호명령, 재범"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연구 분야
            </label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e]"
              required
            >
              <option value="">선택해주세요</option>
              {fieldOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연구 유형 <span className="text-gray-400 font-normal">(복수 선택 가능)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {researchTypeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                    researchTypes.includes(opt.value)
                      ? "border-[#c49a2e] bg-[#c49a2e]/5 text-gray-900"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={researchTypes.includes(opt.value)}
                    onChange={() => {
                      setResearchTypes((prev) =>
                        prev.includes(opt.value)
                          ? prev.filter((v) => v !== opt.value)
                          : [...prev, opt.value]
                      );
                    }}
                    className="accent-[#c49a2e] w-4 h-4"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상세 설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="연구하고자 하는 주제, 관심 변수, 특별히 궁금한 사항 등을 자유롭게 작성해주세요"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="결과 알림을 받을 이메일"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e]"
            />
          </div>
          <div className="pt-1">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || !keywords.trim() || !field}
                className="px-6 py-2.5 bg-[#c49a2e] text-white rounded-lg text-sm font-medium hover:bg-[#b08a28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "제출 중..." : "의뢰하기"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Request List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold">의뢰 내역</h2>
        </div>
        {sorted.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg
              className="w-12 h-12 text-gray-200 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm text-gray-400">
              아직 의뢰 내역이 없습니다
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sorted.map((req) => {
              const sc = statusConfig[req.status];
              return (
                <div
                  key={req.id}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedId(req.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {req.keywords}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {req.field}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(req.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over Detail Panel */}
      {selectedId && selectedRequest && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 transition-opacity"
            onClick={() => setSelectedId(null)}
          />
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 flex flex-col animate-slide-in">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {selectedRequest.keywords}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">
                    {selectedRequest.field}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedRequest.status].bg} ${statusConfig[selectedRequest.status].text}`}
                  >
                    {statusConfig[selectedRequest.status].label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(selectedRequest.createdAt).toLocaleDateString(
                      "ko-KR"
                    )}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2 shrink-0"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Panel Body (scrollable) */}
            <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
              {/* Request Details */}
              {selectedRequest.description && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    상세 설명
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>
              )}

              {/* Admin Response */}
              {selectedRequest.status === "completed" &&
                selectedRequest.adminResponse && (
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-green-700">
                          분석 결과
                        </span>
                        {selectedRequest.respondedAt && (
                          <span className="text-xs text-gray-400 ml-auto">
                            {new Date(
                              selectedRequest.respondedAt
                            ).toLocaleDateString("ko-KR")}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedRequest.adminResponse}
                      </div>
                    </div>
                  </div>
                )}

              {/* Chat Section */}
              <div className="px-6 py-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  문의 및 대화
                </p>
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    아직 메시지가 없습니다. 아래에서 문의사항을 보내보세요.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                            msg.sender === "user"
                              ? "bg-[#c49a2e]/10 border border-[#c49a2e]/20 text-gray-900"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              msg.sender === "user"
                                ? "text-[#c49a2e]/60 text-right"
                                : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleString("ko-KR", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Chat Input (sticky at bottom) */}
            <div className="shrink-0 border-t border-gray-200 px-6 py-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/40 focus:border-[#c49a2e]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingChat || !chatInput.trim()}
                  className="px-4 py-2.5 bg-[#c49a2e] text-white rounded-lg text-sm font-medium hover:bg-[#b08a28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Slide-in animation */}
          <style jsx>{`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
            .animate-slide-in {
              animation: slideIn 0.3s ease-out;
            }
          `}</style>
        </>
      )}
    </div>
  );
}
