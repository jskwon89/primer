"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserAuthContext";
import { siteConfig } from "@/lib/siteMode";

export default function SignupPage() {
  const router = useRouter();
  const { signIn } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setError("");
    setLoading(true);

    // 서버 API로 자동 확인된 유저 생성
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "회원가입에 실패했습니다.");
      setLoading(false);
      return;
    }
    // 가입 성공 → 바로 로그인
    const { error: signInErr } = await signIn(email.trim(), password);
    if (signInErr) {
      setError(signInErr);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1a2e] via-[#162240] to-[#0b1422] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#c49a2e] flex items-center justify-center">
                <span className="text-white font-bold text-lg">{siteConfig.name[0]}</span>
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

          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              회원가입 완료
            </h2>
            <p className="text-sm text-white/50 mb-6">
              가입이 완료되었습니다. 로그인해주세요.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-[#c49a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#b08a28] transition-colors"
            >
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1a2e] via-[#162240] to-[#0b1422] px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#c49a2e] flex items-center justify-center">
              <span className="text-white font-bold text-lg">{siteConfig.name[0]}</span>
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
          <h2 className="text-lg font-bold text-white mb-1">회원가입</h2>
          <p className="text-sm text-white/50 mb-6">
            새 계정을 만들어 {siteConfig.name}을 시작하세요.
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
                placeholder="6자 이상 입력하세요"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.07] border border-white/15 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#c49a2e]/50 focus:border-[#c49a2e]/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
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
              disabled={
                loading || !email.trim() || !password || !confirmPassword
              }
              className="w-full py-2.5 bg-[#c49a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#b08a28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="text-[#c49a2e] hover:text-[#d4a843] font-medium transition-colors"
              >
                로그인
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
