export default function buildLink(formName: string, slug: string) {
  const nameFormatted = formName
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";

  const basePath = slug ? `/form/${slug}/${nameFormatted}` : `/form/${nameFormatted}`;
  return `${origin}${basePath}`;
}
