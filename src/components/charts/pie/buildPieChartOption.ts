import type { EChartsOption } from "echarts";

type PieChartDatum = {
  label: string;
  value: number;
};

type BuildPieChartOptionParams = {
  data: PieChartDatum[];
};

export function buildPieChartOption({
  data,
}: BuildPieChartOptionParams): EChartsOption {
  const seriesData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },

    legend: {
      bottom: 0,
      left: "center",
      textStyle: {
        fontSize: 11,
        color: "#64748b",
      },
    },

    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "45%"],
        data: seriesData,
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        label: {
          show: true,
          position: "outside",
          formatter: ({ value, percent }) => `${value} (${percent}%)`,
          fontSize: 11,
          fontWeight: 600,
          color: "#334155",
        },
        labelLine: {
          show: true,
          length: 12,
          length2: 8,
          smooth: true,
          lineStyle: {
            color: "#94a3b8",
            width: 1,
          },
        },
        emphasis: {
          scale: true,
          label: {
            show: true,
            formatter: "{b}",
            fontSize: 12,
            fontWeight: 600,
          },
        },
      },
    ],
  };
}
