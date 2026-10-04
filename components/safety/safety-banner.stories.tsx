import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { evaluateSafety } from "@/lib/safety/evaluate";
import { makePoint, makeWeather } from "@/lib/fixtures/weather";
import { SafetyBanner } from "./safety-banner";

const weather = makeWeather();

/** 시간별 값을 덮어써서 실제 판정 결과를 만든다. 질환 여부로 보수 판정도 확인할 수 있다. */
function result(overrides: Parameters<typeof makePoint>[0], hasHealthCondition = false) {
  return evaluateSafety({ point: makePoint(overrides), weather, hasHealthCondition });
}

const meta = {
  title: "Safety/SafetyBanner",
  component: SafetyBanner,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
} satisfies Meta<typeof SafetyBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 정상: 체크 아이콘 + "정상" */
export const Ok: Story = { args: { result: result({}) } };

/** 주의: 경고 삼각형 + "주의". 사유를 모두 나열한다 */
export const Caution: Story = {
  args: { result: result({ windSpeedMs: 11, uvIndex: 7 }) },
};

/** 중단 권고: 정지 아이콘 + "중단 권고" */
export const Stop: Story = { args: { result: result({ windSpeedMs: 15 }) } };

/** 미세먼지 사유에는 에어코리아 링크가 붙는다 */
export const Dust: Story = { args: { result: result({ pm25: 60, pm10: 90 }) } };

/** 체감온도 사유에는 계산식 안내가 붙는다 */
export const Heat: Story = { args: { result: result({ apparentTemperatureC: 36 }) } };

/** 질환이 있으면 미세먼지 "주의"도 "중단 권고"로 올라간다 */
export const HealthCondition: Story = { args: { result: result({ pm25: 40 }, true) } };

/** 야간·빙판 */
export const NightAndIce: Story = {
  args: {
    result: result({ time: "2026-10-03T21:00", temperatureC: -1, precipitationMm: 1 }),
  },
};

/** 대기질 값을 받지 못한 경우 */
export const MissingAirQuality: Story = {
  args: { result: result({ uvIndex: null, pm25: null, pm10: null }) },
};
