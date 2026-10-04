import type { LocationSearchResult } from "@/lib/location/types";
import type { SavedLocation } from "@/lib/profile/types";

/**
 * 주소 검색 결과를 기준 위치로 바꾼다. 출처는 "search"이고, 표시 이름은 검색 결과의 이름을 쓴다.
 * 좌표는 저장할 때 반올림되므로 여기서는 그대로 둔다.
 */
export function toSearchedLocation(result: LocationSearchResult): Omit<SavedLocation, "savedAt"> {
  return {
    latRounded: result.latitude,
    lonRounded: result.longitude,
    regionName: result.label,
    source: "search",
  };
}
