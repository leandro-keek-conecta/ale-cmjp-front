import type { GridColDef } from "@mui/x-data-grid";

export const columnsUsers: GridColDef[] = [
  {
    field: "name",
    headerName: "Nome do Usuário",
    minWidth: 150,
    flex: 1,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "email",
    headerName: "Email",
    minWidth: 180,
    flex: 2,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "projectNames",
    headerName: "Projetos",
    minWidth: 180,
    flex: 1,
    align: "left",
    headerAlign: "left",
    sortable: false,
    type: "string", // (opcional mas seguro)
  },
  {
    field: "role",
    headerName: "Nivel de Acesso",
    minWidth: 100,
    flex: 1,
    align: "center",
    headerAlign: "center",
  },
];

