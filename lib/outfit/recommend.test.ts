import { describe, expect, it } from "vitest";
import { MAX_ADJUSTMENT_C } from "@/lib/constants";
import { calculateAdjustment } from "@/lib/outfit/adjust";
import { recommendOutfit, type OutfitInput } from "@/lib/outfit/recommend";
import {
  DEFAULT_ADJUSTMENT_TABLE,
  RUN_COMMON_TIPS,
  RUNNING_BANDS,
} from "@/lib/outfit/rules";
import { INTENSITIES, SENSITIVITIES } from "@/lib/profile/types";
import type { HourlyPoint, NormalizedWeather } from "@/lib/weather/types";

/** 한낮(정오), 날씨가 무난한 기본 시간별 값 */
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

/** 일교차 8℃(겉옷 추가 기준 미만) */
const WEATHER: NormalizedWeather = {
  provider: "test",
  fetchedAt: "2026-10-03T12:00:00.000Z",
  hourly: [BASE_POINT],
  dailyMaxC: 20,
  dailyMinC: 12,
  sunrise: "2026-10-03T06:28",
  sunset: "2026-10-03T18:12",
  nextSunrise: "2026-10-04T06:29",
};

/** 보정이 없는 조합(보통, 조깅)을 기본으로 추천한다. */
function recommend(
  overrides: Partial<OutfitInput> = {},
  pointOverrides: Partial<HourlyPoint> = {},
  weather: NormalizedWeather = WEATHER,
) {
  return recommendOutfit({
    mode: "run",
    intensity: "jog",
    sensitivity: "normal",
    point: { ...BASE_POINT, ...pointOverrides },
    weather,
    ...overrides,
  });
}

describe("러닝 구간 경계 (보정 체감온도, 하한 포함·상한 미포함)", () => {
  it.each<[number, string]>([
    [-30, "run-below-minus10"],
    [-10.1, "run-below-minus10"],
    [-10, "run-minus10-0"],
    [-0.1, "run-minus10-0"],
    [0, "run-0-5"],
    [4.9, "run-0-5"],
    [5, "run-5-10"],
    [9.9, "run-5-10"],
    [10, "run-10-15"],
    [14.9, "run-10-15"],
    [15, "run-15-20"],
    [19.9, "run-15-20"],
    [20, "run-20-25"],
    [24.9, "run-20-25"],
    [25, "run-25-plus"],
    [40, "run-25-plus"],
  ])("보정 체감온도 %s℃ → %s", (apparent, bandId) => {
    expect(recommend({}, { apparentTemperatureC: apparent }).bandId).toBe(bandId);
  });

  it("러닝 구간은 PRD의 8개다", () => {
    expect(RUNNING_BANDS).toHaveLength(8);
  });
});

describe("외출 구간 경계 (보정하지 않은 체감온도)", () => {
  it.each<[number, string]>([
    [-0.1, "outing-below-0"],
    [0, "outing-0-10"],
    [9.9, "outing-0-10"],
    [10, "outing-10-17"],
    [16.9, "outing-10-17"],
    [17, "outing-17-23"],
    [22.9, "outing-17-23"],
    [23, "outing-23-28"],
    [27.9, "outing-23-28"],
    [28, "outing-28-plus"],
  ])("체감온도 %s℃ → %s", (apparent, bandId) => {
    const result = recommend({ mode: "outing" }, { apparentTemperatureC: apparent });
    expect(result.bandId).toBe(bandId);
  });

  it("민감도·강도를 보정하지 않는다", () => {
    const result = recommend(
      { mode: "outing", sensitivity: "cold", intensity: "interval" },
      { apparentTemperatureC: 10 },
    );
    expect(result.bandId).toBe("outing-10-17");
    expect(result.adjustedApparentC).toBe(10);
    expect(result.adjustments).toMatchObject({ sensitivityC: 0, intensityC: 0, totalC: 0 });
  });

  it("바지·레이어 칸은 비어 있고 겉옷은 layers에 담는다", () => {
    const cold = recommend({ mode: "outing" }, { apparentTemperatureC: -5 });
    expect(cold.items).toMatchObject({ top: "패딩", bottom: null, layers: null });
    expect(cold.items.accessories).toEqual(["목도리", "장갑", "모자"]);
    const mild = recommend({ mode: "outing" }, { apparentTemperatureC: 20 });
    expect(mild.items.layers).toBe("가벼운 겉옷");
  });
});

