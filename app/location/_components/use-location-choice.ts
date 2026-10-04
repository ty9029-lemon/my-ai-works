"use client";

import { useRouter } from "next/navigation";

import { resolveFallbackLocation } from "@/lib/location/resolve-location";
import { toSearchedLocation } from "@/lib/location/search-result";
import type { LocationSearchResult } from "@/lib/location/types";
import { useCurrentPosition } from "@/lib/location/use-current-position";
import type { SavedLocation } from "@/lib/profile/types";
import { useSavedLocation } from "@/lib/profile/use-saved-location";

/**
 * 위치 검색 화면의 선택 처리. 검색 결과·현재 위치·기본 위치 중 하나를 고르면
 * 기준 위치로 저장하고 홈으로 이동한다. 현재 위치 확인에 실패하면 이동하지 않고 원인을 알린다.
 */
export function useLocationChoice() {
  const router = useRouter();
  const { saveLocation } = useSavedLocation();
  const { status, failure, locate } = useCurrentPosition();

  /** 기준 위치로 저장하고 홈으로 이동한다. */
  function saveAndGoHome(location: Omit<SavedLocation, "savedAt">) {
    saveLocation(location);
    router.replace("/");
  }

  async function useCurrentLocation() {
    const result = await locate();
    if (result.ok) saveAndGoHome(result.location);
  }

  return {
    locating: status === "loading",
    failure,
    selectSearchResult: (result: LocationSearchResult) => saveAndGoHome(toSearchedLocation(result)),
    useCurrentLocation,
    useDefaultLocation: () => saveAndGoHome(resolveFallbackLocation({ lastSaved: null, searched: null }).location),
  };
}
