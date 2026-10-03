import { logger } from "@/lib/logger";
import type { LocationSearchResult } from "@/lib/location/types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const RESULT_COUNT = 5;
const RESULT_LANGUAGE = "ko";

/** Open-Meteo Geocoding 응답 항목 (사용하는 필드만) */
export interface OpenMeteoGeocodingItem {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

/** 이름·행정구역·국가를 쉼표로 이어 표시용 이름을 만든다. */
function toLabel(item: OpenMeteoGeocodingItem): string {
  return [item.name, item.admin1, item.country].filter(Boolean).join(", ");
}

/** 응답 항목을 검색 결과로 변환한다. */
export function mapGeocodingItems(
  items: OpenMeteoGeocodingItem[],
): LocationSearchResult[] {
  return items.map((item) => ({
    label: toLabel(item),
    latitude: item.latitude,
    longitude: item.longitude,
    source: "open-meteo",
  }));
}

/**
 * Open-Meteo Geocoding으로 지명을 검색한다. 이름→좌표만 지원하며 역지오코딩은 없다.
 * 결과가 없으면 빈 배열이다.
 */
export async function searchOpenMeteoGeocoding(
  query: string,
  fetchFn: typeof fetch = fetch,
): Promise<LocationSearchResult[]> {
  const params = new URLSearchParams({
    name: query,
    count: String(RESULT_COUNT),
    language: RESULT_LANGUAGE,
  });
  const response = await fetchFn(`${GEOCODING_URL}?${params}`);
  if (!response.ok) {
    logger.error({ status: response.status }, "Open-Meteo Geocoding 요청 실패");
    throw new Error(`Open-Meteo Geocoding 요청 실패: ${response.status}`);
  }
  const body = (await response.json()) as { results?: OpenMeteoGeocodingItem[] };
  return mapGeocodingItems(body.results ?? []);
}
