import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

export function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
