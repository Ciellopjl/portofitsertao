"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deletePlan } from "./actions";

export default function DeletePlanButton({ planId }: { planId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja excluir este plano? Os alunos vinculados perderão o plano.")) {
      startTransition(async () => {
        await deletePlan(planId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
