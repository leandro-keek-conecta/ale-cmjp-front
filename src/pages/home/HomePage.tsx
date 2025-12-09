import {
  Box,
  Button,
  Pagination,
  Slide,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Add,
  ChatBubbleOutline,
  HandshakeOutlined,
  InsertChartOutlined,
  LightbulbOutlined,
  LocationOnOutlined,
  PriorityHigh,
  StarBorderRounded,
  ThermostatOutlined,
  ArrowBackIosNew,
  ArrowForwardIos,
} from "@mui/icons-material";

import styles from "./HomePage.module.css";
import { useEffect, useMemo, useState } from "react";
import CardGrid from "../../components/card-grid";
import CardGridReflect from "../../components/card-grid-reflect";
import Search from "../../components/search";
import CardDetails from "../../components/cardDetails";
import {
  getAllOpinions,
  getTodayOpinions,
  getUpDistricts,
} from "../../services/opiniao/opiniaoService";
import SlideComponent from "../../components/slide";

export type Opinion = {
  id: number | string;
  usuario_id?: number | string;
  nome?: string;
  telefone?: string;
  bairro?: string;
  campanha?: string;
  horario?: string | null;
  acao?: string;
  opiniao: string;
  outra_opiniao?: string;
  tipo_opiniao?: string;
  texto_opiniao?: string;
};
const fallbackOpinions: Opinion[] = [
  { id: 1, telefone: "99999-9999", opiniao: "Reclamação" },
  { id: 2, telefone: "88888-8888", opiniao: "Sugestão" },
  { id: 3, telefone: "77777-7777", opiniao: "Apoio" },
  { id: 4, telefone: "66666-6666", opiniao: "Elogio" },
  { id: 5, telefone: "55555-5555", opiniao: "Reclamação" },
  { id: 6, telefone: "44444-4444", opiniao: "Sugestão" },
  { id: 7, telefone: "33333-3333", opiniao: "Apoio" },
  { id: 8, telefone: "22222-2222", opiniao: "Elogio" },
];

const typeOfFilter = {
  title: "Tipo de Opiniao",
  options: ["Reclamação", "Sugestão", "Apoio", "Elogio"],
};



