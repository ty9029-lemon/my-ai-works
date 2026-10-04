import { DEFAULT_LOCATION } from "@/lib/constants";
import { resolveFallbackLocation, type ResolvedLocation } from "@/lib/location/resolve-location";
import type { SavedLocation } from "@/lib/profile/types";

/**
 * 홈 화면이 쓸 기준 위치를 정한다.
 * - 저장된 위치가 없으면 기본 위치(서울)와 "기본 위치: 서울" 안내를 쓴다.
 * - 사용자가 "기본 위치"를 직접 골랐다면(source=default) 같은 안내를 붙인다.
 * - 현재 위치·주소 검색으로 정한 위치는 안내 없이 그대로 쓴다.
 */
export function pickHomeLocation(
  saved: SavedLocation | null,
  now: Date = new Date(),
): ResolvedLocation {
  if (!saved) return resolveFallbackLocation({ lastSaved: null, searched: null }, now);
  const isDefault = saved.source === "default";
  return {
    location: saved,
    fallbackNotice: isDefault ? `기본 위치: ${DEFAULT_LOCATION.regionName}` : null,
  };
}
