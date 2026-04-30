import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Users, CreditCard, Dumbbell, TrendingUp,
  ArrowRight, CheckCircle, Clock
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import RevenueChart from "./RevenueChart";

export const dynamic = 'force-dynamic';

// --- SKELETONS ---
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/[0.03] animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-white/[0.03] rounded animate-pulse" />
            <div className="h-3 w-1/4 bg-white/[0.03] rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- DATA COMPONENTS ---
async function StatsCards({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  try {
    const [totalMembers, activeMembers, totalPaid, pendingPayments] = await Promise.all([
      prisma.member.count({ where: { user: { role: { not: "ADMIN" } } } }),
      prisma.member.count({ where: { status: "ACTIVE", user: { role: { not: "ADMIN" } } } }),
      prisma.payment.aggregate({
        where: { status: "PAID", member: { user: { role: { not: "ADMIN" } } } },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: "PENDING", member: { user: { role: { not: "ADMIN" } } } } }),
    ]);

    const revenue = totalPaid._sum.amount || 0;

    const stats = [
      { label: "Total de Alunos", value: totalMembers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", href: "/admin/alunos" },
      { label: "Alunos Ativos", value: activeMembers, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", href: "/admin/alunos" },
      ...(isSuperAdmin ? [{ label: "Receita Total", value: `R$ ${revenue.toLocaleString("pt-BR")}`, icon: CreditCard, color: "text-gold-500", bg: "bg-gold-500/10", border: "border-gold-500/20", href: "/admin/financeiro" }] : []),
      { label: "PIX Pendentes", value: pendingPayments, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", href: "/admin/financeiro" },
    ];

    return (
      <div className={`grid grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className={`relative group overflow-hidden p-6 rounded-2xl bg-[#0f0f0f] border ${stat.border} hover:scale-[1.02] transition-all duration-200`}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl md:text-3xl font-black text-white mb-1 leading-none">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <ArrowRight size={14} className={`absolute bottom-5 right-5 ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </Link>
        ))}
      </div>
    );
  } catch (error) {
    return <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">Erro ao carregar dados.</div>;
  }
}

async function RevenueSection({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  if (!isSuperAdmin) return null;

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const payments = await prisma.payment.findMany({
      where: {
        status: "PAID",
        paidAt: { gte: sixMonthsAgo },
        member: { user: { role: { not: "ADMIN" } } }
      },
      select: { amount: true, paidAt: true }
    });

    const monthsNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const chartDataMap: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthsNames[d.getMonth()]}`;
      chartDataMap[key] = 0;
    }

    payments.forEach(p => {
      if (p.paidAt) {
        const month = monthsNames[p.paidAt.getMonth()];
        if (chartDataMap[month] !== undefined) {
          chartDataMap[month] += p.amount;
        }
      }
    });

    const chartData = Object.entries(chartDataMap).map(([month, revenue]) => ({
      month,
      revenue,
      members: 0
    }));

    return (
      <div className="bg-[#0f0f0f] border border-white/[0.04] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gold-500" />
            <h2 className="font-bold text-white text-sm">Faturamento Semestral</h2>
          </div>
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Valores em R$</p>
        </div>
        <RevenueChart data={chartData} />
      </div>
    );
  } catch (error) {
    return null;
  }
}

async function ActivityFeed() {
  try {
    const [recentMembers, recentPayments] = await Promise.all([
      prisma.member.findMany({
        where: { user: { role: { not: "ADMIN" } } },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.payment.findMany({
        where: { status: "PAID", member: { user: { role: { not: "ADMIN" } } } },
        include: { member: { include: { user: true } } },
        orderBy: { paidAt: "desc" },
        take: 5,
      }),
    ]);

    const activities = [
      ...recentMembers.map(m => ({
        id: `m-${m.id}`,
        userName: m.user.name || "Aluno",
        date: m.createdAt,
        text: "entrou para o time",
        icon: Users,
        color: "text-blue-400",
        bg: "bg-blue-500/10"
      })),
      ...recentPayments.map(p => ({
        id: `p-${p.id}`,
        userName: p.member.user.name || "Aluno",
        date: p.paidAt || p.createdAt,
        text: `confirmou pagamento de mensalidade`,
        icon: CreditCard,
        color: "text-gold-500",
        bg: "bg-gold-500/10"
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

    return (
      <div className="divide-y divide-white/[0.04]">
        {activities.map((act) => (
          <div key={act.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.01] transition-colors">
            <div className={`w-8 h-8 rounded-lg ${act.bg} ${act.color} flex items-center justify-center shrink-0`}>
              <act.icon size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white font-medium truncate">
                <span className="font-bold">{act.userName}</span> {act.text}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {new Date(act.date).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return <div className="p-10 text-center text-gray-500 text-xs italic">Erro no feed.</div>;
  }
}

async function PendingPaymentsList() {
  try {
    const pendingPayments = await prisma.payment.findMany({
      where: { status: "PENDING", member: { user: { role: { not: "ADMIN" } } } },
      include: { member: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    return (
      <div className="divide-y divide-white/[0.04]">
        {pendingPayments.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">Tudo em dia!</div>
        ) : (
          pendingPayments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-6 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{p.member.user.name}</p>
                <p className="text-xs text-yellow-500 font-medium">PIX Pendente</p>
              </div>
              <Link href="/admin/financeiro" className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">
                Analisar
              </Link>
            </div>
          ))
        )}
      </div>
    );
  } catch (error) {
    return null;
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user?.email === "ciellodev@gmail.com";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{greeting} 👋</p>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">Visão Geral</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link href="/admin/alunos" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-dark-900 font-bold text-sm">
          <Users size={16} /> Gerenciar Alunos
        </Link>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards isSuperAdmin={isSuperAdmin} />
      </Suspense>

      <Suspense fallback={<div className="h-80 rounded-2xl bg-white/[0.03] animate-pulse" />}>
        <RevenueSection isSuperAdmin={isSuperAdmin} />
      </Suspense>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-[#0f0f0f] border border-white/[0.04] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between">
            <h2 className="font-bold text-white text-sm">Atividades do Time</h2>
          </div>
          <Suspense fallback={<ListSkeleton />}>
            <ActivityFeed />
          </Suspense>
        </div>

        <div className="lg:col-span-2 bg-[#0f0f0f] border border-white/[0.04] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between">
            <h2 className="font-bold text-white text-sm">PIX Pendentes</h2>
            <Link href="/admin/financeiro" className="text-xs text-gray-500 flex items-center gap-1">Analisar <ArrowRight size={12} /></Link>
          </div>
          <Suspense fallback={<ListSkeleton />}>
            <PendingPaymentsList />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/admin/alunos", label: "Novo Aluno", icon: Users, color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/10" },
          { href: "/admin/planos", label: "Novo Plano", icon: Dumbbell, color: "text-green-400", bg: "bg-green-500/5 border-green-500/10" },
          { href: "/admin/financeiro", label: "Financeiro", icon: CreditCard, color: "text-gold-500", bg: "bg-gold-500/5 border-gold-500/10" },
          { href: "/", label: "Ver Site", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/5 border-purple-500/10" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${item.bg} group transition-all hover:bg-white/[0.02]`}>
            <item.icon size={18} className={`${item.color} shrink-0`} />
            <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
