import { describe, expect, it, vi } from "vitest";
import { GEOLOCATION_TIMEOUT_MS } from "@/lib/constants";
import {
  requestCurrentPosition,
  toGeolocationFailure,
} from "@/lib/location/geolocation";
import {
  formatCoordinateLabel,
  formatRegionLabel,
  shortenCityName,
} from "@/lib/location/region-label";
import { resolveFallbackLocation } from "@/lib/location/resolve-location";
import { roundCoordinate } from "@/lib/location/round-coordinate";
import type { SavedLocation } from "@/lib/profile/types";

const NOW = new Date("2026-10-03T12:00:00.000Z");

function makeLocation(overrides: Partial<SavedLocation> = {}): SavedLocation {
  return {
    latRounded: 35.18,
    lonRounded: 129.08,
    regionName: "부산 연제구",
    source: "search",
    savedAt: NOW.toISOString(),
    ...overrides,
  };
}

describe("roundCoordinate", () => {
  it("소수점 2자리로 반올림한다", () => {
    expect(roundCoordinate(37.5663)).toBe(37.57);
    expect(roundCoordinate(126.9779)).toBe(126.98);
    expect(roundCoordinate(37.564)).toBe(37.56);
  });

  it("음수 좌표도 반올림한다", () => {
    expect(roundCoordinate(-33.8688)).toBe(-33.87);
  });
});

describe("toGeolocationFailure", () => {
  it("에러 코드마다 다른 안내 문구를 돌려준다", () => {
    const denied = toGeolocationFailure(1);
    const unavailable = toGeolocationFailure(2);
    const timeout = toGeolocationFailure(3);
    expect(new Set([denied.message, unavailable.message, timeout.message]).size).toBe(3);
    expect([denied.kind, unavailable.kind, timeout.kind]).toEqual([
      "denied",
      "unavailable",
      "timeout",
    ]);
  });

  it("권한 거부일 때만 iOS 설정 경로를 안내한다", () => {
    expect(toGeolocationFailure(1).recoveryHint).toContain("Safari");
    expect(toGeolocationFailure(2).recoveryHint).toBeUndefined();
    expect(toGeolocationFailure(3).recoveryHint).toBeUndefined();
  });

  it("알 수 없는 코드는 위치 확인 불가로 처리한다", () => {
    expect(toGeolocationFailure(99).kind).toBe("unavailable");
  });
});

describe("requestCurrentPosition", () => {
  it("정확도 옵션을 끄고 타임아웃 상수를 적용해 요청한다", async () => {
    const getCurrentPosition = vi.fn(
      (
        success: PositionCallback,
        _error?: PositionErrorCallback | null,
        _options?: PositionOptions,
      ) =>
        success({ coords: { latitude: 37.5, longitude: 127 } } as GeolocationPosition),
    );
    const geolocation = { getCurrentPosition } as unknown as Geolocation;
    const position = await requestCurrentPosition(geolocation);
    expect(position).toEqual({ latitude: 37.5, longitude: 127 });
    expect(getCurrentPosition.mock.calls[0][2]).toEqual({
      enableHighAccuracy: false,
      timeout: GEOLOCATION_TIMEOUT_MS,
    });
  });

  it("실패하면 에러 코드에 맞는 실패 정보로 reject한다", async () => {
    const geolocation = {
      getCurrentPosition: (_: PositionCallback, error: PositionErrorCallback) =>
        error({ code: 1 } as GeolocationPositionError),
    } as unknown as Geolocation;
    await expect(requestCurrentPosition(geolocation)).rejects.toMatchObject({
      kind: "denied",
    });
  });

  it("Geolocation이 없으면 unsupported로 reject한다", async () => {
    await expect(requestCurrentPosition(undefined)).rejects.toMatchObject({
      kind: "unsupported",
    });
  });
});

describe("resolveFallbackLocation", () => {
  it("마지막 저장 위치를 가장 먼저 쓰고 대체 안내를 붙인다", () => {
    const lastSaved = makeLocation({ regionName: "서울 마포구" });
    const result = resolveFallbackLocation({ lastSaved, searched: makeLocation() }, NOW);
    expect(result.location).toBe(lastSaved);
    expect(result.fallbackNotice).toBe("마지막 저장 위치: 서울 마포구");
  });

  it("저장 위치가 없으면 주소 검색 결과를 쓰고 안내는 붙이지 않는다", () => {
    const searched = makeLocation();
    const result = resolveFallbackLocation({ lastSaved: null, searched }, NOW);
    expect(result).toEqual({ location: searched, fallbackNotice: null });
  });

  it("모두 없으면 기본 위치(서울)와 안내를 돌려준다", () => {
    const result = resolveFallbackLocation({ lastSaved: null, searched: null }, NOW);
    expect(result.fallbackNotice).toBe("기본 위치: 서울");
    expect(result.location).toMatchObject({
      latRounded: 37.57,
      lonRounded: 126.98,
      source: "default",
      savedAt: NOW.toISOString(),
    });
  });
});

describe("region label", () => {
  const region = { city: "서울특별시", district: "마포구", neighborhood: "합정동" };

  it("반올림 전 좌표로 얻은 지역명은 동까지 표시한다", () => {
    expect(formatRegionLabel(region, true)).toBe("서울 마포구 합정동");
  });

  it("반올림 좌표뿐이면 구까지만 표시한다", () => {
    expect(formatRegionLabel(region, false)).toBe("서울 마포구");
  });

  it("동 정보가 없으면 구까지만 표시한다", () => {
    expect(formatRegionLabel({ ...region, neighborhood: null }, true)).toBe(
      "서울 마포구",
    );
  });

  it("시·도 접미사를 줄인다", () => {
    expect(shortenCityName("부산광역시")).toBe("부산");
    expect(shortenCityName("경기도")).toBe("경기");
    expect(shortenCityName("제주특별자치도")).toBe("제주");
  });

  it("지역명을 모르면 좌표로 표시한다", () => {
    expect(formatCoordinateLabel(35.6762, 139.6503)).toBe("현재 위치(35.68, 139.65)");
  });
});
