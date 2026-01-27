import type { EChartsOption } from "echarts";

type BarRaceDatum = {
  label: string;
  value: number;
};

type BuildBarRaceOptionParams = {
  data: BarRaceDatum[];
};

export function buildBarRaceOption({
  data,
}: BuildBarRaceOptionParams): EChartsOption {
  const sorted = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  const labels = sorted.map((item) => item.label);
  const maxLabelLength = labels.reduce(
    (max, label) => Math.max(max, label.length),
    0
  );
  const leftPadding = Math.min(
    12,
    Math.max(72, Math.round(maxLabelLength * 7))
  );

  return {
    grid: {
      left: leftPadding,
      right: 50,
      top: 0,
      bottom: 10,
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },

    yAxis: {
      type: "category",
      inverse: true, // ranking do maior para o menor
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#334155",
        fontSize: 12,
        fontWeight: 500,
        margin: 12,
      },
    },

    series: [
      {
        type: "bar",
        data: sorted.map((i) => i.value),
        barWidth: 16,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
        },
        label: {
          show: true,
          position: "right",
          color: "#0f172a",
          fontWeight: 600,
        },
      },
    ],
    animationDuration: 1000,
    animationEasing: "cubicOut",
  };
}
