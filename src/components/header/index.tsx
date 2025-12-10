import { Box } from "@mui/material";
import styles from "./Header.module.css";
import ale6 from "../../assets/ale/ale-6.png";
import keekLogo from "../../assets/ale/logo-horizontal.png";
export default function Header() {
  return (
    <Box component="header" className={styles.header}>
      <Box className={styles.headerContent}>
        <img src={keekLogo} alt="Logo Alê" height="40" />
        <img src={ale6} alt="Logo Alê" height="40" />
      </Box>
    </Box>
  );
}
