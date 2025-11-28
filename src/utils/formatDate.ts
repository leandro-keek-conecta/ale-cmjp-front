export default function formatDate(value?: string | null) {
  if (!value) return "Instante";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recente";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};