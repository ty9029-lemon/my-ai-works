import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { makePoint, makeWeather } from "@/lib/fixtures/weather";
import { recommendOutfit, type OutfitInput } from "@/lib/outfit/recommend";
import { OutfitCard } from "./outfit-card";

const weather = makeWeather();

/** 체감온도와 선택값으로 실제 추천 결과를 만든다. */
function recommend(apparentTemperatureC: number, overrides: Partial<OutfitInput> = {}) {
  return recommendOutfit({
    mode: "run",
    intensity: "jog",
    sensitivity: "normal",
    point: makePoint({ apparentTemperatureC, temperatureC: apparentTemperatureC }),
    weather,
    ...overrides,
  });
}

const meta = {
  title: "Outfit/OutfitCard",
  component: OutfitCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
} satisfies Meta<typeof OutfitCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── 러닝 8개 구간 (보정 체감온도 기준, 보정 없는 조합) ── */
export const RunBelowMinus10: Story = { args: { recommendation: recommend(-15) } };
export const RunMinus10To0: Story = { args: { recommendation: recommend(-5) } };
export const Run0To5: Story = { args: { recommendation: recommend(2) } };
export const Run5To10: Story = { args: { recommendation: recommend(7) } };
export const Run10To15: Story = { args: { recommendation: recommend(12) } };
export const Run15To20: Story = { args: { recommendation: recommend(17) } };
export const Run20To25: Story = { args: { recommendation: recommend(22) } };
export const Run25Plus: Story = { args: { recommendation: recommend(28) } };

/** 보정 내역: 추위를 많이 타고 인터벌을 하는 경우 (체감 8℃ → 보정 9℃) */
export const RunWithAdjustment: Story = {
  args: { recommendation: recommend(8, { sensitivity: "cold", intensity: "interval" }) },
};

/** 출발 시각을 고른 경우 체감온도 옆에 "15시 기준"이 붙는다 */
export const WithTimeLabel: Story = { args: { recommendation: recommend(14), timeLabel: "15시" } };

/** 외출 모드: 보정 없이 실제 체감온도로 구간을 정하고 바지·레이어 칸이 비어 있다 */
export const Outing: Story = {
  args: {
    recommendation: recommendOutfit({
      mode: "outing",
      intensity: "jog",
      sensitivity: "normal",
      point: makePoint({ apparentTemperatureC: 19, precipitationProbability: 70, pm25: 40 }),
      weather: makeWeather({ dailyMaxC: 24, dailyMinC: 12 }),
    }),
  },
};
