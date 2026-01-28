import axios, { AxiosError } from "axios";
import { triggerAlert } from "../alert/alertService";
import {
  AUTH_LOGOUT_EVENT,
  CLEAR_PROJECT_SELECTION_EVENT,
} from "../../constants/events";

// Função para obter o token do localStorage
const getUserToken = (): string | null => localStorage.getItem("token");

 const baseURL = `http://localhost:5443/escuta-cidada-api`;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token de autorização a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = getUserToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const url = (error.config?.url || "").toLowerCase();

    const hasToken = !!localStorage.getItem("token");
    const isLoginCall = url.includes("/auth/login");
    // opcional: permitir pular via flag na chamada
    const skip =
      (error.config as any)?.skipAuthInterceptor === true ||
      (error.config as any)?.headers?.["X-Skip-Auth-Interceptor"] === "true";

    if (status === 401 && hasToken && !isLoginCall && !skip) {
      triggerAlert({
        category: "warning",
        title: "Sua sessão expirou. Faça login novamente.",
      });

      // Limpa somente os dados de sessão aqui, sem chamar hook do React
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("projectContext");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CLEAR_PROJECT_SELECTION_EVENT));
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      }

      // Redireciona apenas se já não estiver na tela de login
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        setTimeout(() => {
          window.location.assign("/");
        }, 1000);
      }
    }

    // Importantíssimo: propague o erro para o chamador tratar
    return Promise.reject(error);
  }
);
