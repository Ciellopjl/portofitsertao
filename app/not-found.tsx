import Link from "next/link";
import { Dumbbell, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-8">
        <p className="text-[12rem] font-black text-white/5 leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo-porto.png" alt="PortoFit" className="w-20 h-20 object-contain mx-auto drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]" />
        </div>
      </div>
      <h1 className="text-4xl font-black text-white mb-4">Página não encontrada</h1>
      <p className="text-gray-400 text-lg mb-10 max-w-md">
        Parece que você se perdeu no treino. Essa página não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gold-500 text-dark-900 font-black text-lg hover:bg-gold-400 transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)]"
      >
        <Home size={20} />
        Voltar ao início
      </Link>
    </div>
  );
}
