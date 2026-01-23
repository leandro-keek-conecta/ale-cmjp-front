import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const temasColumns: GridColDef[] = [
  {
    field: "tema",
    headerName: "Tema",
    flex: 6,
    minWidth: 160,
  },
  {
    field: "total",
    headerName: "Opiniões",
    flex: 4,
    minWidth: 140,
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams) => (
      <span style={{ display: "block", width: "100%", textAlign: "center" }}>
        {params.value}
      </span>
    ),
  },
];
