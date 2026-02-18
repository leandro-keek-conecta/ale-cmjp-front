import { AppBar } from "@mui/material";
import { styled } from "@mui/material/styles";

const CabecalhoEstilizado = styled(AppBar)(({ theme }) => ({
  backgroundColor: "white",
  color: "#333333",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  zIndex: theme.zIndex.drawer + 1,
}));

export default CabecalhoEstilizado;
