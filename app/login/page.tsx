"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/aluno/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gold-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#0f0f0f] rounded-3xl p-8 md:p-10 border border-white/[0.04] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-lg relative z-10 p-2">
            <img src="/logo-porto.png" alt="PortoFit" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-2xl font-black mb-2 text-white relative z-10">Acesse sua Conta</h1>
          <p className="text-sm text-gray-400 mb-8 relative z-10">Insira suas credenciais para entrar no painel.</p>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold-500 text-dark-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gold-400 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.15)] disabled:opacity-50 mt-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Entrar no Painel"}
            </button>
          </form>


          <p className="text-center text-sm text-gray-500 mt-8 relative z-10">
            Ainda não é aluno?{" "}
            <Link href="/register" className="text-gold-500 hover:text-gold-400 font-bold">
              Cadastre-se
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
