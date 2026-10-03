import { describe, expect, it } from "vitest";
import { evaluateSafety, isNightTime } from "@/lib/safety/evaluate";
import type { SafetyFactor, SafetyLevel } from "@/lib/safety/types";
import type { HourlyPoint, NormalizedWeather } from "@/lib/weather/types";

/** 한낮(정오), 모든 값이 정상인 기본 시간별 값 */
const BASE_POINT: HourlyPoint = {
  time: "2026-10-03T12:00",
  temperatureC: 15,
  apparentTemperatureC: 15,
  precipitationProbability: 0,
  precipitationMm: 0,
  precipitationPrev3hMm: 0,
  windSpeedMs: 2,
  uvIndex: 2,
  pm25: 10,
  pm10: 20,
  isDaytime: true,
};

const WEATHER: NormalizedWeather = {
  provider: "test",
  fetchedAt: "2026-10-03T12:00:00.000Z",
  hourly: [BASE_POINT],
  dailyMaxC: 20,
  dailyMinC: 10,
  sunrise: "2026-10-03T06:28",
  sunset: "2026-10-03T18:12",
  nextSunrise: "2026-10-04T06:29",
};

/** 기본값에 덮어쓴 시간별 값으로 판정한다. */
function evaluate(overrides: Partial<HourlyPoint>, hasHealthCondition = false) {
  return evaluateSafety({
    point: { ...BASE_POINT, ...overrides },
    weather: WEATHER,
    hasHealthCondition,
  });
}

/** 해당 요소가 낸 등급을 돌려준다. 사유에 없으면 "ok"이다. */
function levelOf(result: ReturnType<typeof evaluate>, factor: SafetyFactor): SafetyLevel {
  return result.reasons.find((r) => r.factor === factor)?.level ?? "ok";
}

type Case = [value: number, expected: SafetyLevel];

describe("요소별 경계값 (이상/이하는 경계 포함)", () => {
  const tables: [string, SafetyFactor, (v: number) => Partial<HourlyPoint>, Case[]][] = [
    ["풍속(m/s)", "wind", (v) => ({ windSpeedMs: v }), [[9.9, "ok"], [10, "caution"], [13.9, "caution"], [14, "stop"]]],
    ["UV", "uv", (v) => ({ uvIndex: v }), [[5.9, "ok"], [6, "caution"], [8, "caution"], [11, "caution"]]],
    ["체감온도 고온", "heat", (v) => ({ apparentTemperatureC: v }), [[30.9, "ok"], [31, "caution"], [34.9, "caution"], [35, "stop"]]],
    ["체감온도 저온", "cold", (v) => ({ apparentTemperatureC: v }), [[-9.9, "ok"], [-10, "caution"], [-14.9, "caution"], [-15, "stop"]]],
    ["PM2.5", "pm25", (v) => ({ pm25: v }), [[35.9, "ok"], [36, "caution"], [55.9, "caution"], [56, "caution"], [75.9, "caution"], [76, "stop"]]],
    ["PM10", "pm10", (v) => ({ pm10: v }), [[80.9, "ok"], [81, "caution"], [150.9, "caution"], [151, "stop"]]],
  ];

  for (const [name, factor, toOverrides, cases] of tables) {
    for (const [value, expected] of cases) {
      it(`${name} ${value} → ${expected}`, () => {
        expect(levelOf(evaluate(toOverrides(value)), factor)).toBe(expected);
      });
    }
  }
});

describe("요소별 안내 문구", () => {
  it("UV는 단계마다 다른 안내를 준다", () => {
    const messages = [6, 8, 11].map((uv) => evaluate({ uvIndex: uv }).reasons[0].message);
    expect(new Set(messages).size).toBe(3);
    expect(messages[2]).toContain("노출을 최소화");
  });

  it("PM2.5는 36~55와 56~75의 안내가 다르고 모델 추정치임을 밝힌다", () => {
    const low = evaluate({ pm25: 40 }).reasons[0].message;
    const high = evaluate({ pm25: 60 }).reasons[0].message;
    expect(low).toContain("강도와 시간을 줄이세요");
    expect(high).toContain("고강도 운동은 자제");
    expect(low).toContain("모델 추정치");
    expect(high).toContain("모델 추정치");
  });

  it("미세먼지 중단 권고는 '모델 추정치 기준' 문구와 에어코리아 확인을 안내한다", () => {
    for (const overrides of [{ pm25: 80 }, { pm10: 160 }]) {
      const message = evaluate(overrides).reasons[0].message;
      expect(message).toContain("모델 추정치 기준");
      expect(message).toContain("에어코리아");
    }
  });
});