describe("보정", () => {
  it("실제 조합 9가지의 합계가 고정되어 있다", () => {
    const totals = Object.fromEntries(
      SENSITIVITIES.flatMap((s) =>
        INTENSITIES.map((i) => [`${s}/${i}`, calculateAdjustment(s, i).totalC]),
      ),
    );
    expect(totals).toEqual({
      "cold/jog": -3,
      "cold/long": -2,
      "cold/interval": 1,
      "normal/jog": 0,
      "normal/long": 1,
      "normal/interval": 4,
      "hot/jog": 3,
      "hot/long": 4,
      "hot/interval": 7,
    });
  });

  it("실제 조합의 합계는 상한(±7)을 넘지 않는다", () => {
    for (const s of SENSITIVITIES) {
      for (const i of INTENSITIES) {
        expect(Math.abs(calculateAdjustment(s, i).totalC)).toBeLessThanOrEqual(MAX_ADJUSTMENT_C);
      }
    }
  });

  it("테스트용 표로 합계 +9, -9를 주면 +7, -7로 제한된다", () => {
    const over = {
      sensitivity: { cold: -9, normal: 0, hot: 9 },
      intensity: { jog: 0, long: 0, interval: 0 },
    };
    expect(calculateAdjustment("hot", "jog", over).totalC).toBe(MAX_ADJUSTMENT_C);
    expect(calculateAdjustment("cold", "jog", over).totalC).toBe(-MAX_ADJUSTMENT_C);
    expect(DEFAULT_ADJUSTMENT_TABLE.sensitivity.hot).toBe(3);
  });

  it("추위 많이 탐 + 인터벌은 보정 내역을 -3, +4로 돌려준다", () => {
    const result = recommend({ sensitivity: "cold", intensity: "interval" }, { apparentTemperatureC: 8 });
    expect(result.adjustments).toEqual({
      sensitivity: "cold",
      sensitivityC: -3,
      intensity: "interval",
      intensityC: 4,
      totalC: 1,
    });
    expect(result.apparentC).toBe(8);
    expect(result.adjustedApparentC).toBe(9);
  });

  it("러닝은 보정 체감온도로 구간을 고른다", () => {
    expect(recommend({ sensitivity: "cold" }, { apparentTemperatureC: 7.9 }).bandId).toBe("run-0-5");
    expect(recommend({ sensitivity: "cold" }, { apparentTemperatureC: 8 }).bandId).toBe("run-5-10");
    expect(recommend({ sensitivity: "hot" }, { apparentTemperatureC: 1.9 }).bandId).toBe("run-0-5");
    expect(recommend({ sensitivity: "hot" }, { apparentTemperatureC: 2 }).bandId).toBe("run-5-10");
  });
});

