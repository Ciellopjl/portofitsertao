"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gold-500 font-bold tracking-widest text-xs uppercase">Carregando PortoFit...</p>
    </div>
  );
}
