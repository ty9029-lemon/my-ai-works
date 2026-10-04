import { logger } from "@/lib/logger";
import type { LocationSearchResult } from "@/lib/location/types";
import type { RegionName } from "@/lib/location/region-label";

const KAKAO_BASE_URL = "https://dapi.kakao.com/v2/local";
/** 행정동 구분 값 (법정동은 "B") */
const ADMIN_REGION_TYPE = "H";

/** 주소 검색 응답 문서 (사용하는 필드만) */
export interface KakaoAddressDocument {
  address_name: string;
  x: string;
  y: string;
}

/** 키워드 검색 응답 문서 (사용하는 필드만) */
export interface KakaoKeywordDocument extends KakaoAddressDocument {
  place_name: string;
}

/** 좌표→행정구역 응답 문서 (사용하는 필드만) */
export interface KakaoRegionDocument {
  region_type: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
}

/** Kakao 로컬 API 클라이언트. 서버에서만 만든다. */
export interface KakaoClient {
  searchAddress(query: string): Promise<LocationSearchResult[]>;
  reverseGeocode(latitude: number, longitude: number): Promise<RegionName | null>;
}

/** x(경도)·y(위도) 문자열을 좌표 결과로 바꾼다. 좌표가 숫자가 아니면 null이다. */
function toResult(
  label: string,
  x: string,
  y: string,
  kind: NonNullable<LocationSearchResult["kind"]>,
): LocationSearchResult | null {
  const longitude = Number(x);
  const latitude = Number(y);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { label, latitude, longitude, source: "kakao", kind };
}

/** 주소 검색 응답을 검색 결과로 변환한다. */
export function mapAddressDocuments(
  documents: KakaoAddressDocument[],
): LocationSearchResult[] {
  return documents
    .map((doc) => toResult(doc.address_name, doc.x, doc.y, "address"))
    .filter((result) => result !== null);
}

/** 키워드 검색 응답을 검색 결과로 변환한다. */
export function mapKeywordDocuments(
  documents: KakaoKeywordDocument[],
): LocationSearchResult[] {
  return documents
    .map((doc) =>
      toResult(`${doc.place_name} · ${doc.address_name}`, doc.x, doc.y, "place"),
    )
    .filter((result) => result !== null);
}

/** 좌표→행정구역 응답에서 행정동 기준 지역명을 고른다. 없으면 null이다. */
export function mapRegionDocuments(
  documents: KakaoRegionDocument[],
): RegionName | null {
  const doc =
    documents.find((item) => item.region_type === ADMIN_REGION_TYPE) ??
    documents[0];
  if (!doc) return null;
  return {
    city: doc.region_1depth_name,
    district: doc.region_2depth_name,
    neighborhood: doc.region_3depth_name || null,
  };
}

/** Kakao 로컬 API를 호출해 documents를 돌려준다. 실패 시 키를 노출하지 않고 기록한다. */
async function fetchDocuments<T>(
  fetchFn: typeof fetch,
  apiKey: string,
  path: string,
  params: Record<string, string>,
): Promise<T[]> {
  const url = `${KAKAO_BASE_URL}/${path}?${new URLSearchParams(params)}`;
  const response = await fetchFn(url, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });
  if (!response.ok) {
    logger.error({ status: response.status, path }, "Kakao 로컬 API 요청 실패");
    throw new Error(`Kakao 로컬 API 요청 실패: ${response.status}`);
  }
  const body = (await response.json()) as { documents?: T[] };
  return body.documents ?? [];
}

/**
 * Kakao 클라이언트를 만든다. 주소 검색 결과가 없으면 키워드 검색(예: "서울시청")을 시도한다.
 * 약관 확인 전까지 결과를 캐시하거나 저장하지 않는다.
 */
export function createKakaoClient(
  apiKey: string,
  fetchFn: typeof fetch = fetch,
): KakaoClient {
  return {
    async searchAddress(query) {
      const addresses = await fetchDocuments<KakaoAddressDocument>(
        fetchFn, apiKey, "search/address.json", { query },
      );
      if (addresses.length > 0) return mapAddressDocuments(addresses);
      const places = await fetchDocuments<KakaoKeywordDocument>(
        fetchFn, apiKey, "search/keyword.json", { query },
      );
      return mapKeywordDocuments(places);
    },
    async reverseGeocode(latitude, longitude) {
      const regions = await fetchDocuments<KakaoRegionDocument>(
        fetchFn, apiKey, "geo/coord2regioncode.json",
        { x: String(longitude), y: String(latitude) },
      );
      return mapRegionDocuments(regions);
    },
  };
}

/** 환경변수 KAKAO_REST_API_KEY로 클라이언트를 만든다. 키가 없으면 null이다. */
export function createKakaoClientFromEnv(): KakaoClient | null {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  return apiKey ? createKakaoClient(apiKey) : null;
}
