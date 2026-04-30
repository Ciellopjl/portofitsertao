"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, ShieldCheck, ShieldAlert, User, ArrowLeft } from "lucide-react";
import { recordCheckIn } from "../alunos/actions";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<{ success: boolean; studentName?: string | null; error?: string; planName?: string } | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [isScanning]);

  async function onScanSuccess(decodedText: string) {
    if (scannerRef.current) {
      setIsScanning(false);
      await scannerRef.current.clear();
    }

    const result = await recordCheckIn(decodedText);
    setScanResult(result);

    // Auto-reset após 5 segundos
    setTimeout(() => {
      setScanResult(null);
      setIsScanning(true);
    }, 5000);
  }

  function onScanError(err: any) {
    // Silencioso para não poluir o console durante a busca
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <QrCode className="text-gold-500" /> SCANNER <span className="text-gold-500">ENTRADA</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Aproxime o QR Code do aluno para validar o acesso.</p>
          </div>
          <Link href="/admin/dashboard" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400">
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="relative aspect-square max-w-md mx-auto overflow-hidden rounded-[2.5rem] border-2 border-white/5 bg-[#0c0c0c] shadow-2xl">
          {isScanning ? (
            <div id="reader" className="w-full h-full overflow-hidden"></div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-dark-800">
              <div className="animate-spin w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full"></div>
            </div>
          )}

          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md ${
                  scanResult.success ? "bg-green-500/90" : "bg-red-500/90"
                }`}
              >
                {scanResult.success ? (
                  <ShieldCheck size={80} className="text-white mb-6" />
                ) : (
                  <ShieldAlert size={80} className="text-white mb-6" />
                )}
                
                <h2 className="text-3xl font-black text-white mb-2">
                  {scanResult.success ? "ACESSO LIBERADO" : "ACESSO NEGADO"}
                </h2>
                
                <div className="bg-black/20 p-4 rounded-2xl w-full max-w-xs space-y-1">
                  <p className="text-white font-bold text-lg">{scanResult.studentName || "Desconhecido"}</p>
                  {scanResult.success && <p className="text-white/80 text-sm font-medium">Plano: {scanResult.planName}</p>}
                  {scanResult.error && <p className="text-white/80 text-sm font-medium">{scanResult.error}</p>}
                </div>

                <button
                  onClick={() => { setScanResult(null); setIsScanning(true); }}
                  className="mt-8 px-8 py-3 bg-white text-black font-black rounded-xl hover:scale-105 transition-transform"
                >
                  PRÓXIMO ALUNO
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Dica de Uso</p>
            <p className="text-sm text-gray-300">Certifique-se de que há iluminação suficiente para a leitura.</p>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Status Sistema</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-sm text-gray-300 font-bold">Operacional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
