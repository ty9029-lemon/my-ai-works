import { DAILY_FORECAST_DAYS, HOURLY_POINT_COUNT } from "@/lib/constants";
import { logger } from "@/lib/logger";
import type {
  HourlyPoint,
  NormalizedWeather,
  WeatherProvider,
  WeatherQuery,
} from "@/lib/weather/types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const PROVIDER_NAME = "open-meteo";

/** Forecast API 응답 중 사용하는 부분 */
export interface OpenMeteoForecast {
  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    apparent_temperature: (number | null)[];
    precipitation_probability: (number | null)[];
    precipitation: (number | null)[];
    wind_speed_10m: (number | null)[];
    is_day: (number | null)[];
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

/** Air Quality API 응답 중 사용하는 부분 */
export interface OpenMeteoAirQuality {
  hourly: {
    time: string[];
    pm10: (number | null)[];
    pm2_5: (number | null)[];
    uv_index: (number | null)[];
  };
}

/** 값이 없으면(null·undefined) 기본값을 돌려준다. */
function numberOr(value: number | null | undefined, fallback: number): number {
  return value ?? fallback;
}

/** 필수 값이 없으면 예외를 던진다. */
function requireNumber(value: number | null | undefined, name: string): number {
  if (value == null) {
    throw new Error(`Open-Meteo 응답에 ${name} 값이 없습니다.`);
  }
  return value;
}

/** 시각 문자열을 기준으로 대기질 값을 찾기 위한 인덱스 맵을 만든다. */
function indexByTime(times: string[]): Map<string, number> {
  return new Map(times.map((time, index) => [time, index]));
}

/** Forecast와 Air Quality 응답을 시각 기준으로 합쳐 시간별 값으로 변환한다. */
function toHourlyPoints(
  forecast: OpenMeteoForecast,
  airQuality: OpenMeteoAirQuality,
): HourlyPoint[] {
  const { hourly } = forecast;
  const airIndex = indexByTime(airQuality.hourly.time);
  return hourly.time.slice(0, HOURLY_POINT_COUNT).map((time, i) => {
    const a = airIndex.get(time);
    const air = airQuality.hourly;
    return {
      time,
      temperatureC: requireNumber(hourly.temperature_2m[i], "temperature_2m"),
      apparentTemperatureC: requireNumber(
        hourly.apparent_temperature[i],
        "apparent_temperature",
      ),
      precipitationProbability: numberOr(hourly.precipitation_probability[i], 0),
      precipitationMm: numberOr(hourly.precipitation[i], 0),
      windSpeedMs: requireNumber(hourly.wind_speed_10m[i], "wind_speed_10m"),
      uvIndex: a === undefined ? null : (air.uv_index[a] ?? null),
      pm25: a === undefined ? null : (air.pm2_5[a] ?? null),
      pm10: a === undefined ? null : (air.pm10[a] ?? null),
      isDaytime: hourly.is_day[i] === 1,
    };
  });
}

/**
 * Open-Meteo 두 응답을 공통 타입으로 변환한다.
 * @param fetchedAt 데이터를 받아 온 시각 (ISO 8601)
 */
export function normalizeOpenMeteo(
  forecast: OpenMeteoForecast,
  airQuality: OpenMeteoAirQuality,
  fetchedAt: string,
): NormalizedWeather {
  const { daily } = forecast;
  return {
    provider: PROVIDER_NAME,
    fetchedAt,
    hourly: toHourlyPoints(forecast, airQuality),
    dailyMaxC: requireNumber(daily.temperature_2m_max[0], "temperature_2m_max"),
    dailyMinC: requireNumber(daily.temperature_2m_min[0], "temperature_2m_min"),
    sunrise: daily.sunrise[0],
    sunset: daily.sunset[0],
    nextSunrise: daily.sunrise[1],
  };
}

/** Forecast 요청 URL을 만든다. 풍속은 m/s, 시간대는 좌표 기준 자동이다. */
export function buildForecastUrl({ latitude, longitude }: WeatherQuery): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly:
      "temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,is_day",
    daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset",
    wind_speed_unit: "ms",
    timezone: "auto",
    forecast_hours: String(HOURLY_POINT_COUNT),
    forecast_days: String(DAILY_FORECAST_DAYS),
  });
  return `${FORECAST_URL}?${params}`;
}

/** Air Quality 요청 URL을 만든다. */
export function buildAirQualityUrl({
  latitude,
  longitude,
}: WeatherQuery): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: "pm10,pm2_5,uv_index",
    timezone: "auto",
    forecast_hours: String(HOURLY_POINT_COUNT),
  });
  return `${AIR_QUALITY_URL}?${params}`;
}

/** JSON을 요청하고, 정상 응답이 아니면 로그를 남기고 예외를 던진다. */
async function fetchJson<T>(fetchFn: typeof fetch, url: string): Promise<T> {
  const response = await fetchFn(url);
  if (!response.ok) {
    logger.error({ status: response.status }, "Open-Meteo 요청 실패");
    throw new Error(`Open-Meteo 요청 실패: ${response.status}`);
  }
  return (await response.json()) as T;
}

/**
 * Open-Meteo 기반 날씨 공급자를 만든다.
 * @param fetchFn 테스트에서 교체할 수 있는 fetch 함수
 */
export function createOpenMeteoProvider(
  fetchFn: typeof fetch = fetch,
): WeatherProvider {
  return {
    name: PROVIDER_NAME,
    async getWeather(query) {
      const [forecast, airQuality] = await Promise.all([
        fetchJson<OpenMeteoForecast>(fetchFn, buildForecastUrl(query)),
        fetchJson<OpenMeteoAirQuality>(fetchFn, buildAirQualityUrl(query)),
      ]);
      return normalizeOpenMeteo(forecast, airQuality, new Date().toISOString());
    },
  };
}
