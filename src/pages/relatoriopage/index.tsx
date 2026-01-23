import { Box } from "@mui/material";
import { Layout } from "../../components/layout/Layout";
import styles from "./RelatorioPage.module.css";
import CardGridReflect from "../../components/card-grid-reflect";
import { BarChart } from "../../components/charts/bar/BarChart";
import { GenericDataTable } from "../../components/DataTable";
import { temasColumns } from "./colunsOfThemaDay/colunsThemaData";
import { bairrosColumns } from "./colunsOfDistricts/colunsDistrictsData";
import { LineChart } from "../../components/charts/line/LineChart";
import { PieChart } from "../../components/charts/pie/PieChart";
import { BarRaceChart } from "../../components/charts/barRace/BarRaceChart";

const topBairros = [
  { label: "Mangabeira", value: 182 },
  { label: "Bancários", value: 160 },
  { label: "Valentina", value: 148 },
  { label: "Tambaú", value: 132 },
  { label: "Manaíra", value: 121 },
  { label: "Cruz das Armas", value: 98 },
  { label: "Geisel", value: 87 },
  { label: "Jaguaribe", value: 75 },
  { label: "Altiplano", value: 64 },
  { label: "Cristo", value: 52 },
];

const topTemas = [
  { id: 1, tema: "Saúde", total: 210 },
  { id: 2, tema: "Educação", total: 184 },
  { id: 3, tema: "Transporte", total: 160 },
  { id: 4, tema: "Segurança", total: 142 },
  { id: 5, tema: "Infraestrutura", total: 118 },
  { id: 6, tema: "Iluminação Pública", total: 96 },
  { id: 7, tema: "Limpeza Urbana", total: 82 },
  { id: 8, tema: "Habitação", total: 64 },
  { id: 9, tema: "Meio Ambiente", total: 51 },
  { id: 10, tema: "Assistência Social", total: 43 },
];

const opinionsByGender = [
  { label: "Masculino", value: 320 },
  { label: "Feminino", value: 280 },
  { label: "Não informado", value: 40 },
];

const campaignAcceptance = [
  { label: "Aceitou", value: 410 },
  { label: "Não aceitou", value: 230 },
];

const opinionsByAge = [
  { label: "Até 18", value: 42 },
  { label: "19–25", value: 120 },
  { label: "26–35", value: 210 },
  { label: "36–45", value: 160 },
  { label: "46+", value: 90 },
];

const opinionsByMonth = [
  { label: "Jan", value: 120 },
  { label: "Fev", value: 98 },
  { label: "Mar", value: 143 },
  { label: "Abr", value: 160 },
  { label: "Mai", value: 132 },
];

const opinionsByDay = [
  { label: "01", value: 5 },
  { label: "02", value: 12 },
  { label: "03", value: 9 },
  { label: "04", value: 18 },
  { label: "05", value: 7 },
  { label: "06", value: 14 },
];

export const cardsData = [
  {
    id: 1,
    title: "Quantidade Total de Opiniões",
    subtitle: "815",

    content: "Conteúdo do Card 1",
  },
  {
    id: 2,
    title: "Quantidade Total de Reclamações",
    subtitle: "56",
    content: "Conteúdo do Card 2",
  },
  {
    id: 3,
    title: "Quantidade Total de Elogios",
    subtitle: "500",
    content: "Conteúdo do Card 3",
  },
  {
    id: 4,
    title: "Quantidade Total de Sugestões",
    subtitle: "1.200",
    content: "Conteúdo do Card 4",
  },
];

export const lineaCardData = [
  {
    id: 1,
    title: "Quantidade de Opiniões Mês a Mês",
    content: "Conteúdo do Linea Card 1",
  },
  {
    id: 2,
    title: "Quantidade de Opiniões Dia a Dia (mês atual)",
    content: "Conteúdo do Linea Card 2",
  },
];

export const ondeLineCardData = [
  {
    id: 1,
    title: "Quantidade de Opiniões por Faixa Etária → Barras",
    content: { opinionsByAge },
  },
  {
    id: 2,
    title: "Quantidade de Opiniões por Gênero",
    content: "Conteúdo do Onde Line Card 2",
  },
  {
    id: 3,
    title: "Aceitou vs Não aceitou campanha",
    content: "Conteúdo do Onde Line Card 3",
  },
];

export const tableCardData = [
  {
    id: 1,
    title: "Top 10 bairros com mais opiniões",
    content: "Conteúdo do Linea Card 1",
  },
  {
    id: 2,
    title: "Top temas mais falados",
    content: "Conteúdo do Linea Card 2",
  },
];

export default function RelatorioPage() {
  return (
    <Layout titulo="Tela de Relatório">
      <Box className={styles.container}>
        <Box className={styles.gridContainer}>
          {cardsData.map((card, index) => (
            <CardGridReflect
              key={index}
              children={
                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <h5>{card.title}</h5>
                  <h4>{card.subtitle}</h4>
                </Box>
              }
              span={4}
            />
          ))}
        </Box>
        <Box className={styles.gridContainer} sx={{ marginTop: "1rem" }}>
          <CardGridReflect span={6}>
            <h5>Quantidade de Opiniões Mês a Mês</h5>
            <LineChart data={opinionsByMonth} height={200} />
          </CardGridReflect>

          <CardGridReflect span={6}>
            <h5>Quantidade de Opiniões Dia a Dia (mês atual)</h5>
            <LineChart data={opinionsByDay} height={200} />
          </CardGridReflect>
        </Box>
        <Box className={styles.gridContainer} sx={{ marginTop: "1rem" }}>
          <CardGridReflect span={4}>
            <h5>Quantidade de Opiniões por Faixa Etária</h5>
              <Box sx={{ marginTop: "1rem" }}>
                <BarChart data={opinionsByAge} height={220} />
              </Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Quantidade de Opiniões por Gênero</h5>
            <Box sx={{ marginTop: "1rem" }}><PieChart data={opinionsByGender} height={220} /></Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Aceitou vs Não aceitou campanha</h5>
            <Box sx={{ marginTop: "1rem" }}><PieChart data={campaignAcceptance} height={220} /></Box>
          </CardGridReflect>
        </Box>

        <Box
          className={styles.gridContainerOndeLine}
          sx={{ marginTop: "1rem" }}
        >
          <CardGridReflect span={6} style={{ marginBottom: 0 }} disablePadding>
            <h5 style={{ margin: "1rem" }}>Top 10 bairros com mais opiniões</h5>
            <BarRaceChart data={topBairros} height={360} />
          </CardGridReflect>
          
          <CardGridReflect
            span={6}
            disablePadding
            style={{ display: "flex", flexDirection: "column"}}
          >
            <h5 style={{ margin: "1rem", marginBottom: "2rem" }}>Top temas mais falados</h5>
            <GenericDataTable
              rows={topTemas}
              columns={temasColumns}
              hideActions
              height="100%"
            />
          </CardGridReflect>
        </Box>
      </Box>
    </Layout>
  );
}
