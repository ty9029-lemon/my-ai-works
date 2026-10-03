"use client";

import { useCallback, useState } from "react";
import type { GeolocationFailure } from "@/lib/location/geolocation";
import { locateCurrentPosition, type LocateResult } from "@/lib/location/locate";

/** 위치 확인 진행 상태 */
export type LocateStatus = "idle" | "loading" | "success" | "failure";

/**
 * "현재 위치 사용" 버튼에서 쓰는 훅. 페이지가 열릴 때 자동으로 요청하지 않고,
 * locate()를 호출했을 때만 권한을 요청한다. 결과는 호출하는 쪽에서 저장한다.
 */
export function useCurrentPosition() {
  const [status, setStatus] = useState<LocateStatus>("idle");
  const [failure, setFailure] = useState<GeolocationFailure | null>(null);

  const locate = useCallback(async (): Promise<LocateResult> => {
    setStatus("loading");
    setFailure(null);
    const result = await locateCurrentPosition();
    setStatus(result.ok ? "success" : "failure");
    if (!result.ok) setFailure(result.failure);
    return result;
  }, []);

  return { status, failure, locate };
}
