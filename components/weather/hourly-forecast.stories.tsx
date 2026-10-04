import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makeHourly } from "@/lib/fixtures/weather";
import { HourlyForecast } from "./hourly-forecast";

const meta = {
  title: "Weather/HourlyForecast",
  component: HourlyForecast,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
} satisfies Meta<typeof HourlyForecast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 현재 + 12시간(13칸). 칸이 많아 가로로 스크롤한다 */
export const Default: Story = {
  args: { points: makeHourly(13).map((p, i) => ({ ...p, apparentTemperatureC: 15 + i * 0.7, precipitationProbability: i * 8, windSpeedMs: 2 + (i % 4) })) },
};
