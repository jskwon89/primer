"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserAuthContext";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { siteConfig } from "@/lib/siteMode";

const NO_NAVBAR_PATHS = ["/", "/login", "/signup"];

interface MenuGroup {
  label: string;
  items: { label: string; href: string }[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "상담",
    items: [
      { label: "연구설계", href: "/data-generation" },
      { label: "통계분석", href: "/stats-design" },
      { label: "설문구성", href: "/survey-request" },
    ],
  },
  {
    label: "게시판",
    items: [
      { label: "자유게시판", href: "/board" },
      { label: "질문과 답변", href: "/board?category=질문" },
    ],
  },
  {
    label: "고객센터",
    items: [
      { label: "FAQ", href: "/faq" },
      { label: "문의", href: "/contact" },
    ],
  },
];

/* ── Dropdown menu component ── */
function NavDropdown({ group, pathname, onNavigate }: { group: MenuGroup; pathname: string; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasActive = group.items.some(item => pathname === item.href || pathname.startsWith(item.href + "/"));

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={`flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
          hasActive ? "text-teal-600 bg-teal-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        {group.label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 pt-1.5 w-44 z-50">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-1.5">
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { setOpen(false); onNavigate?.(); }}
              className={`block px-4 py-2.5 text-[13px] transition-colors ${
                pathname === item.href
                  ? "text-teal-600 bg-teal-50 font-medium"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout } = useAuth();
  const { user, loading: userLoading, signOut: userSignOut } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isNoNavbar = NO_NAVBAR_PATHS.includes(pathname);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isNoNavbar) {
    return <>{children}</>;
  }

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#faf9f6] overflow-x-hidden">
      {/* ── Top Navigation Bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">{siteConfig.name}</span>
            </Link>

            {/* Desktop: dropdown menus */}
            <nav className="hidden md:flex items-center gap-1">
              {menuGroups.map((group) => (
                <NavDropdown key={group.label} group={group} pathname={pathname} />
              ))}
            </nav>

            {/* Right: user / login */}
            <div className="hidden md:flex items-center gap-2.5">
              {isAdmin && (
                <div className="flex items-center gap-2 mr-2">
                  <Link href="/admin" className="text-xs text-gray-400 hover:text-teal-600 transition-colors">관리자</Link>
                  <button onClick={() => logout()} className="text-xs text-red-400 hover:text-red-500">로그아웃</button>
                </div>
              )}
              {!isAdmin && (
                <button onClick={() => setShowLogin(true)} className="text-gray-300 hover:text-gray-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </button>
              )}
              {user ? (
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-teal-600">{user.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-xs text-gray-500 max-w-[100px] truncate">{user.email}</span>
                  <button onClick={() => userSignOut()} className="text-[10px] text-gray-400 hover:text-gray-600 ml-1">로그아웃</button>
                </div>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-teal-500 text-white rounded-full text-xs font-semibold hover:bg-teal-600 transition-colors">
                  로그인
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100">
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="px-5 py-4 space-y-4">
              {menuGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-[11px] font-semibold text-gray-400 tracking-wide uppercase mb-1.5 px-1">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          pathname === item.href ? "text-teal-600 bg-teal-50 font-medium" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <div className="px-5 py-3 border-t border-gray-100">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 truncate">{user.email}</span>
                  <button onClick={() => { userSignOut(); closeMenu(); }} className="text-xs text-gray-400 hover:text-gray-600">로그아웃</button>
                </div>
              ) : (
                <Link href="/login" onClick={closeMenu} className="block text-center bg-teal-500 text-white rounded-lg px-4 py-2.5 text-sm font-semibold">로그인</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="min-h-screen overflow-x-hidden pt-14 sm:pt-16">
        {children}
      </main>

      {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
