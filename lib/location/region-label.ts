import { COORDINATE_DECIMAL_PLACES } from "@/lib/constants";

/** 역지오코딩으로 얻은 행정구역 이름 */
export interface RegionName {
  /** 시·도 (예: "서울특별시") */
  city: string;
  /** 시·군·구 (예: "마포구") */
  district: string;
  /** 읍·면·동 (예: "합정동"). 없으면 null */
  neighborhood: string | null;
}

/** 시·도 이름 끝의 행정구역 접미사 (예: "서울특별시" → "서울") */
const CITY_SUFFIX_PATTERN = /(특별자치시|특별자치도|특별시|광역시|도)$/;

/** 시·도 이름을 짧게 줄인다. */
export function shortenCityName(city: string): string {
  return city.replace(CITY_SUFFIX_PATTERN, "");
}

/**
 * 지역명을 화면 표시용 문자열로 만든다.
 * @param precise 반올림 전 좌표로 얻은 지역명이면 true(동까지), 반올림 좌표뿐이면 false(구까지)
 */
export function formatRegionLabel(region: RegionName, precise: boolean): string {
  const parts = [shortenCityName(region.city), region.district];
  if (precise && region.neighborhood) parts.push(region.neighborhood);
  return parts.join(" ");
}

/** 지역명을 알 수 없을 때(한국 밖 등) 좌표로 표시한다. 예: "현재 위치(37.57, 126.98)" */
export function formatCoordinateLabel(latitude: number, longitude: number): string {
  const lat = latitude.toFixed(COORDINATE_DECIMAL_PLACES);
  const lon = longitude.toFixed(COORDINATE_DECIMAL_PLACES);
  return `현재 위치(${lat}, ${lon})`;
}