export default function HomePage() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [todayOpinions, setTodayOpinions] = useState<Opinion[]>([]);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [itensPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  function IInicial(currentPage: number, itensPerPage: number) {
    return (currentPage - 1) * itensPerPage;
  }

  function IFinal(currentPage: number, itensPerPage: number) {
    // Removendo o -1 e usando a variável
    return currentPage * itensPerPage;
  }
  
  async function fetchTodayOpinions() {
    try {
      const response = await getTodayOpinions();
      const responseTwo = await getUpDistricts();
      setTodayOpinions(response);
    } catch (err) {
      setError("Erro ao carregar opinioes de hoje.");
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm]);

  async function fetchOpinions() {
    try {
      const response = await getAllOpinions();
      setOpinions(Array.isArray(response) ? response : []);
    } catch (err) {
      setError("Erro ao carregar opinioes.");
    }
  }

  useEffect(() => {
    console.log(filteredOpinions); //
    fetchOpinions();
    fetchTodayOpinions();
  }, []);

  useEffect(() => {
    if (opinions.length) {
      console.log("Opinions carregadas:", opinions);
    }
  }, [opinions]);



  const uniqueCountBy = (
    items: Opinion[],
    selector: (item: Opinion) => string
  ) => {
    const set = new Set<string>();
    items.forEach((item) => {
      const key = selector(item);
      if (key) set.add(key);
    });
    return set.size;
  };

  const normalizeType = (item: Opinion) =>
    (item.tipo_opiniao || item.opiniao || "").trim().toLowerCase();

  const sourceOpinions = opinions.length ? opinions : fallbackOpinions;

  const filteredOpinions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sourceOpinions.filter((item) => {
      const matchesType =
        filterType === "all" ||
        normalizeType(item) === filterType.toLowerCase();
      const matchesSearch =
        !term ||
        (item.nome && item.nome.toLowerCase().includes(term)) ||
        (item.bairro && item.bairro.toLowerCase().includes(term)) ||
        (item.texto_opiniao &&
          item.texto_opiniao.toLowerCase().includes(term)) ||
        (item.opiniao && item.opiniao.toLowerCase().includes(term));

      return matchesType && matchesSearch;
    });
  }, [filterType, searchTerm, sourceOpinions]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOpinions.length / itensPerPage)
  );

  const paginatedOpinions = useMemo(
    () =>
      filteredOpinions.slice(
        IInicial(currentPage, itensPerPage),
        IFinal(currentPage, itensPerPage)
      ),
    [filteredOpinions, currentPage, itensPerPage]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const typeCounts = typeOfFilter.options.map((type) => {
    const normalized = type.toLowerCase();
    return {
      type,
      count: sourceOpinions.filter((item) => normalizeType(item) === normalized)
        .length,
    };
  });

  const renderTypeIcon = (type: string) => {
    const key = type.toLowerCase();
    if (key === "reclamação") return <PriorityHigh fontSize="small" />;
    if (key === "Sugestão") return <LightbulbOutlined fontSize="small" />;
    if (key === "apoio") return <HandshakeOutlined fontSize="small" />;
    if (key === "elogio") return <StarBorderRounded fontSize="small" />;
    return <ChatBubbleOutline fontSize="small" />;
  };

  return (
    <Box className={styles.container}>
      <Box component="header" className={styles.hero}>
        <SlideComponent />
        <Box className={styles.heroTop}>
          <CardGrid span={3}>
            <Typography
              sx={{
                fontSize: "13px",
                letterSpacing: "0.04em",
                textAlign: "center",
                color: "var(--accent-2)",
                justifyContent: "center",
                width: "100%",
                fontWeight: 600,
              }}
            >
              Monitorando a voz da cidade
            </Typography>
          </CardGrid>
          <Button
            className={styles.ctaButton}
            startIcon={<Add />}
            aria-label="Cadastrar nova opiniao"
          >
            Cadastrar Opiniao
          </Button>
        </Box>
        <Typography
          variant="h3"
          sx={{ fontWeight: "bold", mt: 2, mb: 1, color: "var(--text)" }}
        >
          Opiniao em tempo real{" "}
          <span className={styles.gradientText}>sem login</span>
        </Typography>
        <Typography variant="body1" sx={{ mb: 0, color: "var(--muted)" }}>
          Veja o que as pessoas estao falando, explore temas e acompanhe como as
          opinioes evoluem.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: "var(--muted)" }}>
          Inspirado em sites de streaming de dados com foco em clareza e
          movimento.
        </Typography>
        <Box className={styles.statsRow}>
          <CardGridReflect span={4} className={styles.statCard}>
            <div className={styles.statHeader}>
              <InsertChartOutlined className={styles.statIcon} />
              <div>
                <div className={styles.statLabel}>Opinioes de hoje</div>
                <div className={styles.statHint}>Total registradas</div>
              </div>
            </div>
            {/* _________________________________________ */}
            <div className={styles.statValue}>
              {todayOpinions.length }
            </div>
            <div className={styles.statHint}>
              Atualiza assim que a API responder.
            </div>
          </CardGridReflect>
          <CardGridReflect span={4} className={styles.statCard}>
            <div className={styles.statHeader}>
              <LocationOnOutlined className={styles.statIcon} />
              <div>
                <div className={styles.statLabel}>Bairros mais ativos</div>
                <div className={styles.statHint}>Participacao distribuida</div>
              </div>
            </div>
            <div className={styles.statValue}>
              {uniqueCountBy(sourceOpinions, (op) => op.bairro || "")}
            </div>
            <div className={styles.statHint}>Usuarios unicos por bairro</div>
          </CardGridReflect>
          <CardGridReflect
            span={6}
            className={`${styles.statCard} ${styles.wideCard}`}
          >
            <div className={styles.statHeader}>
              <ThermostatOutlined className={styles.statIcon} />
              <div>
                <div className={styles.statLabel}>Clima geral</div>
                <div className={styles.statHint}>Distribuicao das opinioes</div>
              </div>
            </div>
            <div className={styles.typeChips}>
              {typeCounts.map(({ type, count }) => (
                <span
                  key={type}
                  className={styles.typeChip}
                  data-type={type}
                  aria-label={`${type} (${count})`}
                >
                  <span className={styles.typeIcon}>
                    {renderTypeIcon(type)}
                  </span>
                  <span>{type}</span>
                  <span className={styles.typeCount}>{count}</span>
                </span>
              ))}
            </div>
            {error ? <div className={styles.statHint}>{error}</div> : null}
          </CardGridReflect>
        </Box>
        <CardGrid className={styles.searchCard} span={12}>
          <div className={styles.searchHeader}>
            <div className={styles.searchIntro}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "var(--text)" }}
              >
                Buscar opinioes
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "var(--muted)", marginTop: "4px" }}
              >
                Filtre por tema e encontre rapidamente o que importa.
              </Typography>
            </div>
          </div>
          <div className={styles.controls}>
            <div className={styles.searchInput}>
              <Search
                opiniao={[...new Set(opinions.map((op) => op.opiniao))]}
                onSearchChange={setSearchTerm}
                placeholder="Buscar por nome, bairro ou tema"
              />
            </div>
            <ToggleButtonGroup
              exclusive
              value={filterType}
              onChange={(_, value) => value && setFilterType(value)}
              className={styles.filterGroup}
              aria-label="Filtrar por tipo de opiniao"
            >
              <ToggleButton value="all">Todas</ToggleButton>
              {typeOfFilter.options.map((option) => (
                <ToggleButton key={option} value={option}>
                  {option}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </CardGrid>

        <Box className={styles.opinionsContainer}>
          <CardDetails opinions={paginatedOpinions} />
        </Box>
        <Box sx={{ width: "100%" }}>
          <Pagination
            page={currentPage}
            count={totalPages}
            onChange={(_, page) => setCurrentPage(page)}
          />
        </Box>
      </Box>
    </Box>
  );
}
