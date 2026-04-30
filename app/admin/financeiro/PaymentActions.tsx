"use client";

import { useTransition, useState } from "react";
import { CheckCircle, XCircle, Loader2, Eye, X } from "lucide-react";
import { approvePayment, rejectPayment, analyzeReceiptAI } from "./actions";
import { VerificationResult } from "@/lib/ai-verify";
import { ShieldCheck, ShieldAlert, Sparkles, Brain } from "lucide-react";

interface PaymentActionsProps {
  paymentId: string;
  status: string;
  receiptUrl?: string | null;
}

export default function PaymentActions({ paymentId, status, receiptUrl }: PaymentActionsProps) {
  const [isPendingApprove, startApprove] = useTransition();
  const [isPendingReject, startReject] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<VerificationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    if (receiptUrl && !aiResult && !isAnalyzing) {
      setIsAnalyzing(true);
      const res = await analyzeReceiptAI(paymentId, receiptUrl);
      if (res.success && res.result) {
        setAiResult(res.result);
      }
      setIsAnalyzing(false);
    }
  };

  const handleApprove = () => {
    if (confirm("Confirmar aprovação deste pagamento PIX?")) {
      startApprove(async () => {
        await approvePayment(paymentId);
        setIsModalOpen(false);
      });
    }
  };

  const handleReject = () => {
    if (confirm("Recusar este pagamento? O aluno será notificado.")) {
      startReject(async () => {
        await rejectPayment(paymentId);
        setIsModalOpen(false);
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {receiptUrl && (
          <button
            onClick={handleOpenModal}
            className="p-2 hover:bg-blue-500/20 text-blue-500 bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20"
            title="Ver Comprovante"
          >
            <Eye size={18} />
          </button>
        )}
        
        {status === "PENDING" && (
          <>
            <button
              onClick={handleApprove}
              disabled={isPendingApprove || isPendingReject}
              className="p-2 hover:bg-green-500/20 text-green-500 bg-green-500/10 rounded-lg transition-colors border border-green-500/20 disabled:opacity-50"
              title="Aprovar Pagamento"
            >
              {isPendingApprove ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            </button>
            <button
              onClick={handleReject}
              disabled={isPendingApprove || isPendingReject}
              className="p-2 hover:bg-red-500/20 text-red-500 bg-red-500/10 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
              title="Recusar"
            >
              {isPendingReject ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
            </button>
          </>
        )}
      </div>

      {isModalOpen && receiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-dark-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Brain className="text-gold-500" size={20} /> Análise Inteligente do Comprovante
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-black">
              {/* Image View */}
              <div className="flex-1 p-4 overflow-auto flex justify-center items-center">
                {receiptUrl.startsWith("data:application/pdf") ? (
                  <iframe src={receiptUrl} className="w-full h-full min-h-[50vh] rounded-xl bg-white" />
                ) : (
                  <img src={receiptUrl} alt="Comprovante" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" />
                )}
              </div>

              {/* AI Analysis Sidebar */}
              <div className="w-full md:w-80 bg-dark-900 border-l border-white/5 p-6 flex flex-col gap-6 overflow-y-auto">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Resultado da IA</p>
                  
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-10 bg-white/[0.02] rounded-2xl border border-white/5">
                      <Loader2 className="text-gold-500 animate-spin mb-3" size={32} />
                      <p className="text-xs text-gray-400 font-medium">Processando imagem...</p>
                    </div>
                  ) : aiResult ? (
                    <div className={`p-4 rounded-2xl border-2 flex flex-col gap-3 ${
                      aiResult.status === "REAL" 
                        ? "bg-green-500/10 border-green-500/30 text-green-500" 
                        : aiResult.status === "AGENDADO"
                        ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                        : "bg-red-500/10 border-red-500/30 text-red-500"
                    }`}>
                      <div className="flex items-center gap-2 font-black uppercase text-sm">
                        {aiResult.status === "REAL" ? <ShieldCheck /> : <ShieldAlert />}
                        {aiResult.status === "REAL" ? "Autêntico" : aiResult.status === "AGENDADO" ? "Agendado" : "Suspeito"}
                      </div>
                      <p className="text-xs font-bold leading-relaxed">{aiResult.reason}</p>
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-current transition-all duration-1000" 
                          style={{ width: `${aiResult.confidence}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-right opacity-60">Confiança: {aiResult.confidence}%</p>
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl">
                      <p className="text-xs text-gray-500 italic">Falha na análise.</p>
                    </div>
                  )}
                </div>

                {aiResult?.details && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dados Extraídos</p>
                    <div className="space-y-2">
                      <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Valor Lido</p>
                        <p className="text-sm font-black text-white">
                          {aiResult.details.amount ? `R$ ${aiResult.details.amount.toFixed(2)}` : "Não identificado"}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Data</p>
                        <p className="text-sm font-bold text-white">{aiResult.details.date || "Não identificado"}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-gold-500/60 text-[10px] font-bold uppercase">
                    <Sparkles size={12} /> Powered by Groq AI
                  </div>
                </div>
              </div>
            </div>

            {status === "PENDING" && (
              <div className="p-4 border-t border-white/5 bg-dark-800 flex justify-end gap-3">
                <button
                  onClick={handleReject}
                  disabled={isPendingApprove || isPendingReject}
                  className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isPendingReject ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />} Recusar
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isPendingApprove || isPendingReject}
                  className="px-6 py-2.5 rounded-xl bg-green-500 text-dark-900 font-bold hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isPendingApprove ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} Aprovar Pagamento
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
