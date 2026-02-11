export function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // remove caracteres inválidos
    .trim()
    .replace(/\s+/g, "-") // espaço vira hífen
    .replace(/-+/g, "-"); // remove hífens duplicados
}
