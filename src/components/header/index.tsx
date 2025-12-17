import { Box } from "@mui/material";
import styles from "./Header.module.css";
export default function Header() {
  return (
    <Box component="header" className={styles.header}>
      <Box className={styles.headerContent}>
        <img src="https://s3.keekconecta.com.br/ale-cmjp/fotos/logo-horizontal.png" alt="Logo Alê" height="40" />
        <img src="https://s3.keekconecta.com.br/ale-cmjp/fotos/ale-6.png" alt="Logo Alê" height="40" />
      </Box>
    </Box>
  );
}
