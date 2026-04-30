"use client";

import { useState, useTransition, useEffect } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { createAluno } from "./actions";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface NovoAlunoModalProps {
  plans: Plan[];
}

export default function NovoAlunoModal({ plans }: NovoAlunoModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(false);
      setForm({ name: "", email: "", phone: "", planId: "", status: "ACTIVE" });
    }
  }, [open]);

  const formatPhone = (value: string) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      return `(${value.slice(0, 2)}`;
    }
    return value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createAluno(form);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setOpen(false), 1500);
      } else {
        setError(result.error || "Erro ao criar aluno.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-dark-900 font-bold rounded-xl hover:bg-gold-400 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]"
      >
        <UserPlus size={20} /> Novo Aluno
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="relative bg-dark-800 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white">Novo Aluno</h2>
                <p className="text-sm text-gray-400 mt-1">Cadastre um aluno manualmente no sistema</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="w-10 h-10 rounded-full bg-dark-700 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-white">Aluno cadastrado!</p>
                <p className="text-gray-400 mt-2 text-sm">O aluno foi criado com sucesso no sistema.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="joao@email.com"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Telefone (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                    placeholder="(82) 99999-8888"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Formato: (DDD) 9XXXX-XXXX</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Plano</label>
                  <select
                    value={form.planId}
                    onChange={(e) => setForm({ ...form, planId: e.target.value })}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none"
                  >
                    <option value="">Sem Plano</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — R$ {p.price.toFixed(2).replace(".", ",")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Status Inicial</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "ACTIVE", label: "Ativo", color: "green" },
                      { value: "PENDING", label: "Pendente", color: "yellow" },
                      { value: "INACTIVE", label: "Inativo", color: "red" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, status: opt.value })}
                        className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                          form.status === opt.value
                            ? opt.color === "green"
                              ? "bg-green-500/10 border-green-500/50 text-green-500"
                              : opt.color === "yellow"
                              ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500"
                              : "bg-red-500/10 border-red-500/50 text-red-500"
                            : "bg-dark-900 border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 rounded-xl bg-gold-500 text-dark-900 font-black text-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} /> Cadastrar Aluno
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
