import type { EChartsOption } from "echarts";

type BarChartDatum = {
  label: string;
  value: number;
};

type BuildBarChartOptionParams = {
  data: BarChartDatum[];
};

export function buildBarChartOption({
  data,
}: BuildBarChartOptionParams): EChartsOption {
  const xAxisData = data.map((item) => item.label);
  const seriesData = data.map((item) => item.value);

  return {
    grid: {
      left: 0,
      right: 0,
      top: 25,
      bottom: 0,
      containLabel: true,
    },

    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },

    xAxis: {
      type: "category",
      data: xAxisData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
      },
    },

    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#94a3b8",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
          type: "dashed",
        },
      },
    },

    series: [
      {
        type: "bar",
        data: seriesData,
        barWidth: "50%",
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          color: "#334155",
          fontWeight: 600,
          fontSize: 11,
          formatter: ({ value }) => `${value ?? ""}`,
        },
      },
    ],
  };
}
