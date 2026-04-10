"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserAuthContext";
import { siteConfig } from "@/lib/siteMode";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError("");
    setLoading(true);

    const { error: err } = await signIn(email.trim(), password);
    if (err) {
      setError(
        err === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : err
      );
      setLoading(false);
    } else {
      router.push(redirect);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1a2e] via-[#162240] to-[#0b1422] px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#c49a2e] flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-white group-hover:text-[#d4a843] transition-colors">
                {siteConfig.name}
              </h1>
              <p className="text-[11px] text-white/50 tracking-wide">
                {siteConfig.subtitle}
              </p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-1">로그인</h2>
          <p className="text-sm text-white/50 mb-6">
            계정에 로그인하여 서비스를 이용하세요.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.07] border border-white/15 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/50 focus:border-[#c49a2e]/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.07] border border-white/15 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/50 focus:border-[#c49a2e]/50 transition-all"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full py-2.5 bg-[#c49a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#b08a28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="text-[#c49a2e] hover:text-[#d4a843] font-medium transition-colors"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/25 mt-6">
          {siteConfig.name}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#0f1a2e] to-[#1a2744]" />}>
      <LoginForm />
    </Suspense>
  );
}
