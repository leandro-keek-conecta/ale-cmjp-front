import { api } from "../api/api";
import type { Opinion } from "../../pages/home/HomePage";
import type { UserFormValues } from "../../@types/user";

export async function createUSer(user: UserFormValues): Promise<Opinion[]> {
  const response = await api.post("", {
    action: "create",
    entity: "usuario",
    payload: user,
  });
  console.log("API response:", response);
  const data = response?.data;
  return Array.isArray(data) ? data : []; // garante array mesmo quando a API não retornar lista
}


