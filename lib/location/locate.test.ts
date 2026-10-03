import { describe, expect, it, vi } from "vitest";
import type { GeolocationFailure } from "@/lib/location/geolocation";
import { locateCurrentPosition, type LocateDeps } from "@/lib/location/locate";

const NOW = new Date("2026-10-03T12:00:00.000Z");
const RAW = { latitude: 37.54717, longitude: 126.90849 };
const REGION = { city: "서울특별시", district: "마포구", neighborhood: "합정동" };

function makeDeps(overrides: Partial<LocateDeps> = {}): LocateDeps {
  return {
    requestPosition: async () => RAW,
    reverseGeocode: async () => REGION,
    now: () => NOW,
    ...overrides,
  };
}

describe("locateCurrentPosition", () => {
  it("반올림 전 좌표로 지역명을 받고, 저장할 좌표는 반올림한다", async () => {
    const reverse = vi.fn(async () => REGION);
    const result = await locateCurrentPosition(makeDeps({ reverseGeocode: reverse }));
    expect(reverse).toHaveBeenCalledWith(RAW.latitude, RAW.longitude);
    expect(result).toEqual({
      ok: true,
      location: {
        latRounded: 37.55,
        lonRounded: 126.91,
        regionName: "서울 마포구 합정동",
        source: "gps",
        savedAt: NOW.toISOString(),
      },
    });
  });

  it("지역명을 모르면(한국 밖 등) 좌표로 표시한다", async () => {
    const result = await locateCurrentPosition(
      makeDeps({ reverseGeocode: async () => null }),
    );
    expect(result).toMatchObject({
      ok: true,
      location: { regionName: "현재 위치(37.55, 126.91)" },
    });
  });

  it("위치 요청이 실패하면 실패 정보를 그대로 돌려준다", async () => {
    const failure: GeolocationFailure = { kind: "denied", message: "거부됨" };
    const result = await locateCurrentPosition(
      makeDeps({ requestPosition: async () => Promise.reject(failure) }),
    );
    expect(result).toEqual({ ok: false, failure });
  });

  it("예상하지 못한 오류는 위치 확인 불가로 바꾼다", async () => {
    const result = await locateCurrentPosition(
      makeDeps({ requestPosition: async () => Promise.reject(new Error("boom")) }),
    );
    expect(result).toMatchObject({ ok: false, failure: { kind: "unavailable" } });
  });
});
