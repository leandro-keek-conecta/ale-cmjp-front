import { Box } from "@mui/material";
import { Layout } from "../../components/layout/Layout";
import styles from "./RelatorioPage.module.css";
import CardGridReflect from "../../components/card-grid-reflect";
import { BarChart } from "../../components/charts/bar/BarChart";
import { GenericDataTable } from "../../components/DataTable";
import { temasColumns } from "./colunsOfThemaDay/colunsThemaData";
import { LineChart } from "../../components/charts/line/LineChart";
import { PieChart } from "../../components/charts/pie/PieChart";
import { BarRaceChart } from "../../components/charts/barRace/BarRaceChart";
import AnimatedNumber from "../../components/animated-number";
import { useEffect, useState } from "react";
import { getMetrics } from "../../services/relatorioPage/relatorioService";
import {
  groupOpinionsByMonthOnly,
  normalizeOpinionsByDay,
} from "../../utils/retornMonthInDate";

type ReportCards = {
  totalOpinions?: number | string;
  totalComplaints?: number | string;
  totalPraise?: number | string;
  totalKudos?: number | string;
  totalSuggestions?: number | string;
};

type ReportCard = {
  id: number;
  title: string;
  subtitle: number;
};

type ChartDatum = {
  label: string;
  value: number;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const buildCards = (cards?: ReportCards) => [
  {
    id: 1,
    title: "Quantidade Total de Opiniões",
    subtitle: toNumber(cards?.totalOpinions),
  },
  {
    id: 2,
    title: "Quantidade Total de Reclamações",
    subtitle: toNumber(cards?.totalComplaints),
  },
  {
    id: 3,
    title: "Quantidade Total de Elogios",
    subtitle: toNumber(cards?.totalPraise ?? cards?.totalKudos),
  },
  {
    id: 4,
    title: "Quantidade Total de Sugestões",
    subtitle: toNumber(cards?.totalSuggestions),
  },
];

export default function RelatorioPage() {
  const [cardsData, setCardsData] = useState<ReportCard[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [opinionsByDay, setOpinionsByDay] = useState<ChartDatum[]>([]);
  const [opinionsByMonth, setOpinionsByMonth] = useState<ChartDatum[]>([]);
  const [opinionsByGender, setOpinionsByGender] = useState<ChartDatum[]>([]);
  const [campaignAcceptance, setCampaignAcceptance] = useState<ChartDatum[]>(
    [],
  );
  const [opinionsByAge, setOpinionsByAge] = useState<ChartDatum[]>([]);
  const [topTemas, setTopTemas] = useState<any[]>([]);
  const [topBairros, setTopBairros] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true);
        const response = await getMetrics();

        if (!active) return;
        setCardsData(buildCards(response.cards));
        const rawOpinionsByMonth =
          response.lineByMonth ?? response.opinionsByMonth ?? [];
        setOpinionsByMonth(groupOpinionsByMonthOnly(rawOpinionsByMonth));
        const rawOpinionsByDay =
          response.lineByDay ?? response.opinionsByDay ?? [];
        setOpinionsByDay(normalizeOpinionsByDay(rawOpinionsByDay));

        setOpinionsByGender(response.opinionsByGender ?? []);
        setCampaignAcceptance(response.campaignAcceptance ?? []);
        const temasData = response.topTemas.map((item:any) =>({
          label: item.tema, value: item.total,
        }));
        setTopTemas(temasData);
        console.log("response.topTemas", response.topTemas);
        setTopBairros(response.topBairros ?? []);
        console.log("response.topBairros", response.topBairros);
        setOpinionsByAge(response.opinionsByAge ?? []);
      } catch (error) {
        if (!active) return;
      }
      if (active) {
        setMetricsLoading(false);
      }
    };

    void fetchMetrics();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Layout titulo="Tela de Relatório">
      <Box className={styles.container}>
        <Box className={styles.gridContainer}>
          {cardsData.map((card: any, index) => (
            <CardGridReflect
              key={index}
              children={
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h5>{card.title}</h5>
                  <h4>
                    <AnimatedNumber value={card.subtitle} />
                  </h4>
                </Box>
              }
              span={3}
            />
          ))}
        </Box>
        <Box className={styles.gridContainer} sx={{ marginTop: "1rem" }}>
          <CardGridReflect span={6}>
            <h5>Quantidade de Opiniões Mês a Mês</h5>
            <LineChart
              data={opinionsByMonth}
              height={200}
              loading={metricsLoading}
            />
          </CardGridReflect>

          <CardGridReflect span={6}>
            <h5>Quantidade de Opiniões Dia a Dia (mês atual)</h5>
            <LineChart
              data={opinionsByDay}
              height={200}
              loading={metricsLoading}
            />
          </CardGridReflect>
        </Box>
        <Box className={styles.gridContainer} sx={{ marginTop: "1rem" }}>
          <CardGridReflect span={4}>
            <h5>Quantidade de Opiniões por Faixa Etária</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <BarChart
                data={opinionsByAge}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Quantidade de Opiniões por Gênero</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <PieChart
                data={opinionsByGender}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>

          <CardGridReflect span={4}>
            <h5>Autorização de comunicação</h5>
            <Box sx={{ marginTop: "1rem" }}>
              <PieChart
                data={campaignAcceptance}
                height={220}
                loading={metricsLoading}
              />
            </Box>
          </CardGridReflect>
        </Box>

        <Box
          className={styles.gridContainerOndeLine}
          sx={{ marginTop: "1rem" }}
        >
          <CardGridReflect span={6} style={{ marginBottom: 0 }} disablePadding>
            <h5 style={{ margin: "1rem" }}>Top 10 bairros com mais opiniões</h5>
            <BarRaceChart
              data={topBairros}
              height={360}
              loading={metricsLoading}
            />
          </CardGridReflect>

          <CardGridReflect
            span={6}
            disablePadding
            className={styles.topTemasCard}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <h5 style={{ margin: "1rem", marginBottom: "2rem" }}>
              Top temas mais falados
            </h5>
            <BarRaceChart
              data={topTemas}
              height={360}
              loading={metricsLoading}
            />
          </CardGridReflect>
        </Box>
      </Box>
    </Layout>
  );
}
