import type { HourlyPoint, NormalizedWeather } from "@/lib/weather/types";

/** 스토리·테스트에서 쓰는 날씨 샘플. 모든 값이 무난한 한낮(정오) 기준이다. */
export const SAMPLE_POINT: HourlyPoint = {
  time: "2026-10-03T12:00",
  temperatureC: 15,
  apparentTemperatureC: 15,
  precipitationProbability: 10,
  precipitationMm: 0,
  precipitationPrev3hMm: 0,
  windSpeedMs: 2.5,
  uvIndex: 3,
  pm25: 20,
  pm10: 40,
  isDaytime: true,
};

/** 기본 시간별 값에 덮어쓴 값을 합쳐 돌려준다. */
export function makePoint(overrides: Partial<HourlyPoint> = {}): HourlyPoint {
  return { ...SAMPLE_POINT, ...overrides };
}

/** 정오부터 한 시간 간격으로 count개의 시간별 값을 만든다. */
export function makeHourly(count: number, overrides: Partial<HourlyPoint> = {}): HourlyPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const hour = (12 + i) % 24;
    const day = 3 + Math.floor((12 + i) / 24);
    const time = `2026-10-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00`;
    return makePoint({ time, ...overrides });
  });
}

/** 날씨 샘플(13개 시간별 값). 일교차는 8℃다. */
export function makeWeather(overrides: Partial<NormalizedWeather> = {}): NormalizedWeather {
  return {
    provider: "sample",
    fetchedAt: "2026-10-03T03:00:00.000Z",
    hourly: makeHourly(13),
    dailyMaxC: 20,
    dailyMinC: 12,
    sunrise: "2026-10-03T06:28",
    sunset: "2026-10-03T18:12",
    nextSunrise: "2026-10-04T06:29",
    ...overrides,
  };
}
