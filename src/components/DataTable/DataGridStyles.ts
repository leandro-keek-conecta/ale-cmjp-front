import { styled } from "@mui/material/styles";
import { DataGrid, gridClasses } from "@mui/x-data-grid";

export const WhiteDataGrid = styled(DataGrid)(() => ({
  backgroundColor: "white",
  [`& .${gridClasses.cell}`]: {
    backgroundColor: "white",
  },
  [`& .${gridClasses.columnHeaders}`]: {
    backgroundColor: "white",
    borderRadius: "18px 8px 0 0",
  },
  [`& .${gridClasses.columnHeader}`]: {
    backgroundColor: "white",
  },
  [`& .${gridClasses.row}`]: {
    backgroundColor: "white",
  },
}));
