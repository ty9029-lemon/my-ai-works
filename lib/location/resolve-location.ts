import { DEFAULT_LOCATION } from "@/lib/constants";
import { roundCoordinate } from "@/lib/location/round-coordinate";
import type { SavedLocation } from "@/lib/profile/types";

/** 위치 확인에 실패했을 때 쓸 후보들 */
export interface LocationCandidates {
  /** 마지막으로 저장된 위치 */
  lastSaved: SavedLocation | null;
  /** 사용자가 주소 검색으로 고른 위치 */
  searched: SavedLocation | null;
}

/** 대체 위치와, 화면에 함께 보여 줄 대체 안내 문구 */
export interface ResolvedLocation {
  location: SavedLocation;
  /** 대체 위치를 쓰는 중이면 안내 문구, 아니면 null */
  fallbackNotice: string | null;
}

/** 기본 위치(서울시청)를 SavedLocation 형태로 만든다. */
function createDefaultLocation(now: Date): SavedLocation {
  return {
    latRounded: roundCoordinate(DEFAULT_LOCATION.latitude),
    lonRounded: roundCoordinate(DEFAULT_LOCATION.longitude),
    regionName: DEFAULT_LOCATION.regionName,
    source: "default",
    savedAt: now.toISOString(),
  };
}

/**
 * 현재 위치를 얻지 못했을 때 쓸 위치를 정한다.
 * 순서: 마지막 저장 위치 → 주소 검색 결과 → 기본 위치(서울). IP 기반 위치는 쓰지 않는다.
 * 주소 검색 결과는 사용자가 직접 골랐으므로 안내 문구를 붙이지 않는다.
 */
export function resolveFallbackLocation(
  { lastSaved, searched }: LocationCandidates,
  now: Date = new Date(),
): ResolvedLocation {
  if (lastSaved) {
    return {
      location: lastSaved,
      fallbackNotice: `마지막 저장 위치: ${lastSaved.regionName}`,
    };
  }
  if (searched) {
    return { location: searched, fallbackNotice: null };
  }
  return {
    location: createDefaultLocation(now),
    fallbackNotice: `기본 위치: ${DEFAULT_LOCATION.regionName}`,
  };
}
