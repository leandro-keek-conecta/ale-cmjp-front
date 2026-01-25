import { useMemo } from "react";
import { BaseChart } from "../BaseChart";
import { buildPieChartOption } from "./buildPieChartOption";

type PieChartDatum = {
  label: string;
  value: number;
};

type PieChartProps = {
  data: PieChartDatum[];
  height?: number;
  loading?: boolean;
};

export function PieChart({
  data,
  height = 260,
  loading = false,
}: PieChartProps) {
  const empty = !data || data.length === 0;

  const option = useMemo(() => {
    if (empty) return undefined;
    return buildPieChartOption({ data });
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
