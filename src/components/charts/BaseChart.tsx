import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

type BaseChartProps = {
  option: EChartsOption;
  height?: number;
  loading?: boolean;
  empty?: boolean;
};

export function BaseChart({
  option,
  height = 300,
  loading = false,
  empty = false,
}: BaseChartProps) {

  if (loading) {
    return <div style={{ height }}>Carregando...</div>;
  }

  if (empty) {
    return <div style={{ height }}>Sem dados para exibir</div>;
  }

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      notMerge
      lazyUpdate
    />
  );
}
