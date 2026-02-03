import { apiPublic } from "../apiPublic/api";

export default function getForms(slug: string, projectName: string) {
  const response = apiPublic.get(
    `/public/projetos/${projectName}/forms/slug/${slug}`,
  );
  return response;
}
