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
        radius: ["40%", "70%"], // donut
        center: ["50%", "45%"],
        data: seriesData,
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
        },
        emphasis: {
          scale: true,
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 600,
            formatter: "{b}\n{d}%",
          },
        },
      },
    ],
  };
}
