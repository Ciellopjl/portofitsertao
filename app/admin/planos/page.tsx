import { prisma } from "@/lib/prisma";
import { Dumbbell, CheckCircle, AlertCircle } from "lucide-react";
import NovoPlanoModal from "./NovoPlanModal";
import DeletePlanButton from "./DeletePlanButton";
import EditPlanModal from "./EditPlanModal";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function PlanosPage() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user?.email === "ciellodev@gmail.com";

  const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Dumbbell className="text-gold-500" /> Planos e Preços
          </h1>
          <p className="text-gray-400">Configure os planos da academia, valores e durações.</p>
        </div>
        {isSuperAdmin && <NovoPlanoModal />}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full bg-dark-800 rounded-3xl p-12 text-center border border-white/5 shadow-2xl">
            <div className="flex flex-col items-center justify-center gap-4">
               <Dumbbell size={48} className="text-gray-600 mb-2" />
               <p className="text-lg font-medium text-gray-300">Nenhum plano cadastrado ainda.</p>
               <p className="text-sm text-gray-500">Clique em "Novo Plano" para começar.</p>
            </div>
          </div>
        ) : (
          plans.map((plan: any) => (
            <div key={plan.id} className="bg-dark-800 rounded-3xl p-6 border border-white/5 relative group shadow-xl hover:shadow-[0_0_30px_rgba(255,215,0,0.05)] hover:border-gold-500/10 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${plan.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                  {plan.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {plan.description && <p className="text-gray-400 text-sm mb-6 flex-grow">{plan.description}</p>}
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm text-gray-400">R$</span>
                <span className="text-4xl font-black text-white">{plan.price.toFixed(2).replace('.', ',')}</span>
                <span className="text-sm text-gray-400">/{plan.duration === 1 ? 'mês' : `${plan.duration} meses`}</span>
              </div>

              {plan.features.length > 0 && (
                <div className="space-y-3 mb-8">
                  {plan.features.map((feat: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="text-gold-500 shrink-0 mt-0.5" size={16} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              {isSuperAdmin && (
                <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                  <EditPlanModal plan={plan} />
                  <DeletePlanButton planId={plan.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
