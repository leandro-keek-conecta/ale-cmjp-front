import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import styles from "./search.module.css";
import type { ProjectCardData } from "../Projetos";

interface projectsProps {
  projects: ProjectCardData[];
  onSelect?: () => void;
}

export default function SearchProjects({ projects, onSelect }: projectsProps) {
  return (
    <Box className={styles.SearchContainer}>
      <Box className={styles.leftContent}>
        <Typography className={styles.titleContent}>Meus Projetos</Typography>
        <Typography className={styles.subtitleContent}>
          Dados dos projetos e pré-visualização
        </Typography>
      </Box>
      <Box className={styles.heightContent}>
        <Box className={styles.searchComponent}>
          {" "}
          <Autocomplete
            size="small"
            options={projects}
            getOptionLabel={(option) => option.name}
            onChange={(_, selected) => {
              // selected é o projeto completo
            }}
            renderInput={(params) => <TextField {...params} label="Projeto" />}
          />
        </Box>
        <Box className={styles.searchButtom}>
          <Button
            variant="contained"
            className={styles.enterButton}
            onClick={onSelect}
            disabled={!onSelect}
          >
            Acessar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
