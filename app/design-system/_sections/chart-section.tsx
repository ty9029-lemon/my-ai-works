"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Section } from "../_components/section";

/** 시간대별 러닝 지수 샘플 데이터 */
const CHART_DATA = [
  { hour: "06시", score: 82, humidity: 70 },
  { hour: "09시", score: 74, humidity: 62 },
  { hour: "12시", score: 55, humidity: 48 },
  { hour: "15시", score: 48, humidity: 45 },
  { hour: "18시", score: 79, humidity: 58 },
  { hour: "21시", score: 88, humidity: 66 },
];

const CHART_CONFIG = {
  score: { label: "러닝 지수", color: "var(--chart-1)" },
  humidity: { label: "습도", color: "var(--chart-2)" },
} satisfies ChartConfig;

const CHART_CLASS = "aspect-auto h-56 w-full";

/**
 * 막대 차트 (툴팁 포함)
 */
function BarChartCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>시간대별 러닝 지수</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className={CHART_CLASS}>
          <BarChart accessibilityLayer data={CHART_DATA}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="score" fill="var(--color-score)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * 라인 차트 (툴팁 + 범례 포함, 다중 시리즈)
 */
function LineChartCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart</CardTitle>
        <CardDescription>러닝 지수와 습도 (범례 포함)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className={CHART_CLASS}>
          <LineChart accessibilityLayer data={CHART_DATA}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line dataKey="score" stroke="var(--color-score)" strokeWidth={2} />
            <Line dataKey="humidity" stroke="var(--color-humidity)" strokeWidth={2} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Chart: 막대 / 라인 차트 예시
 */
export function ChartSection() {
  return (
    <Section title="Chart" description="Recharts 기반 ChartContainer 예시">
      <div className="grid gap-4 md:grid-cols-2">
        <BarChartCard />
        <LineChartCard />
      </div>
    </Section>
  );
}
