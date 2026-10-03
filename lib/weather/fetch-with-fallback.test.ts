import { describe, expect, it } from "vitest";
import { MS_PER_MINUTE } from "@/lib/constants";
import {
  getWeatherWithFallback,
  type WeatherStorage,
} from "@/lib/weather/fetch-with-fallback";
import type { NormalizedWeather, WeatherProvider } from "@/lib/weather/types";

const QUERY = { latitude: 37.5663, longitude: 126.9779 };
const FETCHED_AT = "2026-10-03T12:00:00.000Z";

const WEATHER: NormalizedWeather = {
  provider: "test",
  fetchedAt: FETCHED_AT,
  hourly: [],
  dailyMaxC: 20,
  dailyMinC: 10,
  sunrise: "2026-10-03T06:00",
  sunset: "2026-10-03T18:00",
  nextSunrise: "2026-10-04T06:00",
};

/** 메모리 기반 가짜 저장소 */
function makeStorage(initial: Record<string, string> = {}): WeatherStorage & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const okProvider: WeatherProvider = {
  name: "ok",
  getWeather: async () => WEATHER,
};

const failingProvider: WeatherProvider = {
  name: "fail",
  getWeather: async () => {
    throw new Error("network");
  },
};

/** FETCHED_AT에서 minutes분 뒤 시각을 돌려주는 now 함수 */
function nowAfter(minutes: number): () => Date {
  return () => new Date(new Date(FETCHED_AT).getTime() + minutes * MS_PER_MINUTE);
}

describe("getWeatherWithFallback", () => {
  it("조회에 성공하면 fresh를 돌려주고 저장한다", async () => {
    const storage = makeStorage();
    const result = await getWeatherWithFallback(okProvider, QUERY, storage);
    expect(result).toEqual({ status: "fresh", data: WEATHER });
    expect(Object.keys(storage.data)).toEqual(["weather:last:37.57:126.98"]);
  });

  it("실패하면 직전 데이터를 'N분 전'과 함께 돌려준다", async () => {
    const storage = makeStorage();
    await getWeatherWithFallback(okProvider, QUERY, storage);
    const result = await getWeatherWithFallback(
      failingProvider,
      QUERY,
      storage,
      nowAfter(25),
    );
    expect(result).toEqual({ status: "stale", data: WEATHER, minutesAgo: 25 });
  });

  it("직전 데이터도 없으면 error를 돌려준다", async () => {
    const result = await getWeatherWithFallback(
      failingProvider,
      QUERY,
      makeStorage(),
    );
    expect(result).toEqual({ status: "error" });
  });

  it("저장된 값이 손상되었으면 error를 돌려준다", async () => {
    const storage = makeStorage({ "weather:last:37.57:126.98": "{broken" });
    const result = await getWeatherWithFallback(failingProvider, QUERY, storage);
    expect(result).toEqual({ status: "error" });
  });

  it("다른 좌표의 직전 데이터는 쓰지 않는다", async () => {
    const storage = makeStorage();
    await getWeatherWithFallback(okProvider, QUERY, storage);
    const other = { latitude: 35.18, longitude: 129.08 };
    const result = await getWeatherWithFallback(failingProvider, other, storage);
    expect(result).toEqual({ status: "error" });
  });

  it("경과 시간이 음수가 되면 0분으로 처리한다", async () => {
    const storage = makeStorage();
    await getWeatherWithFallback(okProvider, QUERY, storage);
    const result = await getWeatherWithFallback(
      failingProvider,
      QUERY,
      storage,
      nowAfter(-5),
    );
    expect(result).toMatchObject({ status: "stale", minutesAgo: 0 });
  });
});
