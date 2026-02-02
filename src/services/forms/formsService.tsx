import { api } from "../api/api";

export default function getForms(slug: string, projectName: string) {

  const response = api.get(`/public/projetos/${projectName}/forms/slug/${slug}`)
  return response;
}