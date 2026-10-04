import { COORDINATE_DECIMAL_PLACES, MS_PER_MINUTE } from "@/lib/constants";
import { logger } from "@/lib/logger";
import type {
  NormalizedWeather,
  WeatherProvider,
  WeatherQuery,
} from "@/lib/weather/types";

/** 마지막 날씨 데이터를 저장하는 키의 접두사. 데이터 초기화 때 이 접두사로 찾아 지운다. */
export const WEATHER_CACHE_KEY_PREFIX = "weather:last";

/** 마지막 날씨 데이터를 보관하는 저장소 (localStorage 호환) */
export type WeatherStorage = Pick<Storage, "getItem" | "setItem">;

/** 날씨 조회 결과: 새 데이터 / 직전 데이터 / 실패 */
export type WeatherResult =
  | { status: "fresh"; data: NormalizedWeather }
  | { status: "stale"; data: NormalizedWeather; minutesAgo: number }
  | { status: "error" };

/** 좌표별 저장 키를 만든다. */
function cacheKey({ latitude, longitude }: WeatherQuery): string {
  const lat = latitude.toFixed(COORDINATE_DECIMAL_PLACES);
  const lon = longitude.toFixed(COORDINATE_DECIMAL_PLACES);
  return `${WEATHER_CACHE_KEY_PREFIX}:${lat}:${lon}`;
}

/** 저장된 값이 날씨 데이터 형태인지 확인한다. */
function isWeather(value: unknown): value is NormalizedWeather {
  const weather = value as NormalizedWeather | null;
  return (
    typeof weather?.fetchedAt === "string" && Array.isArray(weather.hourly)
  );
}

/** 저장소에서 직전 데이터를 읽는다. 없거나 손상되었으면 null이다. */
function readLast(
  storage: WeatherStorage,
  query: WeatherQuery,
): NormalizedWeather | null {
  try {
    const raw = storage.getItem(cacheKey(query));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isWeather(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 성공한 데이터를 저장한다. 저장 실패는 무시하고 기록만 남긴다. */
function writeLast(
  storage: WeatherStorage,
  query: WeatherQuery,
  data: NormalizedWeather,
): void {
  try {
    storage.setItem(cacheKey(query), JSON.stringify(data));
  } catch (error) {
    logger.warn({ error }, "날씨 데이터 저장 실패");
  }
}

/**
 * 날씨를 조회하고, 실패하면 직전 데이터로 대체한다.
 * 직전 데이터도 없으면 error를 돌려준다("다시 시도" 상태).
 * @param now 현재 시각(테스트에서 교체 가능)
 */
export async function getWeatherWithFallback(
  provider: WeatherProvider,
  query: WeatherQuery,
  storage: WeatherStorage,
  now: () => Date = () => new Date(),
): Promise<WeatherResult> {
  try {
    const data = await provider.getWeather(query);
    writeLast(storage, query, data);
    return { status: "fresh", data };
  } catch (error) {
    logger.warn({ error }, "날씨 조회 실패, 직전 데이터 확인");
  }
  const last = readLast(storage, query);
  if (!last) return { status: "error" };
  const elapsedMs = now().getTime() - new Date(last.fetchedAt).getTime();
  const minutesAgo = Math.max(0, Math.floor(elapsedMs / MS_PER_MINUTE));
  return { status: "stale", data: last, minutesAgo };
}
