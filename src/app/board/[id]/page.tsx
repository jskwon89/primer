"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserAuthContext";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author_email: string;
  author_name: string;
  created_at: string;
  view_count: number;
}

interface Comment {
  id: string;
  post_id: string;
  content: string;
  author_email: string;
  author_name: string;
  created_at: string;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/board/${id}`);
      const data = await res.json();
      if (data.post) {
        setPost(data.post);
        setComments(data.comments ?? []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const handleComment = async () => {
    if (!commentText.trim() || !user?.email || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/board/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          email: user.email,
          name: user.email.split("@")[0],
        }),
      });
      if (res.ok) {
        setCommentText("");
        await fetchPost();
      }
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/board/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/board");
  };

  const displayName = (email: string, name: string) => name || email.split("@")[0];
  const isAuthor = user?.email === post?.author_email;

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center py-16 text-sm text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">게시글을 찾을 수 없습니다</p>
          <Link href="/board" className="text-[#c49a2e] text-sm mt-2 inline-block hover:underline">목록으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* 뒤로가기 */}
      <Link href="/board" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </Link>

      {/* 게시글 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 sm:px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
              {post.category}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-5 pb-4 border-b border-gray-100">
            <span className="font-medium text-gray-600">{displayName(post.author_email, post.author_name)}</span>
            <span>{new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            <span>조회 {post.view_count}</span>
            {isAuthor && (
              <button onClick={handleDelete} className="text-red-400 hover:text-red-600 ml-auto">삭제</button>
            )}
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </div>

      {/* 댓글 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">댓글 {comments.length}개</h2>
        </div>

        {comments.length > 0 && (
          <div className="divide-y divide-gray-50">
            {comments.map((c) => (
              <div key={c.id} className="px-5 sm:px-6 py-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-medium text-gray-700">{displayName(c.author_email, c.author_name)}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(c.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* 댓글 입력 */}
        <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
          {user ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                placeholder="댓글을 입력하세요..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/30"
              />
              <button
                onClick={handleComment}
                disabled={submitting || !commentText.trim()}
                className="px-4 py-2 bg-[#c49a2e] text-white rounded-lg text-sm font-medium hover:bg-[#b08a28] disabled:opacity-50 transition-colors shrink-0"
              >
                {submitting ? "..." : "등록"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center">
              <Link href={`/login?redirect=/board/${id}`} className="text-[#c49a2e] hover:underline">로그인</Link> 후 댓글을 작성할 수 있습니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
