import {
  Autocomplete,
  Box,
  TextField,
  Button,
  InputAdornment,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import styles from "./search.module.css";
import type { ProjectCardData } from "../Projetos";

interface ProjectsProps {
  projects: ProjectCardData[];
  selectedProject: ProjectCardData | null;
  searchTerm: string;
  onProjectChange: (project: ProjectCardData | null) => void;
  onSearchTermChange: (term: string) => void;
  onCreateProject?: () => void;
}

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function SearchProjects({
  projects,
  selectedProject,
  searchTerm,
  onProjectChange,
  onSearchTermChange,
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
            className={styles.searchAutocomplete}
            size="small"
            options={projects}
            value={selectedProject}
            inputValue={searchTerm}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            filterOptions={(options, state) => {
              const term = normalizeSearch(state.inputValue);
              if (term.length < 3) {
                return options;
              }
              return options.filter((option) =>
                normalizeSearch(option.name).includes(term),
              );
            }}
            onInputChange={(_, value) => onSearchTermChange(value)}
            onChange={(_, project) => onProjectChange(project)}
            forcePopupIcon={false}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Pesquise seu projeto..."
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon className={styles.searchIcon} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </Box>
        <Box className={styles.searchButtom}>
          <Button
            variant="contained"
            className={styles.enterButton}
            onClick={onCreateProject}
            disabled={!onCreateProject}
          >
            Novo Projeto
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
