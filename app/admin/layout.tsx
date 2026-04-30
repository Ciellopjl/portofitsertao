"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, CreditCard, Dumbbell,
  LogOut, ChevronRight, Menu, X, Bell, Settings, QrCode, ShieldCheck, Scan
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { getNotifications, markAllNotificationsAsRead } from "./alunos/actions";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Visão geral" },
  { href: "/admin/checkin", label: "Check-in", icon: Scan, desc: "Entrada de alunos" },
  { href: "/admin/alunos", label: "Alunos", icon: Users, desc: "Gerencie membros" },
  { href: "/admin/liberacao", label: "Acessos", icon: ShieldCheck, desc: "Whitelist de Gmail" },
  { href: "/admin/planos", label: "Planos", icon: Dumbbell, desc: "Preços e planos" },
  { href: "/admin/financeiro", label: "Financeiro", icon: CreditCard, desc: "Pagamentos & PIX" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any>({ recentMembers: [], recentPayments: [] });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      const res = await getNotifications();
      if (res.success) setNotifications(res.notifications);
    }
    loadNotifications();
    // Refresh a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async () => {
    const res = await markAllNotificationsAsRead();
    if (res.success) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") router.push("/aluno/dashboard");
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  const currentPage = links.find(l => pathname?.startsWith(l.href));

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-72 flex flex-col
        bg-[#0c0c0c] border-r border-white/[0.04]
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.04]">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-500 blur-lg opacity-0 group-hover:opacity-30 transition-opacity rounded-full" />
              <img src="/logo-porto.png" alt="PortoFit" className="w-8 h-8 object-contain relative z-10" />
            </div>
            <div>
              <p className="font-black text-white text-sm tracking-wider leading-none">PORTOFIT</p>
              <p className="text-[10px] font-bold text-gold-500 tracking-widest">ADMIN PANEL</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User card */}
        <div className="mx-4 mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="relative">
              {session?.user?.image && !imgError ? (
                <img 
                  src={session.user.image} 
                  alt="" 
                  className="w-10 h-10 rounded-full border-2 border-gold-500/40 object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border-2 border-gold-500/30 flex items-center justify-center text-gold-500 font-black">
                  {session?.user?.name?.charAt(0) || "A"}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0c0c0c]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{session?.user?.name || "Admin"}</p>
              <p className="text-xs text-gold-500 font-medium">Administrador</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 mt-6 space-y-1">
          <p className="px-3 mb-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Menu Principal</p>
          {links
            .filter(link => {
              if (link.href === "/admin/liberacao") {
                return session?.user?.email === "ciellodev@gmail.com";
              }
              return true;
            })
            .map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gold-500/10 text-gold-500"
                    : "text-gray-500 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gold-500 rounded-r-full" />
                )}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? "bg-gold-500/15" : "bg-white/[0.03] group-hover:bg-white/[0.07]"
                }`}>
                  <link.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-none mb-0.5">{link.label}</p>
                  <p className={`text-[10px] leading-none truncate ${isActive ? "text-gold-500/60" : "text-gray-600"}`}>{link.desc}</p>
                </div>
                {isActive && <ChevronRight size={14} className="shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Divider & Actions */}
        <div className="p-4 border-t border-white/[0.04] space-y-1">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-white/[0.05] hover:text-white transition-all duration-200 group font-medium text-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.03] group-hover:bg-white/[0.07] flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            Página Institucional
          </Link>
          
          <div className="pt-4 mt-2 border-t border-white/[0.05]">
            <div className="px-4 py-3 bg-white/[0.02] rounded-2xl border border-white/5 mb-2">
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center">Desenvolvido por</p>
              <a href="https://ciello-dev.vercel.app/" target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-black text-gold-500/60 hover:text-gold-500 transition-colors mt-0.5">
                ciello dev 👨‍💻
              </a>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group font-medium text-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-white/[0.03] group-hover:bg-red-500/10 flex items-center justify-center transition-colors">
                <LogOut size={18} />
              </div>
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#0c0c0c] border-b border-white/[0.04] shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm font-black text-white">{currentPage?.label || "Admin"}</h1>
              <p className="text-[10px] text-gray-500">{currentPage?.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#0c0c0c]">
                  {notifications.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setNotificationsOpen(false)}
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-12 right-0 w-80 z-50 bg-[#0c0c0c] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-2"
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-white uppercase tracking-widest">Notificações</p>
                        {notifications.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-500 text-[10px] font-bold">
                            {notifications.length} novas
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <button 
                            onClick={handleMarkAsRead}
                            className="text-[10px] font-bold text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-tighter"
                          >
                            Limpar Tudo
                          </button>
                        )}
                        <button onClick={() => setNotificationsOpen(false)} className="text-gray-500 hover:text-white">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
                      {notifications.length > 0 ? (
                        <>
                          <p className="px-3 py-2 text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Novidades no sistema</p>
                          {notifications.map((notif: any) => (
                            <div key={notif.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0">
                                {notif.type === 'SYSTEM' ? <Users size={14} /> : <CreditCard size={14} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white leading-tight truncate">{notif.title}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                <p className="text-[9px] text-gray-600 mt-1">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                          <div className="w-12 h-12 rounded-full bg-white/[0.02] flex items-center justify-center text-gray-700 mb-4">
                            <Bell size={24} />
                          </div>
                          <p className="text-xs font-bold text-white mb-1">Tudo em dia!</p>
                          <p className="text-[10px] text-gray-500">Você não tem novas notificações no momento.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
