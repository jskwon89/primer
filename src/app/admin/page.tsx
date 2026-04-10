"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";

interface CreditData {
  balance: number;
  transactions: { id: string; type: string; amount: number; description: string; createdAt: string }[];
}

interface Project {
  id: string;
  name: string;
  createdAt: string;
  caseCount: number;
  codedCount: number;
}

interface GenericRequest {
  id: string;
  email: string;
  status: "pending" | "received" | "in_progress" | "completed";
  createdAt: string;
  adminResponse: string;
  respondedAt: string;
  [key: string]: unknown;
}

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

const serviceTypes = [
  { key: "research-design", label: "연구 설계", api: "/api/research-design", titleField: "researchTopic" },
  { key: "stats-design", label: "통계분석 설계", api: "/api/stats-design", titleField: "researchQuestion" },
  { key: "survey", label: "설문조사", api: "/api/survey", titleField: "surveyTopic" },
  { key: "judgment-collection", label: "판결문 수집", api: "/api/judgment-collection", titleField: "courtType" },
  { key: "judgment-coding", label: "판결문 코딩", api: "/api/judgment-coding", titleField: "projectName" },
  { key: "news-collection", label: "뉴스 수집", api: "/api/news-collection", titleField: "keywords" },
  { key: "data-transform", label: "데이터 전처리", api: "/api/data-transform", titleField: "dataDescription" },
  { key: "quant-analysis", label: "계량분석", api: "/api/quant-analysis", titleField: "analysisType" },
  { key: "text-analysis", label: "텍스트 분석", api: "/api/text-analysis-request", titleField: "analysisTypes" },
  { key: "qual-analysis", label: "질적분석", api: "/api/qual-analysis", titleField: "analysisType" },
];

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "접수 대기중", bg: "bg-gray-100", text: "text-gray-600" },
  received: { label: "접수 완료", bg: "bg-yellow-50", text: "text-yellow-700" },
  in_progress: { label: "작업 진행중", bg: "bg-blue-50", text: "text-blue-600" },
  completed: { label: "작업 완료", bg: "bg-green-50", text: "text-green-600" },
};

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [chargeAmount, setChargeAmount] = useState("");
  const [charging, setCharging] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "inquiries" | "credits" | "projects" | "site-settings">("overview");

  // Site settings (landing page sections)
  const [siteSettings, setSiteSettings] = useState<Record<string, boolean>>({
    services: true,
    value_proposition: true,
    how_it_works: true,
    contact: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Requests management
  const [allRequests, setAllRequests] = useState<{ type: string; label: string; api: string; titleField: string; requests: GenericRequest[] }[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "received" | "in_progress" | "completed">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedReq, setSelectedReq] = useState<{ type: string; api: string; req: GenericRequest } | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  // Contact inquiries
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [replyUpdating, setReplyUpdating] = useState(false);

  // Chat messages for selected request
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; message: string; createdAt: string }[]>([]);
  const [adminChatInput, setAdminChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Files for judgment-coding request
  const [reqFiles, setReqFiles] = useState<{ name: string; originalName: string; size: number; createdAt: string; storagePath: string }[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }
    fetchData();
    fetchRequests();
    fetchInquiries();
    fetchSiteSettings();
  }, [isAdmin, router]);

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch("/api/site-settings");
      const data = await res.json();
      if (data.settings) setSiteSettings(data.settings);
    } catch { /* ignore */ }
  };

  const handleSaveSiteSettings = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: siteSettings }),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSavingSettings(false); }
  };

  const fetchData = async () => {
    const [credRes, projRes] = await Promise.all([
      fetch("/api/credits"),
      fetch("/api/projects"),
    ]);
    const credData = await credRes.json();
    const projData = await projRes.json();
    setCredits(credData);
    setProjects(projData.projects || []);
  };

  const fetchRequests = useCallback(async () => {
    try {
      const results = await Promise.all(
        serviceTypes.map(async (svc) => {
          const res = await fetch(svc.api);
          const data = await res.json();
          return {
            type: svc.key,
            label: svc.label,
            api: svc.api,
            titleField: svc.titleField,
            requests: (data.requests ?? []) as GenericRequest[],
          };
        })
      );
      setAllRequests(results);
    } catch { /* ignore */ }
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      setInquiries(data.inquiries ?? []);
    } catch { /* ignore */ }
  }, []);

  const fetchReqFiles = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/files`);
      const data = await res.json();
      setReqFiles(data.files ?? []);
    } catch { setReqFiles([]); }
  };

  const fetchChatMessages = async (api: string, reqId: string) => {
    try {
      const res = await fetch(`${api}/${reqId}/messages`);
      const data = await res.json();
      setChatMessages(data.messages ?? []);
    } catch { /* ignore */ }
  };

  const handleCharge = async () => {
    const amount = parseInt(chargeAmount);
    if (!amount || amount <= 0) return;
    setCharging(true);
    try {
      await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description: `관리자 수동 충전 (${amount.toLocaleString()} 크레딧)` }),
      });
      setChargeAmount("");
      await fetchData();
    } finally {
      setCharging(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`"${name}" 프로젝트를 삭제하시겠습니까?`)) return;
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    await fetchData();
  };

  const handleUpdateRequest = async () => {
    if (!selectedReq) return;
    setUpdating(true);
    try {
      await fetch(`${selectedReq.api}/${selectedReq.req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(newStatus ? { status: newStatus } : {}),
          ...(adminResponse.trim() ? { adminResponse: adminResponse.trim(), respondedAt: new Date().toISOString() } : {}),
        }),
      });
      setSelectedReq(null);
      setAdminResponse("");
      setNewStatus("");
      await fetchRequests();
    } finally {
      setUpdating(false);
    }
  };

  const handleSendAdminChat = async () => {
    if (!selectedReq || !adminChatInput.trim() || sendingChat) return;
    setSendingChat(true);
    try {
      await fetch(`${selectedReq.api}/${selectedReq.req.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "admin", message: adminChatInput.trim() }),
      });
      setAdminChatInput("");
      await fetchChatMessages(selectedReq.api, selectedReq.req.id);
    } catch { /* ignore */ }
    finally { setSendingChat(false); }
  };

  // 필드명 한국어 매핑
  const fieldLabels: Record<string, string> = {
    id: "ID", email: "이메일", status: "상태", createdAt: "접수일",
    adminResponse: "관리자 응답", respondedAt: "응답일",
    name: "이름", organization: "소속", purpose: "목적",
    searchType: "검색유형", caseNumbers: "사건번호", scopeFirst: "1심",
    scopeSecond: "2심", scopeThird: "3심", outputFormat: "출력형식",
    keywords: "키워드", keywordLogic: "키워드 논리", courts: "법원",
    startYear: "시작연도", endYear: "종료연도", caseTypes: "사건유형",
    lawKeyword: "법조문", maxCount: "최대건수", additionalNotes: "추가요청사항",
    projectId: "프로젝트ID", projectName: "프로젝트명", note: "요청사항",
    fileCount: "파일수", researchTopic: "연구주제", researchQuestion: "연구문제",
    surveyTopic: "설문주제", dataDescription: "데이터 설명",
    analysisType: "분석유형", analysisTypes: "분석유형",
  };

  const statusLabels: Record<string, string> = {
    pending: "접수 대기중", received: "접수 완료", in_progress: "작업 진행중", completed: "작업 완료",
  };

  // 전체 의뢰 목록 Excel 내보내기
  const handleExportAll = () => {
    if (filteredRequests.length === 0) return;

    const rows = filteredRequests.map((req) => {
      const row: Record<string, string> = {
        "서비스": req._label,
        "이메일": req.email,
        "상태": statusLabels[req.status] || req.status,
        "접수일": new Date(req.createdAt).toLocaleDateString("ko-KR"),
        "관리자 응답": req.adminResponse || "",
        "응답일": req.respondedAt ? new Date(req.respondedAt).toLocaleDateString("ko-KR") : "",
      };
      // 나머지 데이터 필드도 추가
      Object.entries(req).forEach(([k, v]) => {
        if (["id", "email", "status", "createdAt", "adminResponse", "respondedAt", "_type", "_label", "_api", "_titleField"].includes(k)) return;
        const label = fieldLabels[k] || k;
        row[label] = String(v ?? "");
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "의뢰 목록");

    // 열 너비 자동 조정
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length * 2, ...rows.map((r) => String(r[key] || "").length).slice(0, 50), 10),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `의뢰목록_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 개별 의뢰 상세 Excel 내보내기
  const handleExportDetail = (req: GenericRequest & { _label?: string }) => {
    const rows = Object.entries(req)
      .filter(([k]) => !["_type", "_label", "_api", "_titleField"].includes(k))
      .map(([k, v]) => ({
        "항목": fieldLabels[k] || k,
        "내용": k === "status" ? (statusLabels[String(v)] || String(v)) : String(v ?? ""),
      }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "의뢰 상세");
    ws["!cols"] = [{ wch: 20 }, { wch: 60 }];

    const label = (req as Record<string, unknown>)._label || "의뢰";
    XLSX.writeFile(wb, `${label}_${req.id.slice(0, 8)}.xlsx`);
  };

  const handleReplyInquiry = async () => {
    if (!selectedInquiry || !adminReply.trim()) return;
    setReplyUpdating(true);
    try {
      await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedInquiry.id,
          adminReply: adminReply.trim(),
          status: "replied",
          repliedAt: new Date().toISOString(),
        }),
      });
      setSelectedInquiry(null);
      setAdminReply("");
      await fetchInquiries();
    } finally {
      setReplyUpdating(false);
    }
  };

  if (!isAdmin) return null;

  const totalCases = projects.reduce((s, p) => s + p.caseCount, 0);
  const totalCoded = projects.reduce((s, p) => s + p.codedCount, 0);

  // Flatten all requests for unified view
  const flatRequests = allRequests.flatMap((svc) =>
    svc.requests.map((req) => ({ ...req, _type: svc.type, _label: svc.label, _api: svc.api, _titleField: svc.titleField }))
  );
  const filteredRequests = flatRequests
    .filter((r) => filterStatus === "all" || r.status === filterStatus)
    .filter((r) => filterType === "all" || r._type === filterType)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingCount = flatRequests.filter((r) => r.status === "pending").length;
  const inProgressCount = flatRequests.filter((r) => r.status === "in_progress").length;
  const pendingInquiryCount = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">관리자 패널</h1>
          <p className="text-xs text-gray-400">시스템 관리 및 모니터링</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
        {([
          { key: "overview", label: "전체 현황" },
          { key: "requests", label: `의뢰 관리${pendingCount ? ` (${pendingCount})` : ""}` },
          { key: "inquiries", label: `문의 관리${pendingInquiryCount ? ` (${pendingInquiryCount})` : ""}` },
          { key: "credits", label: "크레딧 관리" },
          { key: "projects", label: "프로젝트 관리" },
          { key: "site-settings", label: "사이트 설정" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <OverviewCard label="크레딧 잔액" value={credits?.balance?.toLocaleString() ?? "..."} color="amber" />
            <OverviewCard label="총 의뢰" value={flatRequests.length} color="blue" />
            <OverviewCard label="대기중" value={pendingCount} color="red" />
            <OverviewCard label="진행중" value={inProgressCount} color="green" />
            <OverviewCard label="문의 대기" value={pendingInquiryCount} color="purple" />
          </div>

          {/* Recent pending requests */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">최근 대기중 의뢰</h3>
            {flatRequests.filter((r) => r.status === "pending").length > 0 ? (
              <div className="space-y-2">
                {flatRequests
                  .filter((r) => r.status === "pending")
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10)
                  .map((req) => (
                    <div key={req.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <span className="text-xs font-medium text-[#c49a2e] mr-2">[{req._label}]</span>
                        <span className="text-sm text-gray-700">{String((req as Record<string, unknown>)[req._titleField] || "").slice(0, 40) || req.email}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(req.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>
                      <button
                        onClick={() => { setActiveTab("requests"); setSelectedReq({ type: req._type, api: req._api, req }); setNewStatus(req.status); setAdminResponse(req.adminResponse || ""); fetchChatMessages(req._api, req.id); if (req._type === "judgment-coding" && (req as Record<string, unknown>).projectId) fetchReqFiles(String((req as Record<string, unknown>).projectId)); else setReqFiles([]); }}
                        className="px-3 py-1 text-xs text-[#c49a2e] border border-[#c49a2e]/30 rounded-lg hover:bg-[#c49a2e]/5"
                      >
                        처리
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">대기중인 의뢰가 없습니다</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">최근 크레딧 내역</h3>
            {credits?.transactions?.length ? (
              <div className="space-y-2">
                {credits.transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="text-sm text-gray-700">{tx.description}</span>
                      <span className="text-xs text-gray-400 ml-2">{tx.createdAt.slice(0, 16).replace("T", " ")}</span>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === "charge" ? "text-green-600" : "text-red-500"}`}>
                      {tx.type === "charge" ? "+" : "-"}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">내역이 없습니다</p>
            )}
          </div>
        </div>
      )}

      {/* Requests Management */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30"
            >
              <option value="all">전체 서비스</option>
              {serviceTypes.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {([
                { key: "all", label: "전체" },
                { key: "pending", label: "접수 대기" },
                { key: "received", label: "접수 완료" },
                { key: "in_progress", label: "작업 진행" },
                { key: "completed", label: "작업 완료" },
              ] as const).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFilterStatus(s.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filterStatus === s.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400">{filteredRequests.length}건</span>
            {filteredRequests.length > 0 && (
              <button
                onClick={handleExportAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ml-auto"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Excel 내보내기
              </button>
            )}
          </div>

          {/* Request list */}
          <div className="bg-white rounded-xl border border-gray-200">
            {filteredRequests.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">해당 조건의 의뢰가 없습니다</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="px-4 py-3 font-medium">서비스</th>
                      <th className="px-4 py-3 font-medium">이메일</th>
                      <th className="px-4 py-3 font-medium">내용</th>
                      <th className="px-4 py-3 font-medium text-center">상태</th>
                      <th className="px-4 py-3 font-medium">접수일</th>
                      <th className="px-4 py-3 font-medium text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => {
                      const sc = statusConfig[req.status];
                      return (
                        <tr key={`${req._type}-${req.id}`} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[#c49a2e]/10 text-[#c49a2e]">
                              {req._label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{req.email}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                            {String((req as Record<string, unknown>)[req._titleField] || "").slice(0, 50)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{new Date(req.createdAt).toLocaleDateString("ko-KR")}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => { setSelectedReq({ type: req._type, api: req._api, req }); setNewStatus(req.status); setAdminResponse(req.adminResponse || ""); fetchChatMessages(req._api, req.id); if (req._type === "judgment-coding" && (req as Record<string, unknown>).projectId) fetchReqFiles(String((req as Record<string, unknown>).projectId)); else setReqFiles([]); }}
                              className="px-3 py-1.5 text-xs text-[#c49a2e] border border-[#c49a2e]/30 rounded-lg hover:bg-[#c49a2e]/5 transition-colors"
                            >
                              상세/처리
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Request detail modal */}
          {selectedReq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">의뢰 상세</h3>
                    <button
                      onClick={() => handleExportDetail(selectedReq.req)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Excel
                    </button>
                  </div>
                  <button onClick={() => { setSelectedReq(null); setChatMessages([]); setReqFiles([]); }} className="p-2 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {/* Request info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-400">이메일:</span> <span className="text-gray-700">{selectedReq.req.email}</span></div>
                    <div><span className="text-gray-400">접수일:</span> <span className="text-gray-700">{new Date(selectedReq.req.createdAt).toLocaleDateString("ko-KR")}</span></div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    {Object.entries(selectedReq.req)
                      .filter(([k]) => !["id", "status", "createdAt", "adminResponse", "respondedAt", "email", "_type", "_label", "_api", "_titleField"].includes(k))
                      .map(([k, v]) => (
                        <div key={k} className="mb-2">
                          <span className="text-gray-400 text-xs">{k}:</span>
                          <p className="text-gray-700 whitespace-pre-wrap">{String(v).slice(0, 500)}</p>
                        </div>
                      ))}
                  </div>

                  {/* 판결문 코딩 의뢰 시 첨부 파일 목록 */}
                  {selectedReq.type === "judgment-coding" && reqFiles.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">첨부 파일 ({reqFiles.length}개)</span>
                        <button
                          onClick={() => {
                            const projectId = String((selectedReq.req as Record<string, unknown>).projectId);
                            window.open(`/api/projects/${projectId}/files/download-all`, "_blank");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-[#c49a2e] rounded-md hover:bg-[#b08a28] transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          전체 다운로드 (ZIP)
                        </button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {reqFiles.map((f, idx) => (
                          <div key={f.storagePath} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50">
                            <span className="text-xs text-gray-400 w-5 text-right shrink-0">{idx + 1}</span>
                            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 truncate flex-1">{f.originalName}</span>
                            <span className="text-xs text-gray-400 shrink-0">{f.size ? `${(f.size / 1024).toFixed(0)}KB` : ""}</span>
                            <button
                              onClick={async () => {
                                const projectId = String((selectedReq.req as Record<string, unknown>).projectId);
                                const res = await fetch(`/api/projects/${projectId}/files/download?path=${encodeURIComponent(f.storagePath)}`);
                                const data = await res.json();
                                if (data.url) window.open(data.url, "_blank");
                              }}
                              className="text-xs text-[#c49a2e] hover:text-[#b08a28] font-medium shrink-0"
                            >
                              다운로드
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status update */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">상태 변경</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30"
                      >
                        <option value="pending">접수 대기중</option>
                        <option value="received">접수 완료</option>
                        <option value="in_progress">작업 진행중</option>
                        <option value="completed">작업 완료</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">관리자 응답</label>
                      <textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        rows={3}
                        placeholder="완료 시 결과 안내 메시지를 작성하세요"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30 resize-none"
                      />
                    </div>
                    <button
                      onClick={handleUpdateRequest}
                      disabled={updating}
                      className="px-6 py-2.5 bg-[#c49a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#b08a28] disabled:opacity-50 transition-colors"
                    >
                      {updating ? "처리 중..." : "저장"}
                    </button>
                  </div>

                  {/* Chat section */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">채팅 내역</p>
                    <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                      {chatMessages.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">메시지 없음</p>
                      ) : (
                        chatMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.sender === "admin" ? "bg-[#c49a2e]/10 text-gray-900" : "bg-gray-100 text-gray-900"}`}>
                              <p className="whitespace-pre-wrap">{msg.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {msg.sender === "admin" ? "관리자" : "사용자"} &middot; {new Date(msg.createdAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={adminChatInput}
                        onChange={(e) => setAdminChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSendAdminChat(); }}
                        placeholder="관리자 메시지 입력..."
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30"
                      />
                      <button
                        onClick={handleSendAdminChat}
                        disabled={sendingChat || !adminChatInput.trim()}
                        className="px-4 py-2 bg-[#c49a2e] text-white rounded-lg text-sm font-medium hover:bg-[#b08a28] disabled:opacity-50"
                      >
                        전송
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inquiries Management */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">문의사항 관리 ({inquiries.length}건)</h3>
            </div>
            {inquiries.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">문의가 없습니다</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="px-4 py-3 font-medium">유형</th>
                      <th className="px-4 py-3 font-medium">제목</th>
                      <th className="px-4 py-3 font-medium">이메일</th>
                      <th className="px-4 py-3 font-medium text-center">상태</th>
                      <th className="px-4 py-3 font-medium">접수일</th>
                      <th className="px-4 py-3 font-medium text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((inq) => (
                      <tr key={inq.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{inq.category}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{inq.subject}</td>
                        <td className="px-4 py-3 text-gray-700">{inq.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            inq.status === "replied" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                          }`}>
                            {inq.status === "replied" ? "답변 완료" : "대기중"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(inq.createdAt).toLocaleDateString("ko-KR")}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => { setSelectedInquiry(inq); setAdminReply(inq.adminReply || ""); }}
                            className="px-3 py-1.5 text-xs text-[#c49a2e] border border-[#c49a2e]/30 rounded-lg hover:bg-[#c49a2e]/5 transition-colors"
                          >
                            {inq.status === "replied" ? "보기" : "답변"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inquiry detail modal */}
          {selectedInquiry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">문의 상세</h3>
                  <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="text-sm">
                    <p className="text-gray-400 text-xs mb-1">제목</p>
                    <p className="font-medium text-gray-900">{selectedInquiry.subject}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-400 text-xs">이메일:</span><br />{selectedInquiry.email}</div>
                    <div><span className="text-gray-400 text-xs">이름:</span><br />{selectedInquiry.name || "-"}</div>
                    <div><span className="text-gray-400 text-xs">유형:</span><br />{selectedInquiry.category}</div>
                    <div><span className="text-gray-400 text-xs">접수일:</span><br />{new Date(selectedInquiry.createdAt).toLocaleDateString("ko-KR")}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">관리자 답변</label>
                    <textarea
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      rows={4}
                      placeholder="답변을 작성해주세요"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50"
                    >
                      닫기
                    </button>
                    <button
                      onClick={handleReplyInquiry}
                      disabled={replyUpdating || !adminReply.trim()}
                      className="px-6 py-2.5 bg-[#c49a2e] text-white rounded-xl text-sm font-semibold hover:bg-[#b08a28] disabled:opacity-50 transition-colors"
                    >
                      {replyUpdating ? "처리 중..." : "답변 저장"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credits */}
      {activeTab === "credits" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-1">크레딧 잔액</h3>
            <p className="text-3xl font-bold text-[#c49a2e] mb-6">{credits?.balance?.toLocaleString() ?? 0} 크레딧</p>

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">충전 금액</label>
                <input
                  type="number"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCharge()}
                  placeholder="충전할 크레딧 수"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30 focus:border-[#c49a2e]"
                />
              </div>
              <div className="flex gap-2">
                {[1000, 5000, 10000, 50000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setChargeAmount(String(amt))}
                    className="px-3 py-2.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    {(amt / 1000)}K
                  </button>
                ))}
              </div>
              <button
                onClick={handleCharge}
                disabled={charging || !chargeAmount}
                className="px-6 py-2.5 bg-[#c49a2e] text-white rounded-xl text-sm font-semibold hover:bg-[#d4a843] disabled:opacity-50 transition-colors"
              >
                {charging ? "충전 중..." : "충전"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">전체 거래 내역</h3>
            <div className="max-h-96 overflow-y-auto">
              {credits?.transactions?.length ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="pb-2 font-medium">날짜</th>
                      <th className="pb-2 font-medium">유형</th>
                      <th className="pb-2 font-medium">설명</th>
                      <th className="pb-2 font-medium text-right">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credits.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-50">
                        <td className="py-2.5 text-gray-500">{tx.createdAt.slice(0, 10)}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            tx.type === "charge" ? "bg-green-50 text-green-600" : tx.type === "refund" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"
                          }`}>
                            {tx.type === "charge" ? "충전" : tx.type === "refund" ? "환불" : "사용"}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-700">{tx.description}</td>
                        <td className={`py-2.5 text-right font-bold ${tx.type === "charge" || tx.type === "refund" ? "text-green-600" : "text-red-500"}`}>
                          {tx.type === "charge" || tx.type === "refund" ? "+" : "-"}{tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-400 py-4">거래 내역이 없습니다</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Projects */}
      {activeTab === "projects" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">프로젝트 목록 ({projects.length}개)</h3>
          </div>
          {projects.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">프로젝트가 없습니다</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">이름</th>
                  <th className="px-6 py-3 font-medium">생성일</th>
                  <th className="px-6 py-3 font-medium text-center">사건</th>
                  <th className="px-6 py-3 font-medium text-center">코딩</th>
                  <th className="px-6 py-3 font-medium text-center">진행률</th>
                  <th className="px-6 py-3 font-medium text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const pct = p.caseCount > 0 ? ((p.codedCount / p.caseCount) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-3 text-gray-500">{p.createdAt.slice(0, 10)}</td>
                      <td className="px-6 py-3 text-center text-gray-700">{p.caseCount}</td>
                      <td className="px-6 py-3 text-center text-gray-700">{p.codedCount}</td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-sm font-bold text-[#c49a2e]">{pct}%</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleDeleteProject(p.id, p.name)}
                          className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Site Settings */}
      {activeTab === "site-settings" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-1">랜딩 페이지 섹션 관리</h3>
            <p className="text-sm text-gray-400 mb-6">대문(메인) 페이지에 표시할 섹션을 선택하세요</p>

            <div className="space-y-4">
              {[
                { key: "services", label: "제공 서비스", desc: "연구 설계, 설문조사, 판결문 분석 등 서비스 카드 목록" },
                { key: "value_proposition", label: "왜 ResearchOn인가요?", desc: "합리적인 가격, 검증된 품질, 수정보완 보장 등 강점 소개" },
                { key: "how_it_works", label: "이용 절차", desc: "회원가입 → 서비스 선택 → 자료 업로드 → 결과 확인 4단계" },
                { key: "contact", label: "문의/CTA", desc: "이메일 문의 폼 + '무료로 시작하기' 버튼" },
              ].map((section) => (
                <div key={section.key} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{section.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{section.desc}</p>
                  </div>
                  <button
                    onClick={() => setSiteSettings((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      siteSettings[section.key] ? "bg-[#c49a2e]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        siteSettings[section.key] ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSaveSiteSettings}
                disabled={savingSettings}
                className="px-6 py-2.5 bg-[#c49a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#b08a28] disabled:opacity-50 transition-colors"
              >
                {savingSettings ? "저장 중..." : "저장"}
              </button>
              {settingsSaved && (
                <span className="text-sm text-green-600 font-medium">저장되었습니다</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    amber: "bg-[#c49a2e]/10 text-[#c49a2e]",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium mb-3 ${colors[color]}`}>{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
