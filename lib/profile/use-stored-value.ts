"use client";

import { useMemo, useSyncExternalStore } from "react";
import { readRawSnapshot, subscribeToStorage } from "@/lib/profile/storage-store";

/** 서버 렌더링과 하이드레이션 중에는 undefined(아직 읽지 않음)를 돌려주는 스냅샷 */
const getServerSnapshot = (): undefined => undefined;

/**
 * localStorage 값을 구독해 읽는다.
 * isLoaded가 false인 동안(서버·하이드레이션)에는 "값 없음"과 구분해서 화면을 그려야 한다.
 * @param parse 안정된(모듈 수준) 해석 함수여야 한다.
 */
export function useStoredValue<T>(
  key: string,
  parse: (raw: string | null) => T | null,
): { value: T | null; isLoaded: boolean } {
  const raw = useSyncExternalStore(
    subscribeToStorage,
    () => readRawSnapshot(key),
    getServerSnapshot,
  );
  const value = useMemo(() => (raw === undefined ? null : parse(raw)), [raw, parse]);
  return { value, isLoaded: raw !== undefined };
}
