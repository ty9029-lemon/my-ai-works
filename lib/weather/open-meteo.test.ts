import { describe, expect, it, vi } from "vitest";
import { HOURLY_POINT_COUNT, PAST_HOURS } from "@/lib/constants";
import {
  buildAirQualityUrl,
  buildForecastUrl,
  createOpenMeteoProvider,
  normalizeOpenMeteo,
  type OpenMeteoAirQuality,
  type OpenMeteoForecast,
} from "@/lib/weather/open-meteo";

const QUERY = { latitude: 37.57, longitude: 126.98 };

/** 테스트용 시각 배열 (2026-10-03T21:00부터 count개) */
function makeTimes(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const hour = (21 + i) % 24;
    const day = 3 + Math.floor((21 + i) / 24);
    return `2026-10-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00`;
  });
}

function makeForecast(count = HOURLY_POINT_COUNT): OpenMeteoForecast {
  const fill = (value: number) => Array<number>(count).fill(value);
  return {
    hourly: {
      time: makeTimes(count),
      temperature_2m: fill(12),
      apparent_temperature: fill(10),
      precipitation_probability: fill(20),
      precipitation: fill(0),
      wind_speed_10m: fill(3.5),
      is_day: fill(0),
    },
    daily: {
      temperature_2m_max: [18, 19],
      temperature_2m_min: [8, 9],
      sunrise: ["2026-10-03T06:15", "2026-10-04T06:16"],
      sunset: ["2026-10-03T17:55", "2026-10-04T17:53"],
    },
  };
}

function makeAirQuality(count = HOURLY_POINT_COUNT): OpenMeteoAirQuality {
  const fill = (value: number | null) => Array<number | null>(count).fill(value);
  return {
    hourly: {
      time: makeTimes(count),
      pm10: fill(40),
      pm2_5: fill(20),
      uv_index: fill(0),
    },
  };
}

describe("normalizeOpenMeteo", () => {
  it("현재 시각과 이후 12시간, 총 13개의 시간별 값을 만든다", () => {
    const result = normalizeOpenMeteo(makeForecast(), makeAirQuality(), "now");
    expect(result.hourly).toHaveLength(HOURLY_POINT_COUNT);
  });

  it("시간별 값과 일별 값을 공통 타입으로 변환한다", () => {
    const result = normalizeOpenMeteo(makeForecast(), makeAirQuality(), "now");
    expect(result.provider).toBe("open-meteo");
    expect(result.fetchedAt).toBe("now");
    expect(result.dailyMaxC).toBe(18);
    expect(result.dailyMinC).toBe(8);
    expect(result.sunrise).toBe("2026-10-03T06:15");
    expect(result.sunset).toBe("2026-10-03T17:55");
    expect(result.nextSunrise).toBe("2026-10-04T06:16");
    expect(result.hourly[0]).toMatchObject({
      apparentTemperatureC: 10,
      windSpeedMs: 3.5,
      pm25: 20,
      pm10: 40,
      isDaytime: false,
    });
  });

  it("대기질 시각이 어긋나면 시각 문자열로 맞춰 매핑한다", () => {
    const air = makeAirQuality();
    air.hourly.time = air.hourly.time.slice(1).concat("2026-10-04T10:00");
    air.hourly.pm2_5 = air.hourly.pm2_5.map((_, i) => i);
    const result = normalizeOpenMeteo(makeForecast(), air, "now");
    expect(result.hourly[1].pm25).toBe(0);
  });

  it("대기질에 없는 시각과 null 값은 null로 둔다", () => {
    const air = makeAirQuality();
    air.hourly.time = ["2000-01-01T00:00"];
    const result = normalizeOpenMeteo(makeForecast(), air, "now");
    expect(result.hourly.every((point) => point.pm25 === null)).toBe(true);

    const nullAir = makeAirQuality();
    nullAir.hourly.pm10[0] = null;
    expect(
      normalizeOpenMeteo(makeForecast(), nullAir, "now").hourly[0].pm10,
    ).toBeNull();
  });

  it("강수확률이 null이면 0으로 처리한다", () => {
    const forecast = makeForecast();
    forecast.hourly.precipitation_probability[0] = null;
    const result = normalizeOpenMeteo(forecast, makeAirQuality(), "now");
    expect(result.hourly[0].precipitationProbability).toBe(0);
  });

  it("과거 시간이 포함되면 결과는 현재 시각부터 시작하고 직전 3시간 강수를 합산한다", () => {
    const count = PAST_HOURS + HOURLY_POINT_COUNT;
    const forecast = makeForecast(count);
    forecast.hourly.precipitation = forecast.hourly.precipitation.map((_, i) =>
      i < PAST_HOURS ? i + 1 : 0,
    );
    const result = normalizeOpenMeteo(forecast, makeAirQuality(count), "now");
    expect(result.hourly).toHaveLength(HOURLY_POINT_COUNT);
    expect(result.hourly[0].time).toBe(forecast.hourly.time[PAST_HOURS]);
    expect(result.hourly[0].precipitationPrev3hMm).toBe(1 + 2 + 3);
    expect(result.hourly[1].precipitationPrev3hMm).toBe(2 + 3);
  });

  it("과거 시간이 없으면 직전 강수는 0이다", () => {
    const result = normalizeOpenMeteo(makeForecast(), makeAirQuality(), "now");
    expect(result.hourly[0].precipitationPrev3hMm).toBe(0);
  });

  it("체감온도가 없으면 예외를 던진다", () => {
    const forecast = makeForecast();
    forecast.hourly.apparent_temperature[0] = null;
    expect(() =>
      normalizeOpenMeteo(forecast, makeAirQuality(), "now"),
    ).toThrow("apparent_temperature");
  });
});

