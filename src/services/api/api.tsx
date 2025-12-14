import axios from "axios";

const baseURL = "https://automacao.keekconecta.com.br/webhook-test/ale-opiniao";

// Public API: no auth/login handling required.
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
