
import type User from "@/types/IUserType";
import { api } from "../api/api";
import axios from "axios";
import type { UpdateUserDTO } from "@/types/IUpdateUserDTO";
import type { ProjetoAccessLevel } from "@/types/IUserType";
import type { RawUserProject } from "@/utils/projectSelection";

interface CreateUserParams {
  email: string;
  name: string;
  password: string;
  profession: string;
  gender: string;
  role: string;
  projetos: { id: number; access: ProjetoAccessLevel; hiddenTabs?: string[] }[];
}

interface ApiResponse {
  message: string;
  data?: any;
}

export async function createUser(userData: CreateUserParams): Promise<ApiResponse> {
  try {
    const { data } = await api.post('/user/create', userData);
    return {
      message: data?.message ?? "Usuário criado com sucesso.",
      data: data?.data,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const message = (err.response?.data as any)?.message || "Erro inesperado no servidor.";

      if (status === 401) {
        throw new Error("Usuário não autorizado. Verifique seu login.");
      }

      if (status === 403) {
        throw new Error("Você não tem permissão para criar usuários.");
      }

      if (status === 409) {
        throw new Error("O email informado já está cadastrado.");
      }

      if (status === 400) {
        const firstIssue = (err.response?.data as any)?.issues?.[0]?.message;
        throw new Error("Erro de validação: " + (firstIssue || message));
      }

      // Outros erros não mapeados especificamente
      throw new Error(message);
    }

    // Caso não seja um erro do Axios
    throw new Error("Erro inesperado. Tente novamente.");
  }
}

export async function deleteUser(id:number){
  const response= await api.delete(`/user/delete/${id}`);
  return response;
}

export async function fetchUsers(): Promise<User[]> {
  const response = await api.get("/user/list");
  return response.data.data; // ? acessa corretamente o array de projetos
}

export async function fetchProjectsByUserId(
  userId: number,
): Promise<RawUserProject[]> {
  const users = await fetchUsers();
  const currentUser = users.find((user) => user?.id === userId);

  if (!currentUser) {
    return [];
  }

  if (Array.isArray(currentUser.projetos) && currentUser.projetos.length) {
    return currentUser.projetos as unknown as RawUserProject[];
  }

  if (currentUser.projeto) {
    return [currentUser.projeto as unknown as RawUserProject];
  }

  return [];
}

export async function updateUser(data: UpdateUserDTO): Promise<User[]> {
  const response = await api.patch(`/user/update/${data.id}`, data);
  return response.data.data; // ? acessa corretamente o array de projetos
}
