"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface SurveyRequest {
  id: string;
  email: string;
  title: string;
  purpose: string;
  requesterName: string;
  organization: string;
  population: string;
  sampleSize: string;
  samplingMethod: string;
  startDate: string;
  endDate: string;
  irbStatus: string;
  additionalRequests: string;
  surveyData: string;
  status: "pending" | "received" | "in_progress" | "completed";
  createdAt: string;
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

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "접수 대기중", bg: "bg-gray-100", text: "text-gray-600" },
  received: { label: "접수 완료", bg: "bg-yellow-50", text: "text-yellow-700" },
  in_progress: { label: "작업 진행중", bg: "bg-blue-50", text: "text-blue-600" },
  completed: { label: "작업 완료", bg: "bg-green-50", text: "text-green-600" },
};

function getQuestionCount(surveyData: string): number {
  if (!surveyData) return 0;
  try {
    const parsed = JSON.parse(surveyData);
    return Array.isArray(parsed.questions) ? parsed.questions.length : 0;
  } catch {
    return 0;
  }
}

export default function SurveyResultsPage() {
  const [requests, setRequests] = useState<SurveyRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/survey");
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const fetchMessages = useCallback(async (reqId: string) => {
    try {
      const res = await fetch(`/api/survey/${reqId}/messages`);
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

  const handleSendMessage = async () => {
    if (!selectedId || !chatInput.trim() || sendingChat) return;
    setSendingChat(true);
    try {
      await fetch(`/api/survey/${selectedId}/messages`, {
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

  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        대시보드로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-2">설문조사 결과 확인</h1>
      <p className="text-gray-600 text-sm mb-8">의뢰하신 설문조사의 진행 상황과 결과를 확인합니다.</p>

      {/* 의뢰 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold">의뢰 내역</h2>
        </div>
        {sorted.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-sm text-gray-400 mb-4">아직 의뢰 내역이 없습니다.</p>
            <Link
              href="/survey-request"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              설문조사 의뢰하기
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sorted.map((req) => {
              const sc = statusConfig[req.status];
              const qCount = getQuestionCount(req.surveyData);
              return (
                <div
                  key={req.id}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedId(req.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {req.title}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                      >
                        {sc.label}
                      </span>
                      {qCount > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                          {qCount}문항
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{req.requesterName || req.email}</span>
                      {req.population && <span className="text-xs text-gray-400">{req.population}</span>}
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

      {/* 진행 절차 안내 */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold mb-4">진행 절차 안내</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
            <p className="text-sm font-medium">의뢰 접수</p>
            <p className="text-xs text-gray-600 mt-1">설문 정보 입력 및 제출</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
            <p className="text-sm font-medium">견적 안내</p>
            <p className="text-xs text-gray-600 mt-1">검토 후 비용 및 일정 안내</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
            <p className="text-sm font-medium">조사 진행</p>
            <p className="text-xs text-gray-600 mt-1">설문 배포 및 응답 수집</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
            <p className="text-sm font-medium">결과 전달</p>
            <p className="text-xs text-gray-600 mt-1">원시 데이터 + 기초 분석 보고서</p>
          </div>
        </div>
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
                  {selectedRequest.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedRequest.status].bg} ${statusConfig[selectedRequest.status].text}`}
                  >
                    {statusConfig[selectedRequest.status].label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(selectedRequest.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2 shrink-0"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Panel Body (scrollable) */}
            <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
              {/* Request Details */}
              <div className="px-6 py-4 border-b border-gray-100 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">의뢰 정보</p>
                {selectedRequest.purpose && (
                  <div>
                    <p className="text-xs text-gray-400">연구 목적</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedRequest.purpose}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {selectedRequest.requesterName && (
                    <div>
                      <p className="text-xs text-gray-400">의뢰자</p>
                      <p className="text-sm text-gray-700">{selectedRequest.requesterName}</p>
                    </div>
                  )}
                  {selectedRequest.organization && (
                    <div>
                      <p className="text-xs text-gray-400">소속</p>
                      <p className="text-sm text-gray-700">{selectedRequest.organization}</p>
                    </div>
                  )}
                  {selectedRequest.population && (
                    <div>
                      <p className="text-xs text-gray-400">대상 모집단</p>
                      <p className="text-sm text-gray-700">{selectedRequest.population}</p>
                    </div>
                  )}
                  {selectedRequest.sampleSize && (
                    <div>
                      <p className="text-xs text-gray-400">표본 크기</p>
                      <p className="text-sm text-gray-700">{selectedRequest.sampleSize}</p>
                    </div>
                  )}
                  {selectedRequest.samplingMethod && (
                    <div>
                      <p className="text-xs text-gray-400">표집 방법</p>
                      <p className="text-sm text-gray-700">{selectedRequest.samplingMethod}</p>
                    </div>
                  )}
                  {selectedRequest.irbStatus && (
                    <div>
                      <p className="text-xs text-gray-400">IRB 상태</p>
                      <p className="text-sm text-gray-700">{selectedRequest.irbStatus}</p>
                    </div>
                  )}
                  {selectedRequest.startDate && (
                    <div>
                      <p className="text-xs text-gray-400">조사 시작일</p>
                      <p className="text-sm text-gray-700">{selectedRequest.startDate}</p>
                    </div>
                  )}
                  {selectedRequest.endDate && (
                    <div>
                      <p className="text-xs text-gray-400">조사 종료일</p>
                      <p className="text-sm text-gray-700">{selectedRequest.endDate}</p>
                    </div>
                  )}
                </div>
                {selectedRequest.surveyData && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      설문지 첨부됨 ({getQuestionCount(selectedRequest.surveyData)}문항)
                    </span>
                  </div>
                )}
                {selectedRequest.additionalRequests && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400">추가 요청사항</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedRequest.additionalRequests}</p>
                  </div>
                )}
              </div>

              {/* Admin Response */}
              {selectedRequest.status === "completed" && selectedRequest.adminResponse && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-700">완료 안내</span>
                      {selectedRequest.respondedAt && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(selectedRequest.respondedAt).toLocaleDateString("ko-KR")}
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
                              ? "bg-teal-500/10 border border-teal-500/20 text-gray-900"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              msg.sender === "user"
                                ? "text-teal-500/60 text-right"
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
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingChat || !chatInput.trim()}
                  className="px-4 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
