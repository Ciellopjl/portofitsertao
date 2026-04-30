import { prisma } from "@/lib/prisma";
import { Users, Search } from "lucide-react";
import DeleteButton from "./DeleteButton";
import NovoAlunoModal from "./NovoAlunoModal";
import ExportButtons from "./ExportButtons";
import WorkoutManagerModal from "./WorkoutManagerModal";

export const dynamic = 'force-dynamic';

export default async function AlunosPage() {
  const [members, plans] = await Promise.all([
    prisma.member.findMany({
      where: { user: { role: { not: 'ADMIN' } } },
      include: { 
        user: true, 
        plan: true,
        _count: { select: { payments: { where: { status: 'PAID' } } } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } })
  ]);

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="text-gold-500" /> Gestão de Alunos
          </h1>
          <p className="text-gray-400">Gerencie os cadastros, informações e acesso dos alunos.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExportButtons />
          <NovoAlunoModal plans={plans} />
        </div>
      </div>
      
      <div className="bg-dark-800 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex gap-4 bg-dark-800/50">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou código..." 
              className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <select className="bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 appearance-none min-w-[180px]">
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="PENDING">Pendentes</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-dark-900/80 text-gray-400 font-medium border-b border-white/5">
              <tr>
                <th className="px-6 py-5">Aluno</th>
                <th className="px-6 py-5">Código</th>
                <th className="px-6 py-5">Cadastro</th>
                <th className="px-6 py-5">Renovações</th>
                <th className="px-6 py-5">Plano Atual</th>
                <th className="px-6 py-5">Vencimento</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Users size={48} className="text-gray-600 mb-2" />
                      <p className="text-lg font-medium text-white">Nenhum aluno encontrado</p>
                      <p>Cadastre seu primeiro aluno clicando no botão acima.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map((member: any) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-gold-500 font-bold overflow-hidden border border-white/10 shrink-0">
                          {member.user.image ? <img src={member.user.image} alt={member.user.name || ""} className="w-full h-full object-cover" /> : (member.user.name?.charAt(0) || "?")}
                        </div>
                        <div>
                          <p className="font-bold text-white truncate max-w-[200px]">{member.user.name || "Sem Nome"}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{member.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-300">
                      <span className="bg-dark-900 px-3 py-1 rounded-lg border border-white/5">{member.studentCode}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-xs">
                      {new Date(member.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">
                        {member._count.payments} {member._count.payments === 1 ? 'plano' : 'planos'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-medium">{member.plan?.name || "Nenhum Plano"}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {(() => {
                        if (!member.planExpiresAt) return "-";
                        const dateStr = new Date(member.planExpiresAt).toLocaleDateString('pt-BR');
                        const daysLeft = Math.ceil((new Date(member.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        if (member.status !== 'ACTIVE') return dateStr;
                        return (
                          <div className="flex flex-col">
                            <span>{dateStr}</span>
                            <span className={`text-[10px] font-bold mt-1 ${daysLeft <= 5 ? 'text-red-400' : 'text-green-500'}`}>
                              ({daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'})
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${member.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : member.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {member.status === 'ACTIVE' ? 'Ativo' : member.status === 'PENDING' ? 'Pendente' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      {(() => {
                        const now = new Date();
                        const expiresAt = member.planExpiresAt ? new Date(member.planExpiresAt) : null;
                        const isExpired = expiresAt && expiresAt < now;
                        const isNearExpiration = expiresAt && !isExpired && (expiresAt.getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000);

                        let waMessage = `Olá ${member.user.name}, aqui é da PortoFit Sertão! 💪\n\nEstou passando para informar que seu cadastro está ativo. Seu código de acesso para o check-in na entrada é: *${member.studentCode}*.\n\nQualquer dúvida, estamos à disposição!`;
                        let btnColor = "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500";
                        let btnText = "Acesso";

                        if (isExpired) {
                          waMessage = `Olá ${member.user.name}, tudo bem? aqui é da PortoFit Sertão! 🏋️‍♂️\n\nNotamos que seu plano venceu no dia ${expiresAt?.toLocaleDateString('pt-BR')}. Vamos garantir sua renovação para você não perder o ritmo dos treinos? \n\nQualquer dúvida é só falar!`;
                          btnColor = "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500";
                          btnText = "Cobrar";
                        } else if (isNearExpiration) {
                          waMessage = `Olá ${member.user.name}, tudo bem? aqui é da PortoFit Sertão! 🏃‍♂️\n\nEstou passando para lembrar que seu plano vence logo (dia ${expiresAt?.toLocaleDateString('pt-BR')}). Já quer garantir a renovação para continuar treinando sem interrupções? \n\nEstamos à disposição!`;
                          btnColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500";
                          btnText = "Lembrar";
                        }

                        return (
                          <a 
                            href={`https://wa.me/55${member.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`}
                            target="_blank"
                            className={`p-2 px-3 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold hover:text-white ${btnColor}`}
                            title={btnText}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                            {btnText}
                          </a>
                        );
                      })()}
                      <WorkoutManagerModal memberId={member.id} memberName={member.user.name || "Aluno"} />
                      <DeleteButton memberId={member.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
