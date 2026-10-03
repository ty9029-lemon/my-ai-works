import {
  requestCurrentPosition,
  type GeolocationFailure,
  type RawPosition,
} from "@/lib/location/geolocation";
import { reverseGeocode } from "@/lib/location/api-client";
import {
  formatCoordinateLabel,
  formatRegionLabel,
  type RegionName,
} from "@/lib/location/region-label";
import { roundCoordinate } from "@/lib/location/round-coordinate";
import type { SavedLocation } from "@/lib/profile/types";

/** 현재 위치 확인 결과 */
export type LocateResult =
  | { ok: true; location: SavedLocation }
  | { ok: false; failure: GeolocationFailure };

/** 외부 의존성. 테스트에서 교체할 수 있다. */
export interface LocateDeps {
  requestPosition: () => Promise<RawPosition>;
  reverseGeocode: (latitude: number, longitude: number) => Promise<RegionName | null>;
  now: () => Date;
}

const DEFAULT_DEPS: LocateDeps = {
  requestPosition: () => requestCurrentPosition(),
  reverseGeocode: (latitude, longitude) => reverseGeocode(latitude, longitude),
  now: () => new Date(),
};

/** 던져진 값이 GeolocationFailure인지 확인한다. */
function isGeolocationFailure(error: unknown): error is GeolocationFailure {
  const failure = error as Partial<GeolocationFailure> | null;
  return typeof failure?.kind === "string" && typeof failure.message === "string";
}

/** 예상하지 못한 오류를 "위치 확인 불가" 실패로 바꾼다. */
function toFailure(error: unknown): GeolocationFailure {
  if (isGeolocationFailure(error)) return error;
  return {
    kind: "unavailable",
    message: "현재 위치를 확인할 수 없어요. 잠시 후 다시 시도하거나 주소로 검색해 주세요.",
  };
}

/**
 * 현재 위치를 확인하고 저장할 SavedLocation을 만든다. (저장은 호출하는 쪽에서 한다)
 * 지역명은 반올림 전 좌표로 요청해 동 단위까지 표시하고, 모르면 좌표로 표시한다.
 * 반환하는 좌표는 반올림되어 있어 원본 좌표는 남지 않는다.
 */
export async function locateCurrentPosition(
  deps: LocateDeps = DEFAULT_DEPS,
): Promise<LocateResult> {
  try {
    const { latitude, longitude } = await deps.requestPosition();
    const latRounded = roundCoordinate(latitude);
    const lonRounded = roundCoordinate(longitude);
    const region = await deps.reverseGeocode(latitude, longitude);
    const regionName = region
      ? formatRegionLabel(region, true)
      : formatCoordinateLabel(latRounded, lonRounded);
    const location: SavedLocation = {
      latRounded,
      lonRounded,
      regionName,
      source: "gps",
      savedAt: deps.now().toISOString(),
    };
    return { ok: true, location };
  } catch (error) {
    return { ok: false, failure: toFailure(error) };
  }
}
