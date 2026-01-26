import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5443/escuta-cidada-api";

// Public API: no auth/login handling required.
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
