import axios from "axios";

const baseURL = `https://ouvidoria-api/keekconecta.com.br/escuta-cidada-api`;

// API para endpoints p�blicos (sem token e sem tratamento de auth)
export const apiPublic = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
