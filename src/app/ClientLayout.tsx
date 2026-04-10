"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserAuthContext";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { siteConfig } from "@/lib/siteMode";

const NO_NAVBAR_PATHS = ["/", "/login", "/signup"];

/* ── Leaf nav link (kept for potential reuse) ── */
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

/* ── Accordion sub-category (kept for potential reuse) ── */
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

/* ── Top-level section (kept for potential reuse) ── */
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

/* ── Menu items for the top navbar ── */
const menuItems = [
  { label: "대시보드", href: "/dashboard" },
  { label: "연구설계 상담", href: "/data-generation" },
  { label: "통계분석 설계", href: "/stats-design" },
  { label: "설문구성", href: "/survey-request" },
  { label: "자유게시판", href: "/board" },
  { label: "질문과답변", href: "/board?category=질문" },
  { label: "FAQ", href: "/faq" },
  { label: "문의", href: "/contact" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout } = useAuth();
  const { user, loading: userLoading, signOut: userSignOut } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const siteName = siteConfig.name;

  const isNoNavbar = NO_NAVBAR_PATHS.includes(pathname);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Pages without navbar (landing, login, signup)
  if (isNoNavbar) {
    return <>{children}</>;
  }

  const closeMenu = () => setMobileMenuOpen(false);

  const isActiveLink = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  return (
    <div className="min-h-screen bg-[#faf9f6] overflow-x-hidden">
      {/* ── Top Navigation Bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500">
                <span className="text-white font-bold text-sm">{siteName[0]}</span>
              </div>
              <span className="text-lg font-bold text-teal-600 tracking-tight">{siteName}</span>
            </Link>

            {/* Center: Desktop menu links */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActiveLink(item.href)
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: User info / Login + Admin */}
            <div className="hidden md:flex items-center gap-3">
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin"
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      pathname === "/admin"
                        ? "bg-teal-50 text-teal-600 font-semibold"
                        : "text-gray-500 hover:text-teal-600 hover:bg-gray-50"
                    }`}
                  >
                    관리자
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-xs text-red-400 hover:text-red-500 transition-colors"
                  >
                    관리자 로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 max-w-[120px] truncate">{user.email}</span>
                  <button
                    onClick={() => userSignOut()}
                    className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors ml-1"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 rounded-lg px-4 py-2 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm text-white font-semibold">로그인</span>
                </Link>
              )}
            </div>

            {/* Mobile: Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="px-4 py-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActiveLink(item.href)
                      ? "text-teal-600 bg-teal-50"
                      : "text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-gray-100 space-y-2">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={() => { userSignOut(); closeMenu(); }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 rounded-lg px-4 py-2.5 transition-colors w-full"
                >
                  <span className="text-sm text-white font-semibold">로그인</span>
                </Link>
              )}
              {isAdmin ? (
                <div className="flex items-center justify-between px-3">
                  <Link href="/admin" onClick={closeMenu} className="text-xs text-teal-600">관리자 패널</Link>
                  <button onClick={() => { logout(); closeMenu(); }} className="text-xs text-red-400">관리자 로그아웃</button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowLogin(true); closeMenu(); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-3"
                >
                  관리자 로그인
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content - full width with top padding for navbar */}
      <main className="min-h-screen overflow-x-hidden pt-16">
        {children}
      </main>

      {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
