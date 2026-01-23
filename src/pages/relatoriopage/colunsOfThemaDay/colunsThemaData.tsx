import type { GridColDef } from "@mui/x-data-grid";

export const temasColumns: GridColDef[] = [
  {
    field: "tema",
    headerName: "Tema",
    
    colSpan: 1,
  },
  {
    field: "total",
    headerName: "Opiniões",
    width: 120,
    align: "right",
    headerAlign: "right",
    colSpan: 2,
  },
];
