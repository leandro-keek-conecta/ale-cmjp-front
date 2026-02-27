import type { GridColDef } from "@mui/x-data-grid";

export const bairrosColumns: GridColDef[] = [
  {
    field: "bairro",
    headerName: "Bairro",
    flex: 1,
    colSpan: 4,
  },
  {
    field: "total",
    headerName: "Opiniões",
    width: 120,
    align: "right",
    headerAlign: "right",
    colSpan: 4,
  },
];
