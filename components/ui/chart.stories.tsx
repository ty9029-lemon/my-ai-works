import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart";

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

/** ResponsiveContainer 는 부모 크기가 필요해 너비·높이를 고정한다 */
const CHART_CLASS = "aspect-auto h-56 w-[28rem]";
const BAR_RADIUS = 8;
const LINE_STROKE_WIDTH = 2;

const meta = {
  title: "UI/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  args: { config: CHART_CONFIG, children: <div /> },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BarChartWithTooltip: Story = {
  render: (args) => (
    <ChartContainer {...args} className={CHART_CLASS}>
      <BarChart accessibilityLayer data={CHART_DATA}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="hour" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="score" fill="var(--color-score)" radius={BAR_RADIUS} />
      </BarChart>
    </ChartContainer>
  ),
};

export const LineChartWithLegend: Story = {
  render: (args) => (
    <ChartContainer {...args} className={CHART_CLASS}>
      <LineChart accessibilityLayer data={CHART_DATA}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="hour" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line dataKey="score" stroke="var(--color-score)" strokeWidth={LINE_STROKE_WIDTH} />
        <Line dataKey="humidity" stroke="var(--color-humidity)" strokeWidth={LINE_STROKE_WIDTH} />
      </LineChart>
    </ChartContainer>
  ),
};
