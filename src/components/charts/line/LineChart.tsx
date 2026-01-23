import { useMemo } from "react";
import { BaseChart } from "../BaseChart";
import { buildLineChartOption } from "./buildLineChartOption";

type LineChartDatum = {
  label: string;
  value: number;
};

type LineChartProps = {
  data: LineChartDatum[];
  height?: number;
  loading?: boolean;
};

export function LineChart({
  data,
  height = 300,
  loading = false,
}: LineChartProps) {

  const empty = !data || data.length === 0;

  const option = useMemo(() => {
    if (empty) return undefined;
    return buildLineChartOption({ data });
  }, [data, empty]);

  return (
    <BaseChart
      option={option as any}
      height={height}
      loading={loading}
      empty={empty}
    />
  );
}
