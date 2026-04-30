"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Pencil, Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { updatePlan } from "./actions";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
}

export default function EditPlanModal({ plan }: { plan: Plan }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [featureInput, setFeatureInput] = useState("");

  const [form, setForm] = useState({
    name: plan.name,
    description: plan.description,
    price: plan.price.toFixed(2).replace(".", ","),
    duration: plan.duration.toString(),
    features: [...plan.features],
    isActive: plan.isActive,
  });

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(false);
      setFeatureInput("");
      setForm({
        name: plan.name,
        description: plan.description,
        price: plan.price.toFixed(2).replace(".", ","),
        duration: plan.duration.toString(),
        features: [...plan.features],
        isActive: plan.isActive,
      });
    }
  }, [open, plan]);

  const addFeature = () => {
    const val = featureInput.trim();
    if (val && !form.features.includes(val)) {
      setForm({ ...form, features: [...form.features, val] });
      setFeatureInput("");
    }
  };

  const removeFeature = (i: number) => {
    setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updatePlan(plan.id, {
        ...form,
        price: parseFloat(form.price.replace(",", ".")),
        duration: parseInt(form.duration),
      });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setOpen(false), 1200);
      } else {
        setError(result.error || "Erro ao atualizar plano.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors text-sm"
      >
        <Pencil size={14} /> Editar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />

          <div className="relative bg-[#111] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/[0.06]">
              <div>
                <h2 className="text-xl font-black text-white">Editar Plano</h2>
                <p className="text-sm text-gray-500 mt-0.5">Atualizando: <span className="text-gold-500 font-bold">{plan.name}</span></p>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {success ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-white">Plano atualizado!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div>
                    <p className="text-sm font-bold text-white">Status do plano</p>
                    <p className="text-xs text-gray-500 mt-0.5">Planos inativos não aparecem para alunos</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      form.isActive
                        ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    }`}
                  >
                    {form.isActive ? <><ToggleRight size={18} /> Ativo</> : <><ToggleLeft size={18} /> Inativo</>}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Nome do Plano</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Valor (R$)</label>
                    <input
                      type="text"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="100,00"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Duração</label>
                    <select
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors text-sm"
                    >
                      {[1, 2, 3, 6, 12].map((m) => (
                        <option key={m} value={m}>{m} {m === 1 ? "mês" : "meses"}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Descrição</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Breve descrição do plano"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Benefícios</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                      placeholder="Adicionar benefício..."
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-2.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-500 hover:bg-gold-500/20 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {form.features.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {form.features.map((f, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-xl border border-white/[0.06] text-sm">
                          <span className="text-gray-300 flex items-center gap-2">
                            <span className="text-gold-500 text-xs">✓</span> {f}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFeature(i)}
                            className="text-red-500/60 hover:text-red-400 transition-colors ml-2 shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                    className="flex-1 py-3 rounded-xl bg-white/[0.04] text-gray-400 font-bold text-sm hover:bg-white/[0.08] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-3 rounded-xl bg-gold-500 text-dark-900 font-black text-sm hover:bg-gold-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                  >
                    {isPending ? <><Loader2 className="animate-spin" size={16} /> Salvando...</> : <><Pencil size={16} /> Salvar Alterações</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
