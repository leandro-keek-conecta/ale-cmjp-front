import axios from "axios";

const baseURL = `${import.meta.env.VITE_API_URL}/escuta-cidada-api`;
// API para endpoints públicos (sem token e sem tratamento de auth)
export const apiPublic = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
