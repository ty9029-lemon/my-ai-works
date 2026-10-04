import { describe, expect, it } from "vitest";
import { pickHomeLocation } from "@/lib/location/home-location";
import type { SavedLocation } from "@/lib/profile/types";

const NOW = new Date("2026-10-03T12:00:00.000Z");

function makeSaved(overrides: Partial<SavedLocation> = {}): SavedLocation {
  return {
    latRounded: 37.55,
    lonRounded: 126.91,
    regionName: "서울 마포구 합정동",
    source: "gps",
    savedAt: NOW.toISOString(),
    ...overrides,
  };
}

describe("pickHomeLocation", () => {
  it("저장된 위치가 없으면 기본 위치(서울)와 안내를 쓴다", () => {
    const result = pickHomeLocation(null, NOW);
    expect(result.fallbackNotice).toBe("기본 위치: 서울");
    expect(result.location).toMatchObject({ latRounded: 37.57, lonRounded: 126.98, source: "default" });
  });

  it.each(["gps", "search"] as const)("%s로 정한 위치는 안내 없이 그대로 쓴다", (source) => {
    const saved = makeSaved({ source });
    expect(pickHomeLocation(saved, NOW)).toEqual({ location: saved, fallbackNotice: null });
  });

  it("기본 위치를 직접 골랐으면 같은 안내를 붙인다", () => {
    const saved = makeSaved({ source: "default", regionName: "서울" });
    expect(pickHomeLocation(saved, NOW)).toEqual({
      location: saved,
      fallbackNotice: "기본 위치: 서울",
    });
  });
});
