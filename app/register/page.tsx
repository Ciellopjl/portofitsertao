"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dumbbell, Mail, Lock, User, Loader2, Phone } from "lucide-react";
import Link from "next/link";
import { registerUser } from "./actions";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await registerUser(formData);

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      // Auto login after register
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!loginRes?.error) {
        router.push("/aluno/dashboard");
      } else {
        router.push("/login");
      }
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
          
          <h1 className="text-2xl font-black mb-2 text-white relative z-10">Cadastre-se</h1>
          <p className="text-sm text-gray-400 mb-8 relative z-10">Crie sua conta para acessar os planos e treinos.</p>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Nome Completo"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="Seu e-mail"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  name="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="Seu WhatsApp (ex: 82 99999-8888)"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  name="password"
                  required
                  minLength={6}
                  placeholder="Crie uma senha (mínimo 6 chars)"
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
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Criar Conta"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8 relative z-10">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-gold-500 hover:text-gold-400 font-bold">
              Faça login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
