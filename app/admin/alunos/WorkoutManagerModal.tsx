"use client";

import { useState } from "react";
import { 
  X, Plus, Trash2, Dumbbell, Save, 
  ChevronDown, ChevronUp, Activity, Clock 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveWorkout } from "./actions";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  notes: string;
}

interface WorkoutManagerModalProps {
  memberId: string;
  memberName: string;
}

export default function WorkoutManagerModal({ memberId, memberName }: WorkoutManagerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: 3, reps: "12", weight: "", rest: "60s", notes: "" }
  ]);

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: "12", weight: "", rest: "60s", notes: "" }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const newExercises = [...exercises];
    (newExercises[index] as any)[field] = value;
    setExercises(newExercises);
  };

  const handleSave = async () => {
    if (!name || exercises.some(ex => !ex.name)) {
      alert("Preencha o nome do treino e de todos os exercícios.");
      return;
    }

    setLoading(true);
    const res = await saveWorkout(memberId, { name, description, exercises });
    setLoading(false);

    if (res.success) {
      setIsOpen(false);
      setName("");
      setDescription("");
      setExercises([{ name: "", sets: 3, reps: "12", weight: "", rest: "60s", notes: "" }]);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl bg-gold-500/10 text-gold-500 border border-gold-500/20 hover:bg-gold-500 hover:text-dark-900 transition-all mr-2"
        title="Montar Treino"
      >
        <Dumbbell size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c0c0c] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                    <Dumbbell className="text-gold-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Montar Treino</h2>
                    <p className="text-xs text-gray-500 font-medium">Aluno: <span className="text-gold-500">{memberName}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nome do Treino</label>
                    <input
                      type="text"
                      placeholder="Ex: Treino A - Superior"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-gold-500 focus:bg-white/[0.08] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Observação Geral</label>
                    <input
                      type="text"
                      placeholder="Ex: Focar em amplitude e controle"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-gold-500 focus:bg-white/[0.08] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity size={16} className="text-gold-500" /> Exercícios
                    </h3>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{exercises.length} total</span>
                  </div>

                  <div className="space-y-6">
                    {exercises.map((ex, idx) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-[1.5rem] space-y-5 relative group"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 w-full flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome do Exercício</label>
                            <input
                              type="text"
                              placeholder="Digite o nome do exercício..."
                              value={ex.name}
                              onChange={(e) => updateExercise(idx, "name", e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-white font-bold focus:outline-none focus:border-gold-500 focus:bg-black/60 transition-all placeholder:text-gray-700"
                            />
                          </div>
                          <button
                            onClick={() => removeExercise(idx)}
                            className="sm:mt-5 p-3.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg shrink-0"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Séries</label>
                            <input
                              type="number"
                              value={ex.sets}
                              onChange={(e) => updateExercise(idx, "sets", parseInt(e.target.value))}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm font-bold focus:border-gold-500 focus:bg-black/60 transition-all"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Repetições</label>
                            <input
                              type="text"
                              value={ex.reps}
                              onChange={(e) => updateExercise(idx, "reps", e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm font-bold focus:border-gold-500 focus:bg-black/60 transition-all"
                              placeholder="12"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Carga (Peso)</label>
                            <input
                              type="text"
                              value={ex.weight}
                              onChange={(e) => updateExercise(idx, "weight", e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm font-bold focus:border-gold-500 focus:bg-black/60 transition-all"
                              placeholder="20kg"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descanso</label>
                            <input
                              type="text"
                              value={ex.rest}
                              onChange={(e) => updateExercise(idx, "rest", e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm font-bold focus:border-gold-500 focus:bg-black/60 transition-all"
                              placeholder="60s"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={addExercise}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-gray-500 hover:border-gold-500/50 hover:text-gold-500 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Plus size={18} /> Adicionar Exercício
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-white/[0.01]">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 rounded-xl text-gray-400 font-bold text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-gold-500 text-dark-900 font-black text-sm hover:bg-gold-400 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Salvando..." : <><Save size={18} /> Salvar Ficha</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
