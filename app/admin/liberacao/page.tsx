"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Plus, Trash2, Mail, 
  UserPlus, Search, Loader2, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAuthorizedAdmins, 
  authorizeEmail, 
  removeAuthorization 
} from "./actions";

export default function LiberacaoPage() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    // BLOQUEIO DEFINITIVO: Apenas o dono pode ver esta página
    if (status === "authenticated" && session?.user?.email !== "ciellodev@gmail.com") {
      router.push("/admin/dashboard");
      return;
    }
    loadEmails();
  }, [status, session]);

  async function loadEmails() {
    const res = await getAuthorizedAdmins();
    if (res.success) setEmails(res.data || []);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newEmail || !newEmail.includes("@")) {
      alert("Insira um Gmail válido.");
      return;
    }
    setSubmitting(true);
    const res = await authorizeEmail(newEmail, newName);
    setSubmitting(false);
    
    if (res.success) {
      setNewEmail("");
      setNewName("");
      loadEmails();
    } else {
      alert(res.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover este acesso?")) return;
    const res = await removeAuthorization(id);
    if (res.success) loadEmails();
  }

  const filteredEmails = emails.filter(e => 
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.name && e.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-gold-500" size={32} />
            Controle de Acessos
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Libere ou remova o acesso administrativo por Gmail.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar e-mail ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-gold-500/50 w-full md:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Adição */}
        <div className="lg:col-span-1">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                <UserPlus size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Novo Acesso</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">E-mail Gmail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email"
                    placeholder="funcionario@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Nome do funcionário"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all"
                />
              </div>

              <button 
                onClick={handleAdd}
                disabled={submitting}
                className="w-full bg-gold-500 text-dark-900 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gold-400 transition-all shadow-lg disabled:opacity-50 mt-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Autorizar E-mail</>}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-3">
              <AlertCircle size={18} className="text-gray-500 shrink-0" />
              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                O funcionário deve usar o botão "Entrar com Google" na página de login administrativo com este e-mail exato.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Autorizados */}
        <div className="lg:col-span-2">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <p className="text-xs font-black text-white uppercase tracking-widest">E-mails Autorizados</p>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-gray-400">
                {filteredEmails.length} no total
              </span>
            </div>

            <div className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="p-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-gold-500" size={32} />
                    <p className="text-gray-500 font-medium text-sm">Carregando whitelist...</p>
                  </div>
                ) : filteredEmails.length > 0 ? (
                  filteredEmails.map((item, idx) => {
                    const isOnline = item.lastSeen && (new Date().getTime() - new Date(item.lastSeen).getTime() < 5 * 60 * 1000);
                    
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={item.id}
                        className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-gold-500/30 transition-all shadow-lg">
                              {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Mail size={20} className="text-gray-400" />
                              )}
                            </div>
                            {isOnline && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#0c0c0c] animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-white leading-none">{item.name || "Sem Nome"}</p>
                              {isOnline && (
                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-1.5 py-0.5 rounded-md">Online</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-medium">{item.email}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-3 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center text-gray-800 mx-auto mb-4 border border-white/5">
                      <ShieldCheck size={32} />
                    </div>
                    <p className="text-white font-bold mb-1">Nenhum funcionário extra</p>
                    <p className="text-xs text-gray-500">Apenas você (ciellodev@gmail.com) tem acesso no momento.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
