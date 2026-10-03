import { logger } from "@/lib/logger";
import type { RegionName } from "@/lib/location/region-label";
import type { LocationSearchResult } from "@/lib/location/types";

/**
 * 주소·지명을 검색한다. 서버가 실패하면 예외를 던진다.
 * 호출하는 화면에서 "다시 시도" 상태로 처리한다.
 */
export async function searchAddress(
  query: string,
  fetchFn: typeof fetch = fetch,
): Promise<LocationSearchResult[]> {
  const response = await fetchFn(`/api/geocode?${new URLSearchParams({ q: query })}`);
  if (!response.ok) throw new Error(`주소 검색 실패: ${response.status}`);
  const body = (await response.json()) as { results: LocationSearchResult[] };
  return body.results;
}

/**
 * 좌표의 지역명을 가져온다. 실패하거나 알 수 없으면 null이다.
 * 동까지 표시하려면 반올림 전 좌표를 넘긴다.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  fetchFn: typeof fetch = fetch,
): Promise<RegionName | null> {
  const params = new URLSearchParams({ lat: String(latitude), lon: String(longitude) });
  try {
    const response = await fetchFn(`/api/reverse-geocode?${params}`);
    if (!response.ok) return null;
    const body = (await response.json()) as { region: RegionName | null };
    return body.region;
  } catch (error) {
    logger.warn({ error }, "지역명 요청 실패");
    return null;
  }
}
