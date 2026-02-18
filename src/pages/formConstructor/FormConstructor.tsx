import { Box } from "@mui/material";
import styles from "./formcontructor.module.css";
import CabecalhoEstilizado from "@/components/CabecalhoEstilizado";

export default function FormConstructor() {
  return (
    <Box className={styles.container}>
      <CabecalhoEstilizado
        position="relative"
        sx={{
          zIndex: 0,
          height: "3rem",
          display: "flex",
          justifyContent: "center",
        }}
      />

      <Box className={styles.bodyContent}>
        <Box className={styles.leftContent}></Box>
        <Box className={styles.hightContent}></Box>
      </Box>
    </Box>
  );
}
