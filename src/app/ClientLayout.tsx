"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserAuthContext";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { siteConfig } from "@/lib/siteMode";

const NO_SIDEBAR_PATHS = ["/", "/login", "/signup"];

/* ── Leaf nav link ── */
function NavLink({ href, label, pathname, onClick }: { href: string; label: string; pathname: string; onClick?: () => void }) {
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-lg text-[13px] transition-all duration-200 ${
        isActive
          ? "bg-[#c49a2e]/25 text-white font-semibold"
          : "text-[#e0e7ef] hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

/* ── Accordion sub-category (▸ 설문조사, ▸ 판결문 등) ── */
function SubCategory({ label, children, pathname, prefixes }: { label: string; children: React.ReactNode; pathname: string; prefixes: string[] }) {
  const hasActive = prefixes.some(p => pathname === p || pathname.startsWith(p + "/"));
  const [open, setOpen] = useState(hasActive);

  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full pl-6 pr-3 py-2 rounded-lg text-[13px] transition-all duration-200 ${
          hasActive ? "text-white font-medium" : "text-[#c8d6e5] hover:bg-white/8 hover:text-white"
        }`}
      >
        <span>{label}</span>
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 opacity-50 ${open ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && <div className="space-y-0.5 mt-0.5">{children}</div>}
    </div>
  );
}

/* ── Top-level section (▼ 연구 자료 생성 등) ── */
function SectionGroup({ color, label, children, pathname, prefixes, defaultOpen }: { color: string; label: string; children: React.ReactNode; pathname: string; prefixes: string[]; defaultOpen?: boolean }) {
  const hasActive = prefixes.some(p => pathname === p || pathname.startsWith(p + "/"));
  const [open, setOpen] = useState(defaultOpen ?? hasActive);

  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);

  return (
    <div className="pt-4 first:pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-1.5 group"
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-5 rounded-full ${color}`} />
          <span className="text-sm font-bold tracking-wide text-white">{label}</span>
        </div>
        <svg className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="border-b border-white/8 mt-1 mx-3" />
      {open && <div className="space-y-0.5 mt-1.5">{children}</div>}
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout } = useAuth();
  const { user, loading: userLoading, signOut: userSignOut } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const siteName = siteConfig.name;

  const isNoSidebar = NO_SIDEBAR_PATHS.includes(pathname);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Pages without sidebar (landing, login, signup)
  if (isNoSidebar) {
    return <>{children}</>;
  }

  const closeSidebar = () => setSidebarOpen(false);

  // All menu items for search filtering
  const allMenuItems = [
    { label: "대시보드", href: "/dashboard" },
    { label: "연구 설계 상담", href: "/data-generation" },
    { label: "통계분석 설계", href: "/stats-design" },
    { label: "설문구성 / 조사설계", href: "/survey-request" },
    { label: "자유게시판", href: "/board" },
    { label: "자주 묻는 질문", href: "/faq" },
    { label: "문의사항", href: "/contact" },
  ];


  const filtered = search.trim()
    ? allMenuItems.filter(item => item.label.toLowerCase().includes(search.trim().toLowerCase()))
    : null;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <Link href="/" className="flex items-center gap-3 group" onClick={closeSidebar}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-teal-500">
            <span className="text-white font-bold text-sm">{siteName[0]}</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white group-hover:text-[#d4a843] transition-colors">
              {siteName}
            </h1>
            <p className="text-[10px] text-white/50 tracking-wide">{siteConfig.subtitle}</p>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="메뉴 검색..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/8 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:bg-white/12 focus:border-white/20 transition-all"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {filtered ? (
          /* Search results */
          filtered.length > 0 ? (
            filtered.map(item => (
              <NavLink key={item.href} href={item.href} label={item.label} pathname={pathname} onClick={closeSidebar} />
            ))
          ) : (
            <p className="text-xs text-white/40 text-center py-4">검색 결과 없음</p>
          )
        ) : (
          /* Full menu */
          <>
            <Link
              href="/dashboard"
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                pathname === "/dashboard"
                  ? "bg-[#c49a2e]/25 text-white font-semibold"
                  : "text-[#e0e7ef] hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              대시보드
            </Link>

            {/* 연구지원 */}
            <SectionGroup color="bg-teal-400" label="연구지원" pathname={pathname} prefixes={["/data-generation", "/stats-design", "/survey-request"]} defaultOpen>
              <NavLink href="/data-generation" label="연구 설계 상담" pathname={pathname} onClick={closeSidebar} />
              <NavLink href="/stats-design" label="통계분석 설계" pathname={pathname} onClick={closeSidebar} />
              <NavLink href="/survey-request" label="설문구성 / 조사설계" pathname={pathname} onClick={closeSidebar} />
            </SectionGroup>

            {/* 커뮤니티 */}
            <SectionGroup color="bg-sky-400" label="커뮤니티" pathname={pathname} prefixes={["/board"]} defaultOpen>
              <NavLink href="/board" label="자유게시판" pathname={pathname} onClick={closeSidebar} />
              <NavLink href="/board?category=Q%26A" label="Q & A" pathname={pathname} onClick={closeSidebar} />
            </SectionGroup>

            {/* 고객센터 */}
            <SectionGroup color="bg-slate-400" label="고객센터" pathname={pathname} prefixes={["/faq", "/contact"]}>
              <NavLink href="/faq" label="자주 묻는 질문" pathname={pathname} onClick={closeSidebar} />
              <NavLink href="/contact" label="문의사항" pathname={pathname} onClick={closeSidebar} />
            </SectionGroup>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-3 mt-auto bg-[#243447]">
        {/* User info - mobile only */}
        <div className="md:hidden">
          {user ? (
            <div className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#c49a2e]/30 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#c49a2e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-[11px] text-white/60 truncate flex-1">{user.email}</span>
              </div>
              <button
                onClick={() => { userSignOut(); closeSidebar(); }}
                className="flex items-center gap-2 mt-2 text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={closeSidebar}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#c49a2e] hover:text-[#c49a2e]/80 hover:bg-white/10 transition-all w-full"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              로그인
            </Link>
          )}
        </div>

        {isAdmin ? (
          <div className="space-y-1">
            <Link
              href="/admin"
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                pathname === "/admin" ? "bg-[#c49a2e]/25 text-white font-semibold" : "text-[#e0e7ef] hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              관리자 패널
            </Link>
            <button
              onClick={() => { logout(); closeSidebar(); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-400/80 hover:text-red-300 hover:bg-white/10 transition-all w-full"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            관리자
          </button>
        )}

        <div className="flex items-center justify-between px-3">
          <span className="text-[10px] text-white/30 font-medium">v0.2.0</span>
          <span className="text-[10px] text-white/30">{siteName}</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 md:hidden bg-[#2c3e50]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-teal-500">
            <span className="text-white font-bold text-xs">{siteName[0]}</span>
          </div>
          <span className="text-sm font-bold text-white">{siteName}</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 transition-colors"
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={closeSidebar} />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50
        w-[260px] md:w-60 flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        bg-[#2c3e50] text-[#dce6f0]
      `}>
        {sidebarContent}
      </aside>

      <main className="min-h-screen overflow-x-hidden bg-gray-100 pt-14 md:pt-0 md:ml-60">
        {children}
      </main>

      {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
