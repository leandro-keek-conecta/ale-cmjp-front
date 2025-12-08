import { api } from "../api/api";
import type { Opinion } from "../../pages/home/HomePage";

export async function getAllOpinions(): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "getAll",
    entity: "opiniao",
  });
  console.log("API response:", response);
  const data = response?.data;
  return Array.isArray(data) ? data : []; // garante array mesmo quando a API não retornar lista
}

export async function getTodayOpinions(): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "filterByToday",
    entity: "opiniao",
  });
  console.log("API response:", response);
  const data = response?.data;
  return Array.isArray(data) ? data : []; // garante array mesmo quando a API não retornar lista
}

export async function getUpDistricts() {
  const response = await api.post("", {
    action: "getUpDistrict",
    entity: "opiniao",
  });

  const data = response?.data;
  return data;
}
