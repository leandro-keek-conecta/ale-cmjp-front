import type { InputType } from "@/components/Forms";
import styles from "../ProjetoTheme.module.css";

export const panoramaOptions = [
  {
    value: "opinions_today",
    label: "Opiniões de hoje",
    source: "summary.totalOpinionsToday",
  },
  {
    value: "top_themes",
    label: "Temas mais falados",
    source: "summary.topTemas",
  },
  {
    value: "top_neighborhoods",
    label: "Bairros mais ativos",
    source: "summary.topBairros",
  },
  {
    value: "total_opinions",
    label: "Total de opiniões",
    source: "report.cards.totalOpinions",
  },
  {
    value: "total_complaints",
    label: "Total de reclamações",
    source: "report.cards.totalComplaints",
  },
  {
    value: "total_praise",
    label: "Total de elogios",
    source: "report.cards.totalPraise",
  },
  {
    value: "total_suggestions",
    label: "Total de sugestões",
    source: "report.cards.totalSuggestions",
  },
  {
    value: "by_gender",
    label: "Opiniões por gênero",
    source: "report.opinionsByGender",
  },
  {
    value: "by_age",
    label: "Opiniões por faixa etária",
    source: "report.opinionsByAge",
  },
  {
    value: "by_type",
    label: "Tipos de opinião",
    source: "report.tipoOpiniao",
  },
  {
    value: "by_campaign",
    label: "Aceite por campanha",
    source: "report.campaignAcceptance",
  },
  {
    value: "status_funnel",
    label: "Funil de status",
    source: "report.statusFunnel",
  },
  {
    value: "trend_day",
    label: "Evolução por dia",
    source: "report.lineByDay",
  },
  {
    value: "trend_month",
    label: "Evolução por mês",
    source: "report.lineByMonth",
  },
] as const;

export type PanoramaMetricKey = (typeof panoramaOptions)[number]["value"];

export type ThemeFormValues = {
  showHero: boolean;
  background: string;
  fontFamily: string;
  kicker: string;
  title: string;
  highlight: string;
  highlightTone: "primary" | "accent" | "gradient";
  subtitle: string;
  cardsCount: number;
  card1_metric: PanoramaMetricKey | "";
  card1_title: string;
  card1_subtitle: string;
  card2_metric: PanoramaMetricKey | "";
  card2_title: string;
  card2_subtitle: string;
  card3_metric: PanoramaMetricKey | "";
  card3_title: string;
  card3_subtitle: string;
  card4_metric: PanoramaMetricKey | "";
  card4_title: string;
  card4_subtitle: string;
  card5_metric: PanoramaMetricKey | "";
  card5_title: string;
  card5_subtitle: string;
  card6_metric: PanoramaMetricKey | "";
  card6_title: string;
  card6_subtitle: string;
  climaReclamacao: number | string;
  climaSugestao: number | string;
  climaElogio: number | string;
  climaOutro: number | string;
};

type SlideInputsOptions = {
  showHero?: boolean;
  includeHero?: boolean;
};

type ThemeInputsOptions = {
  selectedMetrics?: (PanoramaMetricKey | "")[];
  cardsCount?: number;
};

const fontOptions = [
  { label: "Inter", value: "Inter" },
  { label: "Lato", value: "Lato" },
  { label: "Work Sans", value: "Work Sans" },
  { label: "Roboto", value: "Roboto" },
];

const highlightToneOptions = [
  { label: "Gradiente", value: "gradient" },
  { label: "Primary", value: "primary" },
  { label: "Accent", value: "accent" },
];

export const buildThemeDefaultValues = (): ThemeFormValues => ({
  showHero: true,
  background: "linear-gradient(180deg, #f4f4f4 0%, #f4f4f4 100%)",
  fontFamily: "Inter",
  kicker: "Monitorando a voz da cidade",
  title: "Opiniao em",
  highlight: "tempo real",
  highlightTone: "gradient",
  subtitle:
    "Veja o que as pessoas estao falando, explore temas e acompanhe como as opinioes evoluem.",
  cardsCount: 3,
  card1_metric: "opinions_today",
  card1_title: "Opiniões de hoje",
  card1_subtitle: "Total registradas",
  card2_metric: "top_themes",
  card2_title: "Temas mais falados",
  card2_subtitle: "Participação distribuída",
  card3_metric: "top_neighborhoods",
  card3_title: "Bairros mais ativos",
  card3_subtitle: "Participação distribuída",
  card4_metric: "",
  card4_title: "",
  card4_subtitle: "",
  card5_metric: "",
  card5_title: "",
  card5_subtitle: "",
  card6_metric: "",
  card6_title: "",
  card6_subtitle: "",
  climaReclamacao: 45,
  climaSugestao: 32,
  climaElogio: 51,
  climaOutro: 12,
});

