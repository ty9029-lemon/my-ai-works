"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserStorage } from "@/lib/profile/storage";
import {
  getWeatherWithFallback,
  type WeatherResult,
  type WeatherStorage,
} from "@/lib/weather/fetch-with-fallback";
import { createOpenMeteoProvider } from "@/lib/weather/open-meteo";
import type { NormalizedWeather, WeatherProvider, WeatherQuery } from "@/lib/weather/types";

/** 화면이 그리는 날씨 상태. loading은 조회 중이거나 위치를 아직 모르는 상태다. */
export type WeatherState =
  | { status: "loading" }
  | { status: "fresh"; data: NormalizedWeather }
  | { status: "stale"; data: NormalizedWeather; minutesAgo: number }
  | { status: "error" };

/** 테스트에서 교체할 수 있는 의존성 */
export interface UseWeatherOptions {
  provider?: WeatherProvider;
  storage?: WeatherStorage;
}

/** 저장소를 쓸 수 없을 때 대신 쓰는 빈 저장소(직전 데이터 없이 동작한다) */
const NO_STORAGE: WeatherStorage = { getItem: () => null, setItem: () => {} };

/**
 * 좌표의 날씨를 조회한다. 실패하면 직전 데이터("N분 전")로 대체하고,
 * 그것도 없으면 error 상태가 되어 화면이 "다시 시도"를 보여 줄 수 있다.
 * query가 null이면(위치를 아직 모르면) loading 상태로 둔다.
 * options의 provider·storage는 렌더마다 새로 만들지 말고 안정된 참조를 넘긴다.
 * (바뀔 때마다 다시 조회한다. 앱에서는 생략하면 기본값을 쓴다.)
 */
export function useWeather(query: WeatherQuery | null, options: UseWeatherOptions = {}) {
  const [reloadToken, setReloadToken] = useState(0);
  const [settled, setSettled] = useState<{ key: string; result: WeatherResult } | null>(null);
  const { latitude, longitude } = query ?? {};
  const key = query ? `${latitude}:${longitude}:${reloadToken}` : null;
  const { provider, storage } = options;

  useEffect(() => {
    if (key === null || latitude === undefined || longitude === undefined) return;
    let cancelled = false;
    getWeatherWithFallback(
      provider ?? createOpenMeteoProvider(),
      { latitude, longitude },
      storage ?? getBrowserStorage() ?? NO_STORAGE,
    ).then((result) => {
      if (!cancelled) setSettled({ key, result });
    });
    return () => {
      cancelled = true;
    };
  }, [key, latitude, longitude, provider, storage]);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);
  const state: WeatherState =
    settled !== null && settled.key === key ? settled.result : { status: "loading" };
  return { state, retry };
}
