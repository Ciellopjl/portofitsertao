import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dumbbell, ArrowLeft, Clock, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function AlunoTreinoPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    include: {
      workouts: {
        where: { isActive: true },
        include: { exercises: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!member) redirect("/");

  return (
    <div className="min-h-screen bg-[#080808] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#080808]/80 backdrop-blur-md border-b border-white/5 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/aluno/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar</span>
          </Link>
          <h1 className="text-lg font-black tracking-tight">MEU <span className="text-gold-500">TREINO</span></h1>
          <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
            <Dumbbell size={18} className="text-gold-500" />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {member.workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Dumbbell size={32} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">Nenhum treino montado</p>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">
                Peça ao seu professor para montar sua ficha de treinos no sistema.
              </p>
            </div>
          </div>
        ) : (
          member.workouts.map((workout) => (
            <div key={workout.id} className="bg-[#0f0f0f] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-gold-500/5 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 text-[10px] font-black uppercase tracking-widest border border-gold-500/20">
                    Ficha Ativa
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Atualizado em {new Date(workout.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">{workout.name}</h2>
                {workout.description && <p className="text-gray-500 text-sm mt-1">{workout.description}</p>}
              </div>

              <div className="divide-y divide-white/5">
                {workout.exercises.map((ex, idx) => (
                  <div key={ex.id} className="p-6 flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-black text-gray-500">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate">{ex.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Activity size={14} className="text-gold-500" />
                          <span>{ex.sets} séries x {ex.reps}</span>
                        </div>
                        {ex.weight && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <Dumbbell size={14} className="text-blue-400" />
                            <span>{ex.weight}</span>
                          </div>
                        )}
                        {ex.rest && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <Clock size={14} className="text-green-400" />
                            <span>Descanso: {ex.rest}</span>
                          </div>
                        )}
                      </div>
                      {ex.notes && (
                        <p className="text-[11px] text-gray-600 mt-2 italic line-clamp-2">Obs: {ex.notes}</p>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-gray-700 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Quick Stats Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0c0c0c] border-t border-white/5 p-4 md:hidden">
        <div className="flex items-center justify-around">
          <Link href="/aluno/dashboard" className="flex flex-col items-center gap-1 text-gray-500">
            <Activity size={20} />
            <span className="text-[10px] font-bold uppercase">Painel</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-gold-500">
            <Dumbbell size={20} />
            <span className="text-[10px] font-bold uppercase">Treino</span>
          </div>
          <Link href="/aluno/dashboard" className="flex flex-col items-center gap-1 text-gray-500">
            <Clock size={20} />
            <span className="text-[10px] font-bold uppercase">Histórico</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
