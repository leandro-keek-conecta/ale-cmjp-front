import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import styles from "./search.module.css";
import type { ProjectCardData } from "../Projetos";

interface ProjectsProps {
  projects: ProjectCardData[];
  selectedProject: ProjectCardData | null;
  onProjectChange: (project: ProjectCardData | null) => void;
  onCreateProject?: () => void;
}

export default function SearchProjects({
  projects,
  selectedProject,
  onProjectChange,
  onCreateProject,
}: ProjectsProps) {
  return (
    <Box className={styles.SearchContainer}>
      <Box className={styles.leftContent}>
        <Typography className={styles.titleContent}>Meus Projetos</Typography>
        <Typography className={styles.subtitleContent}>
          Dados dos projetos e pre-visualizacao
        </Typography>
      </Box>
      <Box className={styles.heightContent}>
        <Box className={styles.searchComponent}>
          <Autocomplete
            size="small"
            options={projects}
            value={selectedProject}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            onChange={(_, project) => onProjectChange(project)}
            renderInput={(params) => <TextField {...params} label="Projeto" />}
          />
        </Box>
        <Box className={styles.searchButtom}>
          <Button
            variant="contained"
            className={styles.enterButton}
            onClick={onCreateProject}
            disabled={!onCreateProject}
          >
            Criar novo projeto
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
