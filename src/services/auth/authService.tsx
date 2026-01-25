import type UserLogin from "../../types/userLogin";
import { api } from "../api/api";
import { defaultTheme } from "../../theme";
import { ensureThemeColor, getActiveProject } from "../../utils/project";
import { CLEAR_PROJECT_SELECTION_EVENT } from "../../constants/events";

export async function login(
  data: UserLogin,
  updateThemeColor: (c: string) => void,
) {
  try {
    const response = await api.post(
      "/auth/login",
      data /*, { skipAuthInterceptor: true }*/,
    );

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

    const themeColor = ensureThemeColor(
      activeProject?.corHex,
      defaultTheme.palette.primary.main,
    );
    updateThemeColor(themeColor);

    return response;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      (error.response?.status === 401
        ? "Login ou senha incorretos"
        : "Erro ao conectar ao servidor");
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
    }

    // Opcional: Redireciona para a pagina de login
    // navigate('/login');
  } catch (error: any) {
    console.error("Erro ao fazer logout: ", error);
  }
}
