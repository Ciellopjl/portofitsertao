"use client";

import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LogOut, CreditCard, CheckCircle2, XCircle, Clock,
  QrCode, User, AlertTriangle, Dumbbell, ChevronRight, ArrowLeft, Home, Activity, CalendarDays, Award
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import PixPaymentModal from "@/components/PixPaymentModal";

interface Payment {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
}

interface Props {
  user: { name: string; email: string; image: string | null };
  member: {
    id: string;
    studentCode: string;
    status: string;
    planExpiresAt: string | null;
    plan: { id: string; name: string; price: number } | null;
    payments: Payment[];
  };
  plans?: { id: string; name: string; price: number; duration: number; features: string[] }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE: { label: "Ativo", color: "green", icon: <CheckCircle2 size={16} /> },
  PENDING: { label: "Pendente", color: "yellow", icon: <AlertTriangle size={16} /> },
  INACTIVE: { label: "Inativo", color: "red", icon: <XCircle size={16} /> },
};

export default function StudentDashboardClient({ user, member, plans = [] }: Props) {
  const [showQR, setShowQR] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number } | null>(null);
  const status = statusConfig[member.status] || statusConfig.INACTIVE;

  const daysLeft = useMemo(() => {
    if (!member.planExpiresAt) return null;
    return Math.ceil((new Date(member.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, [member.planExpiresAt]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-dark-900 pb-12">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} />
              </div>
              <span className="font-medium hidden sm:block">Página Inicial</span>
            </Link>
            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <img src="/logo-porto.png" alt="PortoFit" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
              <span className="font-black text-white text-lg tracking-tighter hidden md:block">PORTOFIT <span className="text-gold-500">SERTÃO</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5">
              {user.image ? (
                <img src={user.image} alt="" className="w-8 h-8 rounded-full border-2 border-gold-500/50" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                  <User size={16} className="text-gold-500" />
                </div>
              )}
              <span className="hidden md:block text-sm font-bold text-white">{user.name}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-4 py-8 space-y-6"
      >
        {/* Banner Novidade */}
        <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-gold-500/20 to-orange-500/20 border border-gold-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-500 rounded-lg text-dark-900">
              <Dumbbell size={20} />
            </div>
            <div>
              <p className="text-white font-bold">Novidade na Academia!</p>
              <p className="text-gray-300 text-sm">Chegou a nova linha de suplementos com descontos exclusivos para alunos ativos.</p>
            </div>
          </div>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-dark-800 via-dark-800 to-dark-900 border border-white/5 p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1 tracking-wider uppercase">Painel do Aluno</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{user.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-gold-500 font-bold bg-gold-500/10 border border-gold-500/20 px-4 py-1.5 rounded-xl text-sm">
                  #{member.studentCode}
                </span>
                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold border ${
                  status.color === "green" ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]" :
                  status.color === "yellow" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                  "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                }`}>
                  {status.icon} {status.label}
                </span>
              </div>
            </div>

            {/* QR Code toggle */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex flex-col items-center justify-center gap-3 w-32 h-32 rounded-3xl bg-dark-900 border border-white/10 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all group shadow-xl"
            >
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-gold-500/20 transition-colors">
                <QrCode className="text-gold-500" size={32} />
              </div>
              <span className="text-xs text-gray-300 font-bold text-center leading-tight">
                {showQR ? "Ocultar" : "QR Code\nEntrada"}
              </span>
            </button>
          </div>

          {/* QR Code expanded */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="relative z-10 mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4"
            >
              <p className="text-gray-400 text-sm text-center bg-dark-900/50 px-4 py-2 rounded-full border border-white/5">
                Aproxime do leitor na catraca para liberar o acesso
              </p>
              <div className="bg-white p-6 rounded-[2rem] shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                <QRCodeSVG
                  value={`PORTOFIT-${member.studentCode}-${member.id}`}
                  size={220}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="H"
                />
              </div>
              <p className="font-mono text-3xl font-black text-white tracking-widest mt-2">{member.studentCode}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Meu Treino", icon: <Activity size={24} />, link: "/aluno/treino", color: "text-blue-400", bg: "bg-blue-400/10" },
            { title: "Avaliação Física", icon: <User size={24} />, comingSoon: true, color: "text-purple-400", bg: "bg-purple-400/10" },
            { title: "Aulas Extras", icon: <CalendarDays size={24} />, comingSoon: true, color: "text-pink-400", bg: "bg-pink-400/10" },
            { title: "Suporte", icon: <AlertTriangle size={24} />, link: "https://wa.me/5582987894552", color: "text-green-400", bg: "bg-green-400/10" }
          ].map((action, i) => (
            <motion.div key={i} variants={itemVariants}>
              {action.link ? (
                <Link href={action.link} className="flex flex-col items-center justify-center p-6 bg-dark-800 border border-white/5 rounded-3xl hover:bg-dark-800/80 transition-colors gap-4 h-full">
                  <div className={`p-4 rounded-2xl ${action.bg}`}>{action.icon}</div>
                  <span className="font-bold text-sm text-white text-center">{action.title}</span>
                </Link>
              ) : (
                <div className="relative flex flex-col items-center justify-center p-6 bg-dark-800/50 border border-white/5 rounded-3xl opacity-60 cursor-not-allowed gap-4 h-full">
                  <div className={`p-4 rounded-2xl ${action.bg}`}>{action.icon}</div>
                  <span className="font-bold text-sm text-white text-center">{action.title}</span>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest">Breve</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Plan Card */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-dark-800 border border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            {member.plan && daysLeft !== null && daysLeft <= 5 && (
              <div className="absolute top-0 inset-x-0 h-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            )}
            
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <div className="p-2 bg-gold-500/20 rounded-xl"><CreditCard className="text-gold-500" size={24} /></div> 
              Assinatura Atual
            </h2>

            {member.plan ? (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider font-bold">Plano Ativo</p>
                    <p className="text-4xl font-black text-white mb-2">{member.plan.name}</p>
                    <p className="text-gold-500 font-black text-xl">R$ {member.plan.price.toFixed(2).replace(".", ",")} <span className="text-sm text-gray-400 font-medium">/mês</span></p>
                  </div>
                  {daysLeft !== null && (
                    <div className={`flex items-center gap-4 px-6 py-4 rounded-3xl border ${daysLeft <= 5 ? 'bg-red-500/10 border-red-500/30' : 'bg-dark-900 border-white/5'}`}>
                      <div className="flex flex-col items-center">
                        <p className={`text-5xl font-black leading-none ${daysLeft <= 5 ? 'text-red-400' : 'text-white'}`}>{daysLeft}</p>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">Dias Restantes</p>
                      </div>
                      {daysLeft <= 5 && <AlertTriangle className="text-red-500 animate-pulse" size={32} />}
                    </div>
                  )}
                </div>

                {member.planExpiresAt && (
                  <div className="flex items-center gap-4 p-5 bg-dark-900 rounded-3xl border border-white/5 mb-8">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <Clock className="text-gray-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Data de Vencimento</p>
                      <p className="text-white font-bold text-lg">{new Date(member.planExpiresAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedPlan({ id: member.plan!.id, name: member.plan!.name, price: member.plan!.price })}
                  className="w-full flex justify-center items-center gap-3 py-5 rounded-2xl bg-gold-500 text-dark-900 font-black text-lg hover:bg-gold-400 transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] hover:-translate-y-1"
                >
                  <QrCode size={24} /> Renovar via PIX Agora
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-8 p-8 bg-dark-900 rounded-3xl border border-white/5">
                  <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-yellow-500" size={36} />
                  </div>
                  <p className="text-white font-black text-2xl mb-3">Nenhum plano ativo</p>
                  <p className="text-gray-400">Para liberar seu acesso na catraca, escolha um dos planos abaixo e realize o pagamento via PIX. A liberação é imediata após a aprovação.</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {plans.map(p => (
                    <div key={p.id} className="bg-dark-900 border border-white/5 rounded-3xl p-6 hover:border-gold-500/50 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl group-hover:bg-gold-500/10 transition-colors"></div>
                      <div className="relative z-10">
                        <h3 className="font-black text-white text-xl mb-1">{p.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">{p.duration} {p.duration === 1 ? 'mês' : 'meses'} de acesso</p>
                        <div className="flex justify-between items-end mb-6">
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Valor</p>
                            <span className="font-black text-gold-500 text-2xl">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedPlan({ id: p.id, name: p.name, price: p.price })}
                          className="w-full py-3.5 rounded-xl bg-gold-500/10 text-gold-500 font-black text-sm border border-gold-500/20 hover:bg-gold-500 hover:text-dark-900 transition-colors flex items-center justify-center gap-2 group-hover:bg-gold-500 group-hover:text-dark-900"
                        >
                          Assinar <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Stats Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-dark-800 border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
                <Award className="text-gold-500" size={20} /> Suas Conquistas
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="text-green-500" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Pagamentos Realizados</p>
                    <p className="text-2xl font-black text-white">{member.payments.filter(p => p.status === "PAID").length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                    <Dumbbell className="text-gold-500" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Investido</p>
                    <p className="text-2xl font-black text-white">R$ {member.payments.filter(p => p.status === "PAID").reduce((a, p) => a + p.amount, 0).toFixed(2).replace(".", ",")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 border border-white/5 rounded-[2.5rem] p-8 text-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-dark-900 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🙋‍♂️</span>
                </div>
                <h4 className="font-bold text-white text-lg mb-2">Precisa de Ajuda?</h4>
                <p className="text-sm text-gray-400 mb-6">Nossa equipe de suporte está pronta para te atender.</p>
                <a
                  href="https://wa.me/5582987894552"
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-green-500/10 text-green-500 font-black border border-green-500/20 hover:bg-green-500 hover:text-dark-900 transition-all"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Payment History */}
        {member.payments.length > 0 && (
          <motion.div variants={itemVariants} className="bg-dark-800 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl mt-6">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl"><Clock size={20} className="text-gray-400" /></div>
                Histórico de Transações
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {member.payments.map((payment) => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/[0.02] transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                      payment.status === "PAID" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      payment.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                      {payment.status === "PAID" ? <CheckCircle2 size={24} /> :
                       payment.status === "PENDING" ? <Clock size={24} /> :
                       <XCircle size={24} />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">{member.plan?.name || "Mensalidade"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-medium">{new Date(payment.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span className="text-xs font-bold text-gray-400">{payment.method}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-white/5">
                    <p className="font-black text-white text-lg">R$ {payment.amount.toFixed(2).replace(".", ",")}</p>
                    <div className={`mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      payment.status === "PAID" ? "bg-green-500/10 text-green-500" :
                      payment.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                    }`}>
                      {payment.status === "PAID" ? "Confirmado" : payment.status === "PENDING" ? "Aguardando Aprovação" : "Cancelado"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </motion.div>

      {selectedPlan && (
        <PixPaymentModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          amount={selectedPlan.price}
          memberId={member.id}
        />
      )}
    </div>
  );
}
