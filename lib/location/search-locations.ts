import { MAX_FOREIGN_RESULTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import type { KakaoClient } from "@/lib/location/kakao";
import { searchOpenMeteoGeocoding } from "@/lib/location/open-meteo-geocoding";
import type { LocationSearchResult } from "@/lib/location/types";

/** 한국 국가 코드. 한국 지명은 Kakao가 맡으므로 Open-Meteo의 한국 결과는 중복으로 본다. */
const KOREA_COUNTRY_CODE = "KR";

/**
 * 주소·지명을 검색한다. Kakao와 Open-Meteo Geocoding을 함께 조회한다.
 * - Kakao 결과가 있으면 그 뒤에 한국 밖 지명(최대 MAX_FOREIGN_RESULTS개)을 덧붙인다.
 *   Kakao는 "도쿄"에도 한국 상호를 돌려주므로, 해외 지명을 찾을 수 있게 하려는 것이다.
 * - Kakao가 0건이거나 실패했거나 키가 없으면 Open-Meteo 결과 전체를 쓴다.
 * - Open-Meteo만 실패하면 Kakao 결과만 돌려주고, 쓸 수 있는 결과가 없으면 예외를 던진다.
 * @param kakao Kakao 클라이언트. 키가 없으면 null
 */
export async function searchLocations(
  query: string,
  kakao: KakaoClient | null,
  fetchFn: typeof fetch = fetch,
): Promise<LocationSearchResult[]> {
  const [kakaoSettled, openSettled] = await Promise.allSettled([
    kakao ? kakao.searchAddress(query) : Promise.resolve<LocationSearchResult[]>([]),
    searchOpenMeteoGeocoding(query, fetchFn),
  ]);
  if (kakaoSettled.status === "rejected") {
    logger.warn({ error: kakaoSettled.reason }, "Kakao 검색 실패");
  }
  const kakaoResults = kakaoSettled.status === "fulfilled" ? kakaoSettled.value : [];

  if (openSettled.status === "rejected") {
    if (kakaoResults.length > 0) return kakaoResults;
    throw openSettled.reason;
  }
  if (kakaoResults.length === 0) return openSettled.value;
  const foreign = openSettled.value
    .filter((result) => result.countryCode !== KOREA_COUNTRY_CODE)
    .slice(0, MAX_FOREIGN_RESULTS);
  return [...kakaoResults, ...foreign];
}
