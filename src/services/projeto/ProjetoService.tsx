import { api } from "../api/api";


export default function getProjects() {
  const response = api.get(
    "projeto/list",
  );
  return response;
}
