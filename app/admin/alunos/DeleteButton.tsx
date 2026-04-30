"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteMember } from "./actions";

export default function DeleteButton({ memberId }: { memberId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja remover este aluno do sistema permanentemente?")) {
      startTransition(async () => {
        await deleteMember(memberId);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className={`p-2 rounded-lg transition-colors ${isPending ? 'opacity-50 cursor-not-allowed text-gray-500 bg-gray-500/10' : 'text-red-500 hover:bg-red-500/20 bg-red-500/10 border border-red-500/20'}`}
      title="Remover Aluno"
    >
      <Trash2 size={18} />
    </button>
  );
}
