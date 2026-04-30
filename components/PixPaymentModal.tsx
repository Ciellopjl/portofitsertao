"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getPixData, processCheckout } from "@/app/aluno/dashboard/actions";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  memberId: string;
  amount: number;
}

export default function PixPaymentModal({ isOpen, onClose, planId, planName, memberId, amount }: PixPaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isCopied, setIsCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  
  const [pixCode, setPixCode] = useState<string>("");
  const [isLoadingPix, setIsLoadingPix] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && !pixCode && !isLoadingPix) {
      const fetchPix = async () => {
        setIsLoadingPix(true);
        try {
          const res = await getPixData(amount, memberId);
          if (isMounted) {
            setPixCode(res.payload);
            setIsLoadingPix(false);
          }
        } catch (error) {
          if (isMounted) setIsLoadingPix(false);
        }
      };
      fetchPix();
    }
    return () => { isMounted = false; };
  }, [isOpen, amount, memberId, pixCode, isLoadingPix]);

  useEffect(() => {
    if (!isOpen || isExpired || isPaid || isPendingApproval) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isExpired, isPaid, isPendingApproval]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTimeLeft(600);
        setIsExpired(false);
        setIsCopied(false);
        setIsPendingApproval(false);
        setIsPaid(false);
        setReceipt(null);
        setPixCode("");
      }, 0);
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("O arquivo deve ter no máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceipt(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReceipt = async () => {
    if (!receipt) return;
    setIsUploading(true);
    
    try {
      const res = await processCheckout(planId, memberId, amount, receipt);
      if (res.success) {
        setIsPendingApproval(true);
      } else {
        alert(res.error || "Erro ao enviar comprovante.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao enviar comprovante.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-dark-800 rounded-3xl w-full max-w-md relative z-10 border border-white/10 overflow-hidden shadow-2xl flex flex-col items-center"
        >
          {/* Header */}
          <div className="bg-dark-900 w-full p-6 text-center border-b border-white/5 relative">
            <h2 className="text-xl font-bold text-white">Pagamento PIX</h2>
            <p className="text-gray-400 text-sm mt-1">{planName}</p>
            {!isPendingApproval && (
              <button onClick={onClose} className="absolute right-6 top-6 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            )}
          </div>

          <div className="p-8 w-full flex flex-col items-center text-center">
            {isPendingApproval ? (
               <div className="py-12 flex flex-col items-center w-full">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="text-green-500 w-12 h-12" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Comprovante Enviado!</h3>
                <p className="text-gray-400 mb-8">Nossa equipe está analisando seu pagamento. Assim que aprovado, seu plano será liberado.</p>
                <button 
                  onClick={onClose}
                  className="w-full bg-gold-500 text-dark-900 font-bold py-4 rounded-xl hover:bg-gold-400 transition-colors"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            ) : isExpired ? (
              <div className="py-12 flex flex-col items-center w-full">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="text-red-500 w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">QR Code Expirado</h3>
                <p className="text-gray-400 mb-8">O tempo limite para pagamento encerrou.</p>
                <button 
                  onClick={() => {
                    setTimeLeft(600);
                    setIsExpired(false);
                    setPixCode(""); // Vai forçar a recriar
                  }}
                  className="w-full bg-gold-500 text-dark-900 font-bold py-4 rounded-xl hover:bg-gold-400 transition-colors"
                >
                  Gerar Novo QR Code
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="inline-flex items-center gap-2 bg-dark-900 px-4 py-2 rounded-full border border-gold-500/30 mb-8">
                  <Clock className="text-gold-500 w-4 h-4" />
                  <span className="text-gold-500 font-mono font-bold">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl mb-8 min-h-[232px] flex items-center justify-center">
                  {isLoadingPix || !pixCode ? (
                    <Loader2 className="animate-spin text-dark-900" size={40} />
                  ) : (
                    <QRCodeSVG value={pixCode} size={200} />
                  )}
                </div>

                <p className="text-3xl font-black text-white mb-8">
                  R$ {amount.toFixed(2).replace('.', ',')}
                </p>

                <div className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 mb-8">
                  <code className="text-sm text-gray-400 truncate flex-1 text-left font-mono">
                    {pixCode || "Gerando código..."}
                  </code>
                  <button 
                    onClick={handleCopy}
                    disabled={!pixCode}
                    className="flex-shrink-0 bg-dark-800 p-2 rounded-xl text-gold-500 hover:bg-dark-700 transition-colors disabled:opacity-50"
                  >
                    {isCopied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </button>
                </div>

                {/* Comprovante Upload */}
                <div className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6">
                  <h4 className="text-white text-xs font-black uppercase italic text-center flex items-center justify-center gap-2 mb-4">
                    JÁ PAGOU? ENVIE O COMPROVANTE
                  </h4>
                  <div className="flex flex-col gap-3">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-gold-500/10 file:text-gold-500
                        hover:file:bg-gold-500/20 file:transition-colors"
                    />
                    <button 
                      onClick={handleSubmitReceipt}
                      disabled={!receipt || isUploading}
                      className="w-full bg-gold-500 text-dark-900 font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                    >
                      {isUploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                      {isUploading ? 'Enviando...' : 'Confirmar Pagamento'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
