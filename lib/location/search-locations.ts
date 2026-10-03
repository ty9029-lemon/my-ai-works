import { logger } from "@/lib/logger";
import type { KakaoClient } from "@/lib/location/kakao";
import { searchOpenMeteoGeocoding } from "@/lib/location/open-meteo-geocoding";
import type { LocationSearchResult } from "@/lib/location/types";

/**
 * 주소·지명을 검색한다. Kakao를 먼저 쓰고, 클라이언트가 없거나 결과가 0건이거나
 * 요청이 실패하면(한국 밖 지명 포함) Open-Meteo Geocoding으로 대체한다.
 * @param kakao Kakao 클라이언트. 키가 없으면 null
 */
export async function searchLocations(
  query: string,
  kakao: KakaoClient | null,
  fetchFn: typeof fetch = fetch,
): Promise<LocationSearchResult[]> {
  if (kakao) {
    try {
      const results = await kakao.searchAddress(query);
      if (results.length > 0) return results;
    } catch (error) {
      logger.warn({ error }, "Kakao 검색 실패, Open-Meteo로 대체");
    }
  }
  return searchOpenMeteoGeocoding(query, fetchFn);
}
