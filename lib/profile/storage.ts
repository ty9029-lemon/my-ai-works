import { roundCoordinate } from "@/lib/location/round-coordinate";
import { logger } from "@/lib/logger";
import { WEATHER_CACHE_KEY_PREFIX } from "@/lib/weather/fetch-with-fallback";
import {
  INTENSITIES,
  LOCATION_SOURCES,
  MODES,
  SENSITIVITIES,
  type SavedLocation,
  type UserProfile,
} from "@/lib/profile/types";

/** 저장소 키. 저장 형식을 바꾸면 버전을 올린다. */
export const PROFILE_STORAGE_KEY = "profile:v1";
export const LOCATION_STORAGE_KEY = "location:v1";

/** localStorage 호환 저장소 */
export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** 브라우저 localStorage를 돌려준다. 서버이거나 접근이 막혀 있으면 null이다. */
export function getBrowserStorage(): KeyValueStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** 값이 허용 목록에 속하는지 확인한다. */
function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

/** 파싱된 값이 UserProfile 형태인지 확인한다. */
export function isUserProfile(value: unknown): value is UserProfile {
  const v = value as Partial<UserProfile> | null;
  return (
    isOneOf(SENSITIVITIES, v?.sensitivity) &&
    isOneOf(INTENSITIES, v?.defaultIntensity) &&
    isOneOf(MODES, v?.defaultMode) &&
    typeof v?.hasHealthCondition === "boolean" &&
    typeof v?.updatedAt === "string"
  );
}

/** 파싱된 값이 SavedLocation 형태인지 확인한다. */
export function isSavedLocation(value: unknown): value is SavedLocation {
  const v = value as Partial<SavedLocation> | null;
  return (
    Number.isFinite(v?.latRounded) &&
    Number.isFinite(v?.lonRounded) &&
    typeof v?.regionName === "string" &&
    isOneOf(LOCATION_SOURCES, v?.source) &&
    typeof v?.savedAt === "string"
  );
}

/** 저장된 JSON 문자열을 검증한다. 없거나 손상되었거나 형태가 다르면 null이다. */
function parseValidated<T>(
  raw: string | null,
  isValid: (value: unknown) => value is T,
): T | null {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 저장소에서 원본 문자열을 읽는다. 접근이 막혀 있으면 null이다. */
export function readRawItem(storage: KeyValueStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** 저장된 프로필 JSON 문자열을 해석한다. */
export function parseProfile(raw: string | null): UserProfile | null {
  return parseValidated(raw, isUserProfile);
}

/** 저장된 위치 JSON 문자열을 해석한다. */
export function parseLocation(raw: string | null): SavedLocation | null {
  return parseValidated(raw, isSavedLocation);
}

/** 값을 JSON으로 저장한다. 실패(용량 초과 등)하면 기록만 남기고 false를 돌려준다. */
function write(storage: KeyValueStorage, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.warn({ error, key }, "localStorage 저장 실패");
    return false;
  }
}

/** 저장된 프로필을 읽는다. */
export function loadProfile(storage: KeyValueStorage): UserProfile | null {
  return parseProfile(readRawItem(storage, PROFILE_STORAGE_KEY));
}

/** 프로필을 저장한다. updatedAt은 저장 시각으로 채운다. */
export function saveProfile(
  storage: KeyValueStorage,
  input: Omit<UserProfile, "updatedAt">,
  now: Date = new Date(),
): UserProfile {
  const profile: UserProfile = { ...input, updatedAt: now.toISOString() };
  write(storage, PROFILE_STORAGE_KEY, profile);
  return profile;
}

/** 프로필을 지운다. 다음 진입 때 온보딩이 다시 나온다. */
export function clearProfile(storage: KeyValueStorage): void {
  storage.removeItem(PROFILE_STORAGE_KEY);
}

/** 저장된 기준 위치를 읽는다. */
export function loadLocation(storage: KeyValueStorage): SavedLocation | null {
  return parseLocation(readRawItem(storage, LOCATION_STORAGE_KEY));
}

/** 기준 위치를 저장한다. 좌표는 저장 전에 반올림하고, savedAt은 저장 시각으로 채운다. */
export function saveLocation(
  storage: KeyValueStorage,
  input: Omit<SavedLocation, "savedAt">,
  now: Date = new Date(),
): SavedLocation {
  const location: SavedLocation = {
    ...input,
    latRounded: roundCoordinate(input.latRounded),
    lonRounded: roundCoordinate(input.lonRounded),
    savedAt: now.toISOString(),
  };
  write(storage, LOCATION_STORAGE_KEY, location);
  return location;
}

/** 기준 위치를 지운다. */
export function clearLocation(storage: KeyValueStorage): void {
  storage.removeItem(LOCATION_STORAGE_KEY);
}

/** 저장된 키 목록을 훑을 수 있는 localStorage 호환 저장소 */
export type ClearableStorage = KeyValueStorage & Pick<Storage, "key" | "length">;

/** 저장소의 모든 키를 모은다. 지우는 도중 순서가 바뀌므로 먼저 복사해 둔다. */
function listKeys(storage: ClearableStorage): string[] {
  return Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
    (key): key is string => key !== null,
  );
}

/**
 * 앱이 저장한 데이터를 모두 지운다: 프로필, 기준 위치, 날씨 캐시.
 * 다음 진입 때 온보딩이 다시 나온다. 다른 앱의 키는 건드리지 않는다.
 */
export function clearAllAppData(storage: ClearableStorage): void {
  clearProfile(storage);
  clearLocation(storage);
  listKeys(storage)
    .filter((key) => key.startsWith(WEATHER_CACHE_KEY_PREFIX))
    .forEach((key) => storage.removeItem(key));
}
