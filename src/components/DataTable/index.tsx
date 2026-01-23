import React from "react";
import { Paper } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { WhiteDataGrid } from "./DataGridStyles";
import { ActionMenuCell } from "./ActionMenuCell";

interface Props {
  rows: any[];
  columns: GridColDef[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onCustomAction?: (row: any) => void;
  hideActions?: boolean;
  height?: "auto" | number | string;
  sx?: SxProps<Theme>;
}

export function GenericDataTable({
  rows,
  columns,
  onEdit,
  onDelete,
  onCustomAction,
  hideActions = false,
  height = "auto",
  sx = {},
}: Props) {
  const isAutoHeight = height === "auto";

  const enhancedColumns = React.useMemo<GridColDef[]>(() => {
    if (hideActions) return columns;
    return [
      ...columns,
      {
        field: "actions",
        headerName: "Ações",
        sortable: false,
        disableColumnMenu: true,
        align: "center",
        headerAlign: "center",

        renderCell: (params: GridRenderCellParams) => (
          <ActionMenuCell
            row={params.row}
            onEdit={onEdit}
            onDelete={onDelete}
            onCustomAction={onCustomAction}
          />
        ),
      },
    ];
  }, [columns, hideActions, onEdit, onDelete, onCustomAction]);

  return (
    <Paper
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden", // evita push lateral
        backgroundColor: "white",
        boxSizing: "border-box",
        ...sx,
      }}
    >
      <WhiteDataGrid
        rows={rows}
        columns={enhancedColumns}
        autoHeight={isAutoHeight}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 5 } },
        }}
        pageSizeOptions={[5, 10]}
        // checkboxSelection REMOVIDO
        disableRowSelectionOnClick
        rowHeight={40}
        sx={{
          border: 0,
          fontSize: "0.8rem",
          "& .MuiDataGrid-cell": { fontSize: "0.8rem" },
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
          // Estilo do checkbox removido, já que não há seleção
          "& .MuiTablePagination-root": { fontSize: "0.8rem" },
          "& .MuiDataGrid-main": {
            width: "100%",
            overflowX: "hidden !important", // bloqueia qualquer expansão horizontal
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowX: "hidden !important",
          },
        }}
      />
    </Paper>
  );
}
