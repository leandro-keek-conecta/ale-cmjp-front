import { Box, Divider, Paper, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import CardDetails from "../../components/cardDetails";
import Search from "../../components/search";
import type { Opinion } from "../home/HomePage";

const demoOpinions: Opinion[] = [
  {
    id: 1,
    nome: "Ana",
    bairro: "Centro",
    opiniao: "Transporte",
    tipo_opiniao: "Sugestão",
    texto_opiniao:
      "Mais linhas de ônibus nos horários de pico ajudariam demais.",
    horario: "2025-01-01T10:00:00",
  },
  {
    id: 2,
    nome: "Bruno",
    bairro: "Bancários",
    opiniao: "Segurança",
    tipo_opiniao: "Reclamação",
    texto_opiniao: "Faltam patrulhas à noite perto da praça principal.",
    horario: "2025-01-02T09:30:00",
  },
  {
    id: 3,
    nome: "Carla",
    bairro: "Manaíra",
    opiniao: "Lazer",
    tipo_opiniao: "Elogio",
    texto_opiniao: "As novas áreas verdes ficaram ótimas para caminhar.",
    horario: "2025-01-02T14:15:00",
  },
  {
    id: 4,
    nome: "Diego",
    bairro: "Tambaú",
    opiniao: "Iluminação",
    tipo_opiniao: "Sugestão",
    texto_opiniao: "Seria bom trocar as lâmpadas da avenida principal.",
    horario: "2025-01-03T08:45:00",
  },
  {
    id: 5,
    nome: "Elaine",
    bairro: "Jaguaribe",
    opiniao: "Saúde",
    tipo_opiniao: "Denúncia",
    texto_opiniao: "Campanhas de vacinação estão funcionando bem.",
    horario: "2025-01-03T11:10:00",
  },
];

const SearchCardsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const opinionOptions = useMemo(
    () =>
      Array.from(
        new Set(
          demoOpinions
            .map((item) => item.opiniao)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [],
  );

  const filteredOpinions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return demoOpinions;

    return demoOpinions.filter((item) =>
      [
        item.nome,
        item.bairro,
        item.opiniao,
        item.tipo_opiniao,
        item.texto_opiniao,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [searchTerm]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f5f7fa 0%, #ffffff 50%)",
        py: 6,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 960,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Playground de Busca
        </Typography>
        <Typography variant="body1" sx={{ color: "text.primary" }}>
          Exemplo mínimo: campo Search (MUI Autocomplete) + CardDetails. Digite
          algo e veja os cartões sendo filtrados em tempo real.
        </Typography>

        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: 700, color: "text.primary" }}
          >
            Buscar
          </Typography>
          <Search
            opiniao={opinionOptions}
            onSearchChange={setSearchTerm}
            placeholder="Busque por nome, bairro ou tema"
          />
        </Paper>

        <Divider />

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          Resultados ({filteredOpinions.length})
        </Typography>
        <CardDetails opinions={filteredOpinions} />
      </Box>
    </Box>
  );
};

export default SearchCardsPage;
