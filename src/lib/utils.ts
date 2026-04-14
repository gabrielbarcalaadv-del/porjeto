import { format, parseISO, differenceInDays, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function isOverdue(dateStr: string): boolean {
  return isAfter(new Date(), parseISO(dateStr));
}

export function prazoColor(dataVencimento: string, status: string) {
  if (status === "concluido") return "text-green-600";
  const days = daysUntil(dataVencimento);
  if (days < 0) return "text-red-600";
  if (days <= 3) return "text-red-500";
  if (days <= 7) return "text-orange-500";
  if (days <= 15) return "text-yellow-600";
  return "text-green-600";
}

export const prioridadeColors: Record<string, string> = {
  baixa: "bg-gray-100 text-gray-700",
  media: "bg-blue-100 text-blue-700",
  alta: "bg-orange-100 text-orange-700",
  urgente: "bg-red-100 text-red-700",
};

export const statusProcessoColors: Record<string, string> = {
  ativo: "bg-green-100 text-green-700",
  arquivado: "bg-gray-100 text-gray-600",
  suspenso: "bg-yellow-100 text-yellow-700",
  encerrado: "bg-red-100 text-red-700",
};

export const tipoProcessoLabels: Record<string, string> = {
  civel: "Cível",
  criminal: "Criminal",
  trabalhista: "Trabalhista",
  previdenciario: "Previdenciário",
  tributario: "Tributário",
  administrativo: "Administrativo",
  familia: "Família",
  outro: "Outro",
};

export const tipoMovimentacaoLabels: Record<string, string> = {
  peticao: "Petição",
  audiencia: "Audiência",
  despacho: "Despacho",
  sentenca: "Sentença",
  recurso: "Recurso",
  citacao: "Citação",
  intimacao: "Intimação",
  acordo: "Acordo",
  outro: "Outro",
};

export const honorarioStatusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-700",
  pago: "bg-green-100 text-green-700",
  vencido: "bg-red-100 text-red-700",
  cancelado: "bg-gray-100 text-gray-600",
};

export const honorarioTipoLabels: Record<string, string> = {
  fixo: "Honorário Fixo",
  exito: "Êxito",
  sucumbencia: "Sucumbência",
  consulta: "Consulta",
};

export const prazoTipoLabels: Record<string, string> = {
  recursal: "Recursal",
  contestacao: "Contestação",
  audiencia: "Audiência",
  pericia: "Perícia",
  manifestacao: "Manifestação",
  pagamento: "Pagamento",
  outro: "Outro",
};

export const prazoStatusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-700",
  concluido: "bg-green-100 text-green-700",
  vencido: "bg-red-100 text-red-700",
  prorrogado: "bg-blue-100 text-blue-700",
};
