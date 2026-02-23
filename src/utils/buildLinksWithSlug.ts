export default function buildLink(formName: string, slug: string) {
  const nameFormatted = formName
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `http://localhost:5173/form/${slug}/${nameFormatted}`;
}