describe("러닝 추가 문구", () => {
  const notes = (overrides: Partial<OutfitInput> = {}, point: Partial<HourlyPoint> = {}) =>
    recommend(overrides, point).items.extraNotes;

  it("공통 팁은 항상 마지막에 붙는다", () => {
    const result = notes();
    expect(result.slice(-RUN_COMMON_TIPS.length)).toEqual([...RUN_COMMON_TIPS]);
    expect(result).toEqual([...RUN_COMMON_TIPS]);
  });

  it("인터벌·템포일 때만 웜업·쿨다운 겉옷을 안내한다", () => {
    expect(notes({ intensity: "interval" })).toContain("웜업·쿨다운용 겉옷을 챙기세요");
    expect(notes({ intensity: "long" })).not.toContain("웜업·쿨다운용 겉옷을 챙기세요");
  });

  it.each<[string, Partial<HourlyPoint>, boolean]>([
    ["강수확률 59%", { precipitationProbability: 59 }, false],
    ["강수확률 60%", { precipitationProbability: 60 }, true],
    ["강수량 0.1mm", { precipitationMm: 0.1 }, true],
  ])("%s → 방수 재킷 %s", (_, point, expected) => {
    expect(notes({}, point).includes("방수(발수) 재킷")).toBe(expected);
  });

  it("기온 0℃ 이하의 강수(눈)에는 접지력 좋은 신발이 추가된다", () => {
    const snow = notes({}, { precipitationMm: 1, temperatureC: 0 });
    const rain = notes({}, { precipitationMm: 1, temperatureC: 0.1 });
    expect(snow).toContain("접지력 좋은 신발");
    expect(rain).not.toContain("접지력 좋은 신발");
    expect(snow).toContain("챙 있는 캡");
  });

  it("체감온도 31℃ 이상이면 수분·전해질을 안내하고, 보정 전 체감온도를 기준으로 한다", () => {
    expect(notes({}, { apparentTemperatureC: 30.9 })).not.toContain("물과 전해질을 챙기세요");
    expect(notes({}, { apparentTemperatureC: 31 })).toContain("물과 전해질을 챙기세요");
    const hotInterval = notes({ sensitivity: "hot", intensity: "interval" }, { apparentTemperatureC: 30 });
    expect(hotInterval).not.toContain("물과 전해질을 챙기세요");
  });

  it("야간(일몰 30분 전 ~ 일출 30분 후)에는 반사 소재와 라이트를 안내한다", () => {
    expect(notes({}, { time: "2026-10-03T17:42" })).toContain("반사 소재 의류");
    expect(notes({}, { time: "2026-10-03T17:41" })).not.toContain("반사 소재 의류");
    expect(notes({}, { time: "2026-10-04T05:00" })).toContain("헤드램프 또는 클립 라이트");
  });

  it("외출용 아이템(우산·마스크)은 섞이지 않는다", () => {
    const result = notes({}, { precipitationProbability: 90, pm25: 100 });
    expect(result).not.toContain("우산");
    expect(result).not.toContain("마스크");
  });
});

describe("외출 추가 아이템", () => {
  const notes = (point: Partial<HourlyPoint> = {}, weather: NormalizedWeather = WEATHER) =>
    recommend({ mode: "outing" }, point, weather).items.extraNotes;

  it("기본 조건에서는 추가 아이템이 없다", () => {
    expect(notes()).toEqual([]);
  });

  it.each<[string, Partial<HourlyPoint>, string, boolean]>([
    ["강수확률 59%", { precipitationProbability: 59 }, "우산", false],
    ["강수확률 60%", { precipitationProbability: 60 }, "우산", true],
    ["PM2.5 35.9", { pm25: 35.9 }, "마스크", false],
    ["PM2.5 36", { pm25: 36 }, "마스크", true],
    ["PM10 80.9", { pm10: 80.9 }, "마스크", false],
    ["PM10 81", { pm10: 81 }, "마스크", true],
    ["PM 값 없음", { pm25: null, pm10: null }, "마스크", false],
    ["UV 5.9", { uvIndex: 5.9 }, "선크림", false],
    ["UV 6", { uvIndex: 6 }, "선크림", true],
    ["UV 값 없음", { uvIndex: null }, "선크림", false],
  ])("%s → %s %s", (_, point, item, expected) => {
    expect(notes(point).includes(item)).toBe(expected);
  });

  it("일교차 10℃ 이상이면 겉옷을 추가한다", () => {
    expect(notes({}, { ...WEATHER, dailyMaxC: 21.9, dailyMinC: 12 })).not.toContain("겉옷 추가");
    expect(notes({}, { ...WEATHER, dailyMaxC: 22, dailyMinC: 12 })).toContain("겉옷 추가");
  });

  it("러닝 공통 팁은 붙지 않는다", () => {
    expect(notes({ precipitationProbability: 90 })).not.toContain("면 소재는 피하세요");
  });
});

describe("결과 형태", () => {
  it("출발 시각과 실제 체감온도를 그대로 돌려준다", () => {
    const result = recommend({}, { time: "2026-10-03T15:00", apparentTemperatureC: 12.3 });
    expect(result.targetTime).toBe("2026-10-03T15:00");
    expect(result.apparentC).toBe(12.3);
    expect(result.mode).toBe("run");
  });

  it("러닝은 바지·레이어를 함께 돌려주고, 구간 상수를 외부에서 바꿀 수 없게 복사한다", () => {
    const result = recommend({}, { apparentTemperatureC: 22 });
    expect(result.items.bottom).toBe("쇼츠");
    expect(result.items.layers).toBe("1겹");
    result.items.accessories.push("임의 추가");
    expect(recommend({}, { apparentTemperatureC: 22 }).items.accessories).toEqual(["캡", "선크림"]);
  });
});
