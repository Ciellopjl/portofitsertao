"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      if ((session?.user as any)?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/aluno/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Voltar ao site
        </Link>

        <div className="bg-[#111] rounded-3xl p-8 md:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden">
          
          <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-lg relative z-10 p-2">
            <img src="/logo-porto.png" alt="PortoFit" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-2xl font-black mb-2 text-white relative z-10 tracking-tight">Painel Administrativo</h1>
          <p className="text-sm text-gray-400 mb-8 relative z-10">Acesso restrito para gestão da PortoFit.</p>

          <div className="space-y-6 relative z-10">
            <button 
              onClick={() => {
                setIsLoading(true);
                signIn("google");
              }}
              disabled={isLoading}
              className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Entrar com Google Admin
                </>
              )}
            </button>

            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
              <p className="text-[10px] text-red-400/80 font-bold uppercase tracking-widest text-center leading-relaxed">
                Atenção: Acesso permitido apenas para e-mails autorizados da diretoria PortoFit.
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
