import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makePoint } from "@/lib/fixtures/weather";
import { AirQualitySummary } from "./air-quality-summary";

const meta = {
  title: "Weather/AirQualitySummary",
  component: AirQualitySummary,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
} satisfies Meta<typeof AirQualitySummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { point: makePoint({ pm25: 22, pm10: 41, uvIndex: 3 }) } };
export const Bad: Story = { args: { point: makePoint({ pm25: 80, pm10: 160, uvIndex: 9 }) } };
/** 값을 받지 못한 경우 */
export const NoData: Story = { args: { point: makePoint({ pm25: null, pm10: null, uvIndex: null }) } };
