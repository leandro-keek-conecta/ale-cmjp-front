import axios from "axios";

const baseURL = `ouvidoria.keekconecta.com.br/escuta-cidada-api`;

// API para endpoints públicos (sem token e sem tratamento de auth)
export const apiPublic = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
