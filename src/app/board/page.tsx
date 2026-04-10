"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserAuthContext";

interface Post {
  id: string;
  title: string;
  category: string;
  author_email: string;
  author_name: string;
  created_at: string;
  view_count: number;
}

const categories = ["전체", "Q&A", "통계 질문", "연구방법", "데이터", "자유"];

export default function BoardPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // 글쓰기 모달
  const [showWrite, setShowWrite] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postCategory, setPostCategory] = useState("통계 질문");
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "전체") params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`/api/board?${params}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [category, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !user?.email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: postCategory,
          email: user.email,
          name: user.email.split("@")[0],
        }),
      });
      if (res.ok) {
        setShowWrite(false);
        setTitle("");
        setContent("");
        await fetchPosts();
      }
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const displayName = (email: string, name: string) => {
    if (name) return name;
    return email.split("@")[0];
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">자유게시판</h1>
          <p className="text-sm text-gray-500 mt-1">통계, 연구방법, 데이터 관련 질문과 답변을 나눠보세요</p>
        </div>
        {user ? (
          <button
            onClick={() => setShowWrite(true)}
            className="px-4 py-2 bg-[#c49a2e] text-white rounded-lg text-sm font-medium hover:bg-[#b08a28] transition-colors"
          >
            글쓰기
          </button>
        ) : (
          <Link href="/login?redirect=/board" className="px-4 py-2 bg-[#c49a2e] text-white rounded-lg text-sm font-medium hover:bg-[#b08a28] transition-colors">
            로그인 후 글쓰기
          </Link>
        )}
      </div>

      {/* 카테고리 + 검색 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                category === cat ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="검색..."
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30 w-40"
          />
          <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            검색
          </button>
        </form>
      </div>

      {/* 게시글 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">로딩 중...</div>
        ) : posts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-gray-400 text-sm">게시글이 없습니다</p>
            <p className="text-gray-300 text-xs mt-1">첫 번째 글을 작성해보세요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/board/${post.id}`}
                className="flex items-center px-4 sm:px-6 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                      {post.category}
                    </span>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#c49a2e] transition-colors truncate">
                      {post.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{displayName(post.author_email, post.author_name)}</span>
                    <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                    <span>조회 {post.view_count}</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-[#c49a2e] transition-colors shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 글쓰기 모달 */}
      {showWrite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowWrite(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">글쓰기</h3>
              <button onClick={() => setShowWrite(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30"
                >
                  {categories.filter(c => c !== "전체").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="질문이나 내용을 작성하세요"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowWrite(false)} className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50">
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !content.trim()}
                  className="px-6 py-2 bg-[#c49a2e] text-white rounded-lg text-sm font-medium hover:bg-[#b08a28] disabled:opacity-50 transition-colors"
                >
                  {submitting ? "작성 중..." : "등록"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
