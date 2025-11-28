import { Box, Card, Chip, Typography } from "@mui/material";
import styles from "./HomePage.module.css";
import { useState } from "react";
import CardGrid from "../../components/card-grid";
import CardGridReflect from "../../components/card-grid-reflect";
import AppChip from "../../components/chip";
import Search from "../../components/search";

type Opinion = {
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
  { id: 1, telefone: "99999-9999", opiniao: "Reclamacao" },
  { id: 2, telefone: "88888-8888", opiniao: "Sugestao" },
  { id: 3, telefone: "77777-7777", opiniao: "Apoio" },
  { id: 4, telefone: "66666-6666", opiniao: "Elogio" },
  { id: 5, telefone: "55555-5555", opiniao: "Reclamacao" },
  { id: 6, telefone: "44444-4444", opiniao: "Sugestao" },
  { id: 7, telefone: "33333-3333", opiniao: "Apoio" },
  { id: 8, telefone: "22222-2222", opiniao: "Elogio" },
];

const typeOfFilter = {
  title: "Tipo de Opinião",
  options: ["Reclamação", "Sugestão", "Apoio", "Elogio"],
}

export default function HomePage() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [error, setError] = useState("");

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

  return (
    <Box className={styles.container}>
      <Box component="header" className={styles.hero}>
        <CardGrid span={3}>
          <Typography sx={{ fontSize: "12px", letterSpacing: "0.08em", textAlign: "center", color: "var(--accent)", justifyContent: "center", width: "100%" }}>
            Monitorando a voz da cidade
          </Typography>
        </CardGrid>
        <Typography
          variant="h3"
          sx={{ fontWeight: "bold", mt: 2, mb: 1, color: "var(--text)" }}
        >
          Opinião em tempo real{" "}
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
        <Box
          sx={{
            display: "flex",
            gap: "16px",
          }}
        >
          <CardGridReflect span={4} className={styles.statCard}>
            <div className="stat-label">Opinioes de Hoje</div>
            <div className="stat-value">
              {opinions.length || fallbackOpinions.length}
            </div>
            <div className="stat-label">Um usuario pode ter varias opinioes.  </div>
          </CardGridReflect>
          <CardGridReflect span={4} className={styles.statCard}>
            <div className="stat-label">Bairros mais ativos</div>
            <div className="stat-value">
              {opinions.length || fallbackOpinions.length}
            </div>
            <div className="stat-label">Bairros com mais opinioes</div>
          </CardGridReflect>
          <CardGridReflect span={6} className={styles.cardRight}>
            <div className="stat-label">Clima geral</div>
            <Box
              sx={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                margin: "10px 20 6px",
              }}
            >
              <AppChip label="Reclamacao" color="error" />
              <AppChip label="Sugestao" color="warning" />
              <AppChip label="Apoio" color="info" />
              <AppChip label="Elogio" color="success" />
            </Box>
            <div className="stat-label">Distribuicao das opinioes</div>
          </CardGridReflect>
        </Box>
        <CardGrid className={styles.searchCard} span={12}>
          <Search opiniao={opinions.map(opinion => opinion.opiniao)} />
          {typeOfFilter.options.map((option) => (
            <Chip key={option} label={option} />
          ))}
        </CardGrid>
      </Box>
    </Box>
  );
}
