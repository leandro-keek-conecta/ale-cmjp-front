import { useMemo } from "react";
import { BaseChart } from "../BaseChart";
import { buildBarRaceOption } from "./buildBarRaceOption";

type BarRaceDatum = {
  label: string;
  value: number;
};

type BarRaceChartProps = {
  data: BarRaceDatum[];
  height?: number;
  loading?: boolean;
};

export function BarRaceChart({
  data,
  height = 360,
  loading = false,
}: BarRaceChartProps) {
  const empty = !data || data.length === 0;

  const option = useMemo(() => {
    if (empty) return undefined;
    return buildBarRaceOption({ data });
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
