import { useMemo } from "react";
import { BaseChart } from "../BaseChart";
import { buildBarChartOption } from "./buildBarChartOption";

type BarChartDatum = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarChartDatum[];
  height?: number;
  loading?: boolean;
};

export function BarChart({
  data,
  height = 260,
  loading = false,
}: BarChartProps) {
  const empty = !data || data.length === 0;

  const option = useMemo(() => {
    if (empty) return undefined;
    return buildBarChartOption({ data });
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
