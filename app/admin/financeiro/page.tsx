import { prisma } from "@/lib/prisma";
import { CreditCard, CheckCircle, Clock, AlertCircle, MessageSquare } from "lucide-react";
import PaymentActions from "./PaymentActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function FinanceiroPage() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user?.email === "ciellodev@gmail.com";

  const payments = await prisma.payment.findMany({
    where: {
      member: {
        user: {
          role: {
            not: 'ADMIN'
          }
        }
      }
    },
    include: {
      member: {
        include: { user: true, plan: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <CreditCard className="text-gold-500" /> Financeiro e PIX
          </h1>
          <p className="text-gray-400">Acompanhe as mensalidades, faturamento e aprove pagamentos PIX.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-800 rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl bg-yellow-500/10"></div>
          <div className="flex items-center gap-4 mb-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <Clock size={20} />
            </div>
            <h3 className="text-gray-400 font-medium">Aprovações Pendentes</h3>
          </div>
          <p className="text-4xl font-black text-white relative z-10">{pendingCount}</p>
        </div>

        {isSuperAdmin && (
          <div className="bg-dark-800 rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl bg-green-500/10"></div>
            <div className="flex items-center gap-4 mb-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-gray-400 font-medium">Receita Total</h3>
            </div>
            <p className="text-4xl font-black text-white relative z-10">R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
          </div>
        )}
      </div>
      
      <div className="bg-dark-800 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-dark-800/50">
          <h2 className="text-xl font-bold text-white">Histórico de Transações</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-900/80 text-gray-400 font-medium border-b border-white/5">
              <tr>
                <th className="px-6 py-5">Data</th>
                <th className="px-6 py-5">Aluno</th>
                <th className="px-6 py-5">Plano / Valor</th>
                <th className="px-6 py-5">Método</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle size={48} className="text-gray-600 mb-2" />
                      <p className="text-lg font-medium text-white">Nenhuma transação encontrada</p>
                      <p>As transações financeiras aparecerão aqui.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center overflow-hidden border border-white/10">
                           {payment.member.user.image ? <img src={payment.member.user.image} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-gold-500 font-bold">{payment.member.user.name?.charAt(0) || "?"}</span>}
                        </div>
                        <div>
                          <p className="font-bold text-white whitespace-nowrap">{payment.member.user.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{payment.member.studentCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{payment.member.plan?.name || "Plano Personalizado"}</p>
                      <p className="font-bold text-white">R$ {payment.amount.toFixed(2).replace('.', ',')}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <span className="px-3 py-1 rounded-lg bg-dark-900 border border-white/5 text-xs font-mono">{payment.method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${payment.status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' : payment.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {payment.status === 'PAID' ? 'Pago' : payment.status === 'PENDING' ? 'Aguardando PIX' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payment.status === 'PENDING' && payment.member.phone && (
                          <a 
                            href={`https://wa.me/55${payment.member.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${payment.member.user.name?.split(' ')[0]}, tudo bem? aqui é da PortoFit Sertão! 💪\n\nNotei que o pagamento do seu plano ainda consta como pendente. Segue o link para o PIX ou envio do comprovante para liberarmos seu acesso.\n\nLembrando que seu código de check-in é: *${payment.member.studentCode}*.\n\nQualquer dúvida, estamos aqui!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
                            title="Cobrar no WhatsApp"
                          >
                            <MessageSquare size={14} /> Cobrar
                          </a>
                        )}
                        <PaymentActions paymentId={payment.id} status={payment.status} receiptUrl={payment.receiptUrl} />
                      </div>
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