export const getSlideInputs = (
  options: SlideInputsOptions = {},
): InputType<ThemeFormValues>[] => {
  const heroHidden = options.showHero === false;
  const heroClassName = heroHidden
    ? `${styles.heroInput} ${styles.heroInputHidden}`
    : styles.heroInput;
  const includeHero = options.includeHero !== false;

  const baseInputs: InputType<ThemeFormValues>[] = [
    {
      name: "showHero",
      title: "Mostrar hero com slide",
      type: "switch",
      colSpan: 12,
    },
  ];

  const heroInputs: InputType<ThemeFormValues>[] = [
    {
      name: "kicker",
      title: "Kicker",
      placeholder: "Texto pequeno acima do titulo",
      type: "text",
      colSpan: 12,
      containerClassName: heroClassName,
    },
    {
      name: "title",
      title: "Titulo",
      placeholder: "Parte principal do titulo",
      type: "text",
      colSpan: 8,
      containerClassName: heroClassName,
    },
    {
      name: "highlight",
      title: "Highlight",
      placeholder: "Parte colorida do titulo",
      type: "text",
      colSpan: 4,
      containerClassName: heroClassName,
    },
    {
      name: "highlightTone",
      title: "Cor do highlight",
      type: "Select",
      selectOptions: highlightToneOptions,
      colSpan: 12,
      containerClassName: heroClassName,
    },
    {
      name: "subtitle",
      title: "Subtitle",
      placeholder: "Texto de apoio",
      type: "textarea",
      colSpan: 12,
      containerClassName: heroClassName,
    },
  ];

  return includeHero ? [...baseInputs, ...heroInputs] : baseInputs;
};

export const getThemeInputs = (
  options: ThemeInputsOptions = {},
): InputType<ThemeFormValues>[] => {
  const cardsCount = Math.min(
    6,
    Math.max(1, Math.round(options.cardsCount ?? 3)),
  );
  const selectedMetrics = options.selectedMetrics ?? [];

  const getMetricOptions = (index: number) => {
    const taken = new Set(
      selectedMetrics.filter((value, idx) => idx !== index && value),
    );
    return panoramaOptions.filter(
      (option) => !taken.has(option.value) || option.value === selectedMetrics[index],
    );
  };

  const baseInputs: InputType<ThemeFormValues>[] = [
    {
      name: "background",
      title: "Background (CSS)",
      placeholder: "linear-gradient(...) ou #f5f5f5",
      type: "text",
      colSpan: 12,
    },
    {
      name: "fontFamily",
      title: "Fonte",
      type: "Select",
      selectOptions: fontOptions,
      colSpan: 12,
    },
    {
      name: "cardsCount",
      title: "Quantidade de cards",
      type: "Select",
      selectOptions: [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
        { label: "5", value: 5 },
        { label: "6", value: 6 },
      ],
      colSpan: 12,
    },
  ];

  const cardInputs: InputType<ThemeFormValues>[] = [];

  for (let index = 0; index < cardsCount; index += 1) {
    const cardIndex = index + 1;
    const metricName = `card${cardIndex}_metric` as InputType<ThemeFormValues>["name"];
    const titleName = `card${cardIndex}_title` as InputType<ThemeFormValues>["name"];
    const subtitleName = `card${cardIndex}_subtitle` as InputType<ThemeFormValues>["name"];

    cardInputs.push(
      {
        name: metricName,
        title: "Metrica",
        type: "Select",
        selectOptions: getMetricOptions(index),
        colSpan: 12,
        sectionTitle: `Card ${cardIndex}`,
      },
      {
        name: titleName,
        title: "Titulo",
        placeholder: "Titulo do card",
        type: "text",
        colSpan: 6,
      },
      {
        name: subtitleName,
        title: "Subtitulo",
        placeholder: "Subtitulo do card",
        type: "text",
        colSpan: 6,
      },
    );
  }

  const climaInputs: InputType<ThemeFormValues>[] = [
    {
      name: "climaReclamacao",
      title: "Clima - Reclamacao",
      placeholder: "45",
      type: "number",
      colSpan: 3,
    },
    {
      name: "climaSugestao",
      title: "Clima - Sugestao",
      placeholder: "32",
      type: "number",
      colSpan: 3,
    },
    {
      name: "climaElogio",
      title: "Clima - Elogio",
      placeholder: "51",
      type: "number",
      colSpan: 3,
    },
    {
      name: "climaOutro",
      title: "Clima - Outro",
      placeholder: "12",
      type: "number",
      colSpan: 3,
    },
  ];

  return [...baseInputs, ...cardInputs, ...climaInputs];
};
