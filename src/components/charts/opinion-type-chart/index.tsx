import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import styles from "./OpinionTypeChart.module.css";

type OpinionTypeDatum = {
  type: string;
  count: number;
};

type OpinionTypeChartProps = {
  data: OpinionTypeDatum[];
  height?: number;
};

export const palette = [
  "#2563EB",
  "#0EA5E9",
  "#22C55E",
  "#F59E0B",
  "#6366F1",
  "#64748B",
];

export default function OpinionTypeChart({
  data,
  height = 150,
}: OpinionTypeChartProps) {
  const seriesData = useMemo(
    () =>
      data
        .map((item) => ({
          name: item.type?.trim() || "Sem categoria",
          value: item.count,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value),
    [data],
  );

  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      color: palette,
      tooltip: {
        trigger: "item",
        formatter: ({ name, value, percent }: any) =>
          `${name}<br/><strong>${value}</strong> (${percent}%)`,
      },

      legend: {
        bottom: 0,
        left: "center",
        textStyle: {
          color: "#475569", // slate-600
          fontSize: 12,
          fontWeight: 500,
        },
      },
      series: [
        {
          name: "Distribuicao",
          type: "pie",
          radius: ["38%", "70%"],
          center: ["50%", "42%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            scale: true,
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 700,
            },
          },
          labelLine: {
            show: false,
          },
          data: seriesData,
        },
      ],
      aria: {
        enabled: true,
      },
    }),
    [seriesData],
  );

  if (!seriesData.length) {
    return <div className={styles.empty}>Sem dados para exibir.</div>;
  }

  return (
    <div className={styles.chartRoot}>
      <ReactECharts option={option} style={{ height, width: "100%" }} />
    </div>
  );
}
