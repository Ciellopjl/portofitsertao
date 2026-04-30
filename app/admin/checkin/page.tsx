"use client";

import { useState, useRef, useEffect } from "react";
import { recordCheckIn } from "./actions";
import { 
  Users, CheckCircle2, AlertCircle, 
  Clock, ShieldAlert, Loader2, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckInPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca no input automaticamente ao carregar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Limpa o resultado após 5 segundos
  useEffect(() => {
    if (result || error) {
      const timer = setTimeout(() => {
        setResult(null);
        setError(null);
        setCode("");
        inputRef.current?.focus();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [result, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await recordCheckIn(code);
    setLoading(false);

    if (res.success) {
      setResult(res.student);
      setCode("");
    } else {
      setError(res.error || "Erro desconhecido");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="w-20 h-20 bg-gold-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold-500/20">
            <Users className="text-gold-500" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white">Check-in</h1>
          <p className="text-gray-500 mt-2">Digite seu código de 4 dígitos para entrar.</p>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="0000"
            className="w-full bg-white/[0.03] border-2 border-white/10 rounded-[2.5rem] py-8 text-center text-6xl font-black text-white tracking-[1rem] focus:outline-none focus:border-gold-500 transition-all placeholder:text-white/5"
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <Loader2 className="text-gold-500 animate-spin" size={32} />
            </div>
          )}
        </form>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className={`p-8 rounded-[3rem] border-2 shadow-2xl ${
                result.isExpired 
                  ? "bg-red-500/10 border-red-500/30" 
                  : result.isNearExpiration 
                  ? "bg-yellow-500/10 border-yellow-500/30" 
                  : "bg-green-500/10 border-green-500/30"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden bg-dark-800">
                  {result.image ? (
                    <img src={result.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-700">
                      {result.name?.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">{result.name}</h2>
                  <p className="text-gray-400 font-medium">{result.plan}</p>
                </div>

                <div className="flex flex-col gap-2 w-full mt-4">
                  {result.isExpired ? (
                    <div className="flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-2xl font-black uppercase text-sm animate-bounce">
                      <ShieldAlert size={18} /> Plano Vencido
                    </div>
                  ) : result.isNearExpiration ? (
                    <div className="flex items-center justify-center gap-2 py-3 bg-yellow-500 text-dark-900 rounded-2xl font-black uppercase text-sm">
                      <Clock size={18} /> Vence dia {result.expiresAt}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-2xl font-black uppercase text-sm">
                      <CheckCircle2 size={18} /> Acesso Liberado
                    </div>
                  )}
                </div>

                {!result.isExpired && (
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-4">
                    Bom treino, campeão! 💪
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500"
            >
              <AlertCircle size={24} className="shrink-0" />
              <p className="font-bold text-sm text-left">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-12 grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Dica</p>
            <p className="text-xs text-gray-500">Mantenha esta tela aberta no balcão da recepção.</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Auto-foco</p>
            <p className="text-xs text-gray-500">O cursor volta sozinho após cada check-in.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