describe("빙판", () => {
  it.each<[string, Partial<HourlyPoint>, SafetyLevel]>([
    ["0℃ 이하 + 해당 시각 강수", { temperatureC: 0, precipitationMm: 0.2 }, "caution"],
    ["0℃ 이하 + 직전 3시간 강수", { temperatureC: -3, precipitationPrev3hMm: 1 }, "caution"],
    ["0℃ 초과 + 강수", { temperatureC: 0.1, precipitationMm: 1 }, "ok"],
    ["0℃ 이하 + 강수 없음", { temperatureC: -5 }, "ok"],
  ])("%s → %s", (_, overrides, expected) => {
    expect(levelOf(evaluate(overrides), "ice")).toBe(expected);
  });
});

describe("야간", () => {
  const night = (time: string) => isNightTime(time, WEATHER);

  it.each<[string, boolean]>([
    ["2026-10-03T05:00", true],
    ["2026-10-03T06:58", true],
    ["2026-10-03T06:59", false],
    ["2026-10-03T12:00", false],
    ["2026-10-03T17:41", false],
    ["2026-10-03T17:42", true],
    ["2026-10-04T00:00", true],
    ["2026-10-04T06:59", true],
    ["2026-10-04T07:00", false],
  ])("%s → 야간 %s", (time, expected) => {
    expect(night(time)).toBe(expected);
  });

  it("야간이면 주의 등급과 라이트 안내가 붙는다", () => {
    const result = evaluate({ time: "2026-10-03T21:00" });
    expect(levelOf(result, "night")).toBe("caution");
    expect(result.reasons[0].message).toContain("라이트");
  });
});

describe("등급 종합", () => {
  it("모든 요소가 정상이면 ok이고 사유가 없다", () => {
    const result = evaluate({});
    expect(result.level).toBe("ok");
    expect(result.reasons).toEqual([]);
    expect(result.targetTime).toBe(BASE_POINT.time);
  });

  it("가장 높은 등급을 결과로 하고 사유를 등급 순으로 모두 나열한다", () => {
    const result = evaluate({ windSpeedMs: 10, uvIndex: 7, pm10: 200 });
    expect(result.level).toBe("stop");
    expect(result.reasons.map((r) => [r.factor, r.level])).toEqual([
      ["pm10", "stop"],
      ["wind", "caution"],
      ["uv", "caution"],
    ]);
  });
});

describe("값이 없는 요소", () => {
  it("UV·PM이 null이면 판정에서 건너뛰고 missingFactors로 알린다", () => {
    const result = evaluate({ uvIndex: null, pm25: null, pm10: null });
    expect(result.level).toBe("ok");
    expect(result.missingFactors).toEqual(["uv", "pm25", "pm10"]);
  });

  it("값이 있으면 missingFactors는 비어 있다", () => {
    expect(evaluate({}).missingFactors).toEqual([]);
  });
});

describe("질환 보수 판정", () => {
  it.each<[string, Partial<HourlyPoint>]>([
    ["PM2.5 주의", { pm25: 40 }],
    ["PM10 주의", { pm10: 90 }],
    ["고온 주의", { apparentTemperatureC: 31 }],
    ["저온 주의", { apparentTemperatureC: -10 }],
  ])("%s는 중단 권고로 올라간다", (_, overrides) => {
    const result = evaluate(overrides, true);
    expect(result.level).toBe("stop");
    expect(result.reasons[0].message).toContain("질환 보수 기준 적용");
    expect(evaluate(overrides, false).level).toBe("caution");
  });

  it.each<[string, Partial<HourlyPoint>]>([
    ["풍속", { windSpeedMs: 10 }],
    ["UV", { uvIndex: 9 }],
    ["빙판", { temperatureC: -1, precipitationMm: 1 }],
    ["야간", { time: "2026-10-03T21:00" }],
  ])("%s는 질환이 있어도 주의에 머문다", (_, overrides) => {
    expect(evaluate(overrides, true).level).toBe("caution");
  });

  it("이미 중단 권고인 요소에는 보수 문구를 덧붙이지 않는다", () => {
    const result = evaluate({ pm25: 80 }, true);
    expect(result.reasons[0].message).not.toContain("질환 보수");
  });
});
