import type UserLogin from "../../types/userLogin";
import { api } from "../../services/api/api";
import { getActiveProject } from "../../utils/project";
import { AUTH_LOGOUT_EVENT, CLEAR_PROJECT_SELECTION_EVENT } from "../../constants/events";

export async function login(
  data: UserLogin
) {
  try {
    console.log("[authService.login] start");
    const response = await api.post(
      "/auth/login",
      data,
      {
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 300,
      }
    );
    console.log("[authService.login] response status:", response?.status);

    const token = response.data?.response?.accessToken;
    const rawUser = response.data?.response?.user;
    const activeProject = getActiveProject(rawUser);
    const userToPersist = rawUser
      ? { ...rawUser, ...(activeProject ? { projeto: activeProject } : {}) }
      : null;

    if (token) {
      localStorage.setItem("token", token);
    }

    if (userToPersist) {
      localStorage.setItem("user", JSON.stringify(userToPersist));
    }


    return response;
  } catch (error: any) {
    console.log(
      "[authService.login] error status:",
      error?.response?.status,
      "message:",
      error?.message
    );
    const status = error.response?.status;
    const isTimeout =
      error.code === "ECONNABORTED" ||
      (typeof error.message === "string" &&
        error.message.toLowerCase().includes("timeout"));

    let message = "Falha ao autenticar. Tente novamente.";
    if (status === 401) {
      message = "Login ou senha incorretos.";
    } else if (status === 429) {
      message = "Muitas tentativas. Aguarde e tente novamente.";
    } else if (status && status >= 500) {
      message = "Servidor indisponível no momento. Tente novamente.";
    } else if (isTimeout) {
      message = "Tempo limite ao conectar. Tente novamente.";
    }

    throw new Error(message);
  }
}

export async function logout() {
  try {
    // 1. Limpa o estado no AuthContext
    /*     setUser(null); */
    // 2. Remove apenas as chaves de autenticacao do localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("projectContext");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(CLEAR_PROJECT_SELECTION_EVENT));
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }

    // Opcional: Redireciona para a pagina de login
    // navigate('/login');
  } catch (error: any) {
    console.error("Erro ao fazer logout: ", error);
  }
}
