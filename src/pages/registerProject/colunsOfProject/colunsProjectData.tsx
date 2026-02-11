import type { GridColDef } from "@mui/x-data-grid";

export const columnsProjects: GridColDef[] = [
  {
    field: "name",
    headerName: "Nome do Projeto",
    minWidth: 160,
    flex: 2,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "slug",
    headerName: "Slug",
    minWidth: 160,
    flex: 2,
    align: "left",
    headerAlign: "left",
  },
  {
    field: "createdAt",
    headerName: "Criado em",
    minWidth: 140,
    flex: 1,
    align: "left",
    headerAlign: "left",
  },
];
