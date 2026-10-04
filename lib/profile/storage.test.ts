import { describe, expect, it } from "vitest";
import {
  clearAllAppData,
  clearLocation,
  clearProfile,
  LOCATION_STORAGE_KEY,
  loadLocation,
  loadProfile,
  PROFILE_STORAGE_KEY,
  saveLocation,
  saveProfile,
  type KeyValueStorage,
} from "@/lib/profile/storage";

const NOW = new Date("2026-10-03T12:00:00.000Z");

const PROFILE_INPUT = {
  sensitivity: "cold",
  defaultIntensity: "interval",
  defaultMode: "run",
  hasHealthCondition: false,
} as const;

const LOCATION_INPUT = {
  latRounded: 37.5663,
  lonRounded: 126.9779,
  regionName: "서울 중구",
  source: "gps",
} as const;

/** 메모리 기반 가짜 저장소 */
function makeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  const storage: KeyValueStorage & { data: Record<string, string> } = {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
  return storage;
}

describe("프로필 저장", () => {
  it("저장한 프로필을 그대로 읽어 오고 updatedAt을 채운다", () => {
    const storage = makeStorage();
    const saved = saveProfile(storage, PROFILE_INPUT, NOW);
    expect(saved.updatedAt).toBe(NOW.toISOString());
    expect(loadProfile(storage)).toEqual(saved);
  });

  it("저장된 값이 없으면 null이다", () => {
    expect(loadProfile(makeStorage())).toBeNull();
  });

  it("손상된 JSON이면 null이다", () => {
    expect(loadProfile(makeStorage({ [PROFILE_STORAGE_KEY]: "{broken" }))).toBeNull();
  });

  it("허용되지 않은 값이 들어 있으면 null이다", () => {
    const bad = { ...PROFILE_INPUT, sensitivity: "freezing", updatedAt: "x" };
    expect(
      loadProfile(makeStorage({ [PROFILE_STORAGE_KEY]: JSON.stringify(bad) })),
    ).toBeNull();
  });

  it("초기화하면 다시 null이 된다(다음 진입 때 온보딩)", () => {
    const storage = makeStorage();
    saveProfile(storage, PROFILE_INPUT, NOW);
    clearProfile(storage);
    expect(loadProfile(storage)).toBeNull();
  });

  it("저장소가 가득 차 쓰기에 실패해도 예외를 던지지 않는다", () => {
    const storage = makeStorage();
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    expect(() => saveProfile(storage, PROFILE_INPUT, NOW)).not.toThrow();
    expect(loadProfile(storage)).toBeNull();
  });
});

describe("위치 저장", () => {
  it("좌표를 소수점 2자리로 반올림해 저장하고 savedAt을 채운다", () => {
    const storage = makeStorage();
    const saved = saveLocation(storage, LOCATION_INPUT, NOW);
    expect(saved).toMatchObject({ latRounded: 37.57, lonRounded: 126.98 });
    expect(saved.savedAt).toBe(NOW.toISOString());
    expect(JSON.parse(storage.data[LOCATION_STORAGE_KEY]).latRounded).toBe(37.57);
  });

  it("저장한 위치를 읽어 오고, 지우면 null이다", () => {
    const storage = makeStorage();
    const saved = saveLocation(storage, LOCATION_INPUT, NOW);
    expect(loadLocation(storage)).toEqual(saved);
    clearLocation(storage);
    expect(loadLocation(storage)).toBeNull();
  });

  it("좌표가 숫자가 아니거나 출처가 허용 값이 아니면 null이다", () => {
    const badCoordinate = { ...LOCATION_INPUT, latRounded: "37", savedAt: "x" };
    const badSource = { ...LOCATION_INPUT, source: "ip", savedAt: "x" };
    for (const bad of [badCoordinate, badSource]) {
      const storage = makeStorage({ [LOCATION_STORAGE_KEY]: JSON.stringify(bad) });
      expect(loadLocation(storage)).toBeNull();
    }
  });
});

describe("전체 초기화", () => {
  /** key/length를 지원하는 가짜 저장소 */
  function makeClearable(initial: Record<string, string>) {
    const base = makeStorage(initial);
    return Object.assign(base, {
      get length() {
        return Object.keys(base.data).length;
      },
      key: (index: number) => Object.keys(base.data)[index] ?? null,
    });
  }

  it("프로필·위치·날씨 캐시를 지우고 다른 키는 남긴다", () => {
    const storage = makeClearable({
      [PROFILE_STORAGE_KEY]: "{}",
      [LOCATION_STORAGE_KEY]: "{}",
      "weather:last:37.57:126.98": "{}",
      "weather:last:35.18:129.08": "{}",
      "other-app:setting": "keep",
    });
    clearAllAppData(storage);
    expect(Object.keys(storage.data)).toEqual(["other-app:setting"]);
  });

  it("저장된 것이 없어도 예외 없이 끝난다", () => {
    expect(() => clearAllAppData(makeClearable({}))).not.toThrow();
  });
});
