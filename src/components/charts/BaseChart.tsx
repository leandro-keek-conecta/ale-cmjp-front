import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { CircularProgress } from "@mui/material";

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
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={32} />
      </div>
    );
  }

  if (empty) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Sem dados para exibir
      </div>
    );
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
