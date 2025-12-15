import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://automacao.webhook.keekconecta.com.br/webhook/ale-opiniao";

// Public API: no auth/login handling required.
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