describe("요청 URL", () => {
  it("풍속 단위를 m/s로 지정하고 시간대를 자동으로 둔다", () => {
    const url = new URL(buildForecastUrl(QUERY));
    expect(url.searchParams.get("wind_speed_unit")).toBe("ms");
    expect(url.searchParams.get("timezone")).toBe("auto");
    expect(url.searchParams.get("latitude")).toBe("37.57");
    expect(url.searchParams.get("hourly")).toContain("apparent_temperature");
  });

  it("직전 강수 계산을 위해 과거 3시간을 함께 요청한다", () => {
    const url = new URL(buildForecastUrl(QUERY));
    expect(url.searchParams.get("past_hours")).toBe(String(PAST_HOURS));
    expect(url.searchParams.get("forecast_hours")).toBe(String(HOURLY_POINT_COUNT));
  });

  it("대기질 요청에 PM2.5·PM10·UV를 포함한다", () => {
    const url = new URL(buildAirQualityUrl(QUERY));
    expect(url.searchParams.get("hourly")).toBe("pm10,pm2_5,uv_index");
  });
});

describe("createOpenMeteoProvider", () => {
  it("두 API를 호출해 정규화된 날씨를 돌려준다", async () => {
    const fetchFn = vi.fn(async (input: RequestInfo | URL) => {
      const body = String(input).includes("air-quality")
        ? makeAirQuality()
        : makeForecast();
      return new Response(JSON.stringify(body), { status: 200 });
    });
    const provider = createOpenMeteoProvider(fetchFn as typeof fetch);
    const weather = await provider.getWeather(QUERY);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(weather.hourly).toHaveLength(HOURLY_POINT_COUNT);
  });

  it("정상 응답이 아니면 예외를 던진다", async () => {
    const fetchFn = vi.fn(async () => new Response("{}", { status: 500 }));
    const provider = createOpenMeteoProvider(fetchFn as typeof fetch);
    await expect(provider.getWeather(QUERY)).rejects.toThrow("500");
  });
});
