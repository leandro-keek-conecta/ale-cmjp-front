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
  slideBadge: string;
  slideMapTitle: string;
  slideMapSubtitle: string;
  slide1_title: string;
  slide1_description: string;
  slide1_image: string | FileList;
  slide2_title: string;
  slide2_description: string;
  slide2_image: string | FileList;
  slide3_title: string;
  slide3_description: string;
  slide3_image: string | FileList;
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
  clima_metric: PanoramaMetricKey | "";
  clima_title: string;
  clima_subtitle: string;
};

type SlideInputsOptions = {
  showHero?: boolean;
  includeHero?: boolean;
};

type ThemeInputsOptions = {
  selectedMetrics?: (PanoramaMetricKey | "")[];
  cardsCount?: number;
  climaMetric?: PanoramaMetricKey | "";
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
    "Veja o que as pessoas estão falando, explore temas e acompanhe como as opiniões evoluem.",
  slideBadge: "Assistente virtual",
  slideMapTitle: "Presenca ativa nos bairros",
  slideMapSubtitle: "Participacao cidada descomplicada e eficiente",
  slide1_title: "Pronta para responder",
  slide1_description:
    "Interface humanizada para tirar duvidas da populacao a qualquer hora.",
  slide1_image: "https://s3.keekconecta.com.br/ale-cmjp/fotos/ale-1.jpg",
  slide2_title: "Assistente presente nas ruas",
  slide2_description:
    "Registra solicitacoes diretamente dos bairros e agiliza o atendimento.",
  slide2_image: "https://s3.keekconecta.com.br/ale-cmjp/fotos/ale-2.jpg",
  slide3_title: "Conversas claras e objetivas",
  slide3_description:
    "Painel mostra o que esta acontecendo em tempo real, sem complicacao.",
  slide3_image: "https://s3.keekconecta.com.br/ale-cmjp/fotos/ale-5.png",
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
  clima_metric: "by_type",
  clima_title: "Clima geral",
  clima_subtitle: "Distribuição das opiniões",
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
      name: "slideBadge",
      title: "Badge do slide",
      placeholder: "Assistente virtual",
      type: "text",
      colSpan: 12,
      containerClassName: heroClassName,
      sectionTitle: "Slide",
    },
    {
      name: "slideMapTitle",
      title: "Título do card do slide",
      placeholder: "Presenca ativa nos bairros",
      type: "text",
      colSpan: 12,
      containerClassName: heroClassName,
    },
    {
      name: "slideMapSubtitle",
      title: "Subtitulo do card do slide",
      placeholder: "Participacao cidada descomplicada e eficiente",
      type: "text",
      colSpan: 12,
      containerClassName: heroClassName,
    },
    {
      name: "slide1_title",
      title: "Título do slide 1",
      placeholder: "Pronta para responder",
      type: "text",
      colSpan: 12,
      containerClassName: heroClassName,
      sectionTitle: "Slides",
    },
    {
      name: "slide1_description",
      title: "Descrição do slide 1",
      placeholder: "Interface humanizada para tirar duvidas...",
      type: "text",
      colSpan: 12,
      containerClassName: heroClassName,
    },
    {
      name: "slide1_image",
      title: "Imagem do slide 1",
      placeholder: "Selecione uma imagem",
      type: "inputFile",
      colSpan: 12,
      containerClassName: heroClassName,
    },
    {
      name: "slide2_title",
      title: "Título do slide 2",
      placeholder: "Assistente presente nas ruas",
      type: "text",
      colSpan: 6,
      containerClassName: heroClassName,
    },
    {
      name: "slide2_description",
      title: "Descrição do slide 2",
      placeholder: "Registra solicitacoes diretamente...",
      type: "text",
      colSpan: 6,
      containerClassName: heroClassName,
    },
    {
      name: "slide2_image",
      title: "Imagem do slide 2",
      placeholder: "Selecione uma imagem",
      type: "inputFile",
      colSpan: 12,
      containerClassName: heroClassName,
    },
    {
      name: "slide3_title",
      title: "Título do slide 3",
      placeholder: "Conversas claras e objetivas",
      type: "text",
      colSpan: 6,
      containerClassName: heroClassName,
    },
    {
      name: "slide3_description",
      title: "Descrição do slide 3",
      placeholder: "Painel mostra o que esta acontecendo...",
      type: "text",
      colSpan: 6,
      containerClassName: heroClassName,
    },
    {
      name: "slide3_image",
      title: "Imagem do slide 3",
      placeholder: "Selecione uma imagem",
      type: "inputFile",
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
  const climaMetric = options.climaMetric ?? "";

  const getMetricOptions = (index: number) => {
    const taken = new Set(
      selectedMetrics
        .filter((value, idx) => idx !== index && value)
        .concat(climaMetric ? [climaMetric] : []),
    );
    return panoramaOptions.filter(
      (option) =>
        !taken.has(option.value) || option.value === selectedMetrics[index],
    );
  };

  const getClimaMetricOptions = () => {
    const taken = new Set(selectedMetrics.filter(Boolean));
    return panoramaOptions.filter(
      (option) => !taken.has(option.value) || option.value === climaMetric,
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
      name: "kicker",
      title: "Kicker",
      placeholder: "Texto pequeno acima do titulo",
      type: "text",
      colSpan: 12,
      sectionTitle: "Hero",
    },
    {
      name: "title",
      title: "Título",
      placeholder: "Parte principal do titulo",
      type: "text",
      colSpan: 8,
    },
    {
      name: "highlight",
      title: "Highlight",
      placeholder: "Parte colorida do titulo",
      type: "text",
      colSpan: 4,
    },
    {
      name: "highlightTone",
      title: "Cor do highlight",
      type: "Select",
      selectOptions: highlightToneOptions,
      colSpan: 12,
    },
    {
      name: "subtitle",
      title: "Subtitle",
      placeholder: "Texto de apoio",
      type: "textarea",
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
        title: "Título",
        placeholder: "Título do card",
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
      name: "clima_metric",
      title: "Metrica",
      type: "Select",
      selectOptions: getClimaMetricOptions(),
      colSpan: 12,
      sectionTitle: "Clima geral",
    },
    {
      name: "clima_title",
      title: "Título",
      placeholder: "Clima geral",
      type: "text",
      colSpan: 6,
    },
    {
      name: "clima_subtitle",
      title: "Subtitulo",
      placeholder: "Distribuição das opiniões",
      type: "text",
      colSpan: 6,
    },
  ];

  return [...baseInputs, ...cardInputs, ...climaInputs];
};

