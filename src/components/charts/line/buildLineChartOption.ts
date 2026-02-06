import type { EChartsOption } from "echarts";

type LineChartDatum = {
  label: string;
  value: number;
};

type BuildLineChartOptionParams = {
  data: LineChartDatum[];
};

export function buildLineChartOption({
  data,
}: BuildLineChartOptionParams): EChartsOption {
  const xAxisData = data.map((item) => item.label);
  const seriesData = data.map((item) => item.value);

  return {
    grid: {
      left: 0,
      right: 8,
      top: 25,
      bottom: 0,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "line",
        data: seriesData,
        smooth: false,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 3,
        },
        label: {
          show: true,
          position: "top",
          fontSize: 11,
          fontWeight: 600,
          color: "#334155",
          formatter: ({ value }) => `${value ?? ""}`,
        },
      },
    ],
  };
}
