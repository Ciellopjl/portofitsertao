"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPin, Clock, Trophy, Flame, Zap, ShieldCheck, Dumbbell, MessageCircle, Star } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 }
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white selection:bg-gold-500 selection:text-dark-900 overflow-hidden font-sans">
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gold-500 origin-left z-[100] shadow-[0_0_15px_rgba(255,215,0,0.6)]" 
        style={{ scaleX: scrollYProgress }} 
      />

      {/* Background Animated Blurs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gold-500/10 blur-[120px] mix-blend-screen"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-600/10 blur-[120px] mix-blend-screen"
        ></motion.div>
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
        className="fixed w-full z-50 backdrop-blur-md bg-dark-900/60 border-b border-white/5 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gold-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <img src="/logo-porto.png" alt="PortoFit Logo" className="w-12 h-12 object-contain relative z-10 drop-shadow-2xl" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-white">
                PORTOFIT<span className="text-gold-500 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"> SERTÃO</span>
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#diferenciais" className="text-sm font-bold text-gray-300 hover:text-gold-500 transition-colors uppercase tracking-widest">Diferenciais</a>
              <a href="#planos" className="text-sm font-bold text-gray-300 hover:text-gold-500 transition-colors uppercase tracking-widest">Planos</a>
              <a href="#localizacao" className="text-sm font-bold text-gray-300 hover:text-gold-500 transition-colors uppercase tracking-widest">Localização</a>
              <a
                href="https://www.instagram.com/portofitsertao/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-500 hover:border-transparent transition-all duration-300"
                title="@portofitsertao"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <Link href="/login" className="relative group overflow-hidden px-8 py-3 rounded-full bg-gold-500 text-dark-900 font-bold hover:bg-gold-400 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)]">
                <span className="relative z-10 flex items-center gap-2">Área do Aluno <ArrowRight size={16} /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        
        {/* Background - Visible Ken Burns + Parallax */}
        <motion.div 
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ 
            scale: 1.1,
            opacity: 1,
            x: ["-1%", "1%", "-1%"],
            y: ["-1%", "1%", "-1%"]
          }}
          transition={{ 
            opacity: { duration: 2 },
            scale: { duration: 2.5, ease: "easeOut" },
            x: { duration: 20, repeat: Infinity, ease: "linear" },
            y: { duration: 25, repeat: Infinity, ease: "linear" }
          }}
          style={{ y: yBg }}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <div className="absolute inset-0 bg-[url('/capa-porto.png')] bg-cover bg-center scale-125" />
          <div className="absolute inset-0 bg-dark-900/40" />
        </motion.div>
        
        {/* Glow Overlay for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_#0a0a0a_80%)] z-0 pointer-events-none opacity-60"></div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center"
        >
          
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, borderColor: "rgba(255,215,0,0.6)" }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-dark-800/80 border border-gold-500/30 text-gold-500 text-sm font-black mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.15)] transition-all cursor-default uppercase tracking-widest"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Star size={16} className="fill-gold-500" />
            </motion.div>
            A Melhor do Sertão Alagoano
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-7xl md:text-8xl lg:text-[11rem] font-black tracking-tighter mb-10 leading-[0.85] select-none"
          >
            <motion.span 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="block text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              MOLDE SEU
            </motion.span>
            <motion.span 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-gold-200 to-yellow-600 drop-shadow-[0_0_50px_rgba(255,215,0,0.4)]"
            >
              FUTURO AQUI
            </motion.span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-3xl text-gray-200 max-w-4xl mx-auto mb-16 font-medium leading-relaxed drop-shadow-md"
          >
            A experiência definitiva em fitness. <span className="text-white font-black underline decoration-gold-500 decoration-4 underline-offset-8">Equipamentos importados</span> e ambiente 100% climatizado.
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <Link href="#planos" className="group relative overflow-hidden inline-flex items-center gap-4 px-14 py-7 rounded-full bg-gold-500 text-dark-900 font-black text-2xl hover:bg-gold-400 transition-all shadow-[0_20px_50px_rgba(255,215,0,0.4)] hover:-translate-y-2">
              <span className="relative z-10 flex items-center gap-2 italic uppercase tracking-tighter">Ver Planos <ArrowRight className="group-hover:translate-x-3 transition-transform" /></span>
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </Link>
            
            <a href="https://wa.me/5582987894552" target="_blank" className="group inline-flex items-center gap-4 px-14 py-7 rounded-full bg-dark-800/40 backdrop-blur-xl border border-white/10 text-white font-black text-2xl hover:bg-white/10 hover:border-gold-500/50 transition-all hover:-translate-y-2">
              <span className="italic uppercase tracking-tighter">Consultoria VIP</span>
              <MessageCircle className="group-hover:rotate-12 transition-transform text-gold-500" />
            </a>
          </motion.div>
        </motion.div>
        
        {/* Floating Icons - More Pronounced but Efficient */}
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 5, 0]
          }} 
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="hidden xl:flex absolute left-24 top-1/3 flex-col items-center justify-center w-36 h-36 rounded-[3rem] bg-dark-800/60 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-20"
        >
          <Dumbbell className="text-gold-500 mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" size={44} />
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Padrão Ouro</span>
        </motion.div>

        <motion.div 
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -5, 0]
          }} 
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="hidden xl:flex absolute right-24 bottom-1/3 flex-col items-center justify-center w-40 h-40 rounded-full bg-dark-800/60 backdrop-blur-xl border border-gold-500/20 shadow-[0_0_80px_rgba(255,215,0,0.15)] z-20"
        >
          <Flame className="text-gold-500 mb-2 animate-pulse" size={48} />
          <span className="text-xs font-black text-white uppercase tracking-widest">Performance</span>
        </motion.div>

        {/* Dynamic Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Explorar</span>
          <motion.div 
            animate={{ scaleY: [0, 1, 0], originY: [0, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-16 bg-gold-500"
          />
        </motion.div>
      </section>

      {/* Differentials Section */}
      <section id="diferenciais" className="py-24 relative z-10 bg-dark-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Maquinário Importado", desc: "Equipamentos biomecânicos de última geração para máxima ativação muscular." },
              { icon: ShieldCheck, title: "100% Climatizado", desc: "Ambiente perfeitamente refrigerado para treinos intensos com total conforto." },
              { icon: Trophy, title: "Suporte Premium", desc: "Profissionais altamente capacitados acompanhando sua evolução de perto." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group p-8 rounded-3xl bg-dark-800/50 border border-white/5 hover:border-gold-500/30 transition-colors hover:bg-dark-800"
              >
                <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-gold-500/20">
                  <item.icon className="text-gold-500" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-32 relative bg-dark-900 overflow-hidden">
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-fixed opacity-5 mix-blend-overlay"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Assinaturas <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-600">Premium</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Invista no seu bem-estar com planos pensados para o seu estilo de vida.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                name: "Mensal", 
                price: "100", 
                cents: ",00",
                subtitle: "/mês",
                features: ["Acesso livre a toda estrutura", "Taxa de Matrícula: R$ 120,00", "Avaliação Física Inclusa"] 
              },
              { 
                name: "Trimestral", 
                price: "288", 
                cents: ",00",
                subtitle: "à vista",
                features: ["Ou 3x de R$ 101,66 no cartão", "Total a prazo: R$ 304,88", "1 Avaliação Física Inclusa"], 
                popular: true 
              },
              { 
                name: "Semestral", 
                price: "508", 
                cents: ",40",
                subtitle: "à vista",
                features: ["Ou 6x de R$ 91,50 no cartão", "Total a prazo: R$ 549,00", "1 Avaliação Física Inclusa"] 
              },
              { 
                name: "Anual", 
                price: "960", 
                cents: ",00",
                subtitle: "à vista",
                features: ["Ou 12x de R$ 90,40 no cartão", "Total a prazo: R$ 1084,80", "2 Avaliações Físicas Inclusas", "Acesso ao App VIP"] 
              },
              { 
                name: "PortoFit+ (Grupos)", 
                price: "85", 
                cents: ",00",
                subtitle: "/pessoa",
                features: ["Para 10 a 20 pessoas", "Mais de 20 pessoas: R$ 80,00", "Ideal para empresas"] 
              },
              { 
                name: "Diária VIP", 
                price: "30", 
                cents: ",00",
                subtitle: "/dia",
                features: ["Acesso livre por 1 dia", "2 dias ou mais: R$ 20,00/dia", "Sem burocracia"] 
              }
            ].map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`relative p-10 rounded-[2.5rem] flex flex-col h-full overflow-hidden ${plan.popular ? 'bg-gradient-to-b from-dark-800 to-dark-900 border border-gold-500 shadow-[0_0_50px_rgba(255,215,0,0.15)]' : 'bg-dark-800 border border-white/5 shadow-2xl'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-[50px] rounded-full"></div>
                )}
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-400 via-yellow-500 to-gold-600"></div>
                )}
                
                <div className="mb-8">
                  {plan.popular && (
                     <span className="inline-block px-4 py-1.5 rounded-full bg-gold-500/10 text-gold-500 text-xs font-black uppercase tracking-wider mb-4 border border-gold-500/20">Mais Escolhido</span>
                  )}
                  <h3 className="text-3xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="flex items-start gap-1">
                    <span className="text-xl text-gray-400 font-bold mt-2">R$</span>
                    <span className="text-6xl font-black text-white tracking-tighter">{plan.price}</span>
                    <div className="flex flex-col justify-end pb-2">
                      <span className="text-xl text-gray-300 font-bold">{plan.cents}</span>
                      <span className="text-sm text-gray-500 font-medium">{plan.subtitle}</span>
                    </div>
                  </div>
                </div>
                
                <ul className="space-y-5 mb-10 flex-grow">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-4">
                      <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${plan.popular ? 'bg-gold-500/20' : 'bg-white/5'}`}>
                        <CheckCircle2 className={plan.popular ? 'text-gold-500' : 'text-gray-400'} size={14} />
                      </div>
                      <span className="text-gray-300 font-medium leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/login" className={`block w-full py-5 rounded-2xl text-center font-bold text-lg transition-all mt-auto ${plan.popular ? 'bg-gold-500 text-dark-900 hover:bg-gold-400 shadow-[0_10px_20px_rgba(255,215,0,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                  Garantir Vaga
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="localizacao" className="py-32 relative bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
            className="bg-dark-800 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative"
          >
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="grid lg:grid-cols-2 relative z-10">
              {/* Info side */}
              <div className="p-12 md:p-16 flex flex-col justify-center">
                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Onde <span className="text-gold-500">Estamos</span></h2>
                <p className="text-gray-400 mb-12 text-lg font-medium">
                  A melhor estrutura do Sertão Alagoano aguardando por você.
                </p>
                
                <div className="space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-5 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-gold-500/50 group-hover:bg-gold-500/10 transition-all group-hover:scale-110">
                      <MapPin className="text-gold-500" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">Endereço</h4>
                      <p className="text-gray-400">
                        Rua Marcus Vinícius de, R. Escritor Aldemar de Mendonça, 255<br/>
                        Centro, Pão de Açúcar - AL, 57400-000<br/>
                        <span className="text-xs text-gold-500/70 font-bold uppercase mt-1 inline-block tracking-tighter">7H37+GR Pão de Açúcar, Alagoas</span>
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="flex items-start gap-5 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-gold-500/50 group-hover:bg-gold-500/10 transition-all group-hover:scale-110">
                      <Clock className="text-gold-500" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">Funcionamento</h4>
                      <div className="flex flex-col gap-1 text-gray-400">
                        <span><strong className="text-white">Seg-Sex:</strong> 05h às 21h</span>
                        <span><strong className="text-white">Sábado:</strong> 07h às 17h</span>
                        <span><strong className="text-red-400">Domingo:</strong> Fechado</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="flex items-start gap-5 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-gold-500/50 group-hover:bg-gold-500/10 transition-all group-hover:scale-110">
                      <MessageCircle className="text-gold-500" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">WhatsApp</h4>
                      <div className="flex flex-col gap-1 text-gray-400">
                        <a href="https://wa.me/5582987894552" target="_blank" className="hover:text-gold-500 transition-colors">
                          <strong className="text-white">Comercial:</strong> (82) 98789-4552
                        </a>
                        <a href="https://wa.me/5582991811859" target="_blank" className="hover:text-gold-500 transition-colors">
                          <strong className="text-white">Administrativo:</strong> (82) 99181-1859
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Map side */}
              <div className="h-[450px] lg:h-auto border-t lg:border-t-0 lg:border-l border-white/5 overflow-hidden">
                <motion.iframe 
                  initial={{ scale: 1.2, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.321151651522!2d-37.437974924185794!3d-9.746221090351322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x70f51f3ff0cecdb%3A0x2ff7f67bcb138570!2sAcademia%20PortoFit!5e0!3m2!1spt-BR!2sbr!4v1714300000000!5m2!1spt-BR!2sbr" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.1)' }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></motion.iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 py-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <Link href="/admin-login" className="flex items-center gap-2 group cursor-pointer" title="Acesso Administrativo">
              <img src="/logo-porto.png" alt="PortoFit Logo" className="w-8 h-8 object-contain grayscale opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="font-bold text-lg text-gray-500 group-hover:text-gold-500 transition-colors">PORTOFIT</span>
           </Link>
           <div className="flex flex-col items-center gap-1">
             <p className="text-gray-500 text-sm font-medium">© 2026 Portofit Sertão. Todos os direitos reservados.</p>
             <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
               Desenvolvido por{" "}
               <a 
                 href="https://ciello-dev.vercel.app/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gold-500/60 hover:text-gold-500 transition-colors"
               >
                 ciello dev 👨‍💻
               </a>
             </p>
           </div>
           <a
             href="https://www.instagram.com/portofitsertao/"
             target="_blank"
             rel="noopener noreferrer"
             className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-pink-500/50 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-pink-500/10 transition-all duration-300 text-sm font-bold group"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-pink-400 transition-colors"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
             @portofitsertao
           </a>
        </div>
      </footer>
    </div>
  );
}
