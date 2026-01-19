export default function formatDate(value?: string | null) {
  if (!value) return "Instante";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recente";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${day}/${month}/${year} - ${time}`;
}
