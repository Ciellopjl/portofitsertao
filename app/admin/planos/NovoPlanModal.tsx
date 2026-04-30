"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Plus, Loader2, Trash2 } from "lucide-react";
import { createPlan } from "./actions";

export default function NovoPlanoModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [featureInput, setFeatureInput] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "1",
    features: [] as string[],
  });

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(false);
      setForm({ name: "", description: "", price: "", duration: "1", features: [] });
      setFeatureInput("");
    }
  }, [open]);

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
      const result = await createPlan({
        ...form,
        price: parseFloat(form.price.replace(",", ".")),
        duration: parseInt(form.duration),
      });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setOpen(false), 1500);
      } else {
        setError(result.error || "Erro ao criar plano.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-dark-900 font-bold rounded-xl hover:bg-gold-400 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.2)]"
      >
        <Plus size={20} /> Novo Plano
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />
          <div className="relative bg-dark-800 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg p-8 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white">Novo Plano</h2>
                <p className="text-sm text-gray-400 mt-1">Configure os detalhes do plano</p>
              </div>
              <button onClick={() => setOpen(false)} disabled={isPending} className="w-10 h-10 rounded-full bg-dark-700 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
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
                <p className="text-xl font-bold text-white">Plano criado!</p>
                <p className="text-gray-400 mt-2 text-sm">O plano foi adicionado com sucesso.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-300 mb-2">Nome do Plano</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Mensal, Anual..." className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Valor (R$)</label>
                    <input type="text" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="100,00" className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Duração (meses)</label>
                    <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors">
                      {[1, 2, 3, 6, 12].map((m: number) => <option key={m} value={m}>{m} {m === 1 ? "mês" : "meses"}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-300 mb-2">Descrição</label>
                    <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição do plano" className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Benefícios</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); }}}
                      placeholder="Ex: Acesso livre, Avaliação física..."
                      className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                    <button type="button" onClick={addFeature} className="px-4 py-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-500 hover:bg-gold-500/20 transition-colors font-bold">
                      <Plus size={18} />
                    </button>
                  </div>
                  {form.features.length > 0 && (
                    <div className="space-y-2">
                      {form.features.map((f, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2 bg-dark-900 rounded-xl border border-white/5 text-sm text-gray-300">
                          <span>✓ {f}</span>
                          <button type="button" onClick={() => removeFeature(i)} className="text-red-500 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">{error}</div>}

                <button type="submit" disabled={isPending} className="w-full py-4 rounded-xl bg-gold-500 text-dark-900 font-black text-lg hover:bg-gold-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-3">
                  {isPending ? <><Loader2 className="animate-spin" size={20} /> Criando...</> : <><Plus size={20} /> Criar Plano</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
