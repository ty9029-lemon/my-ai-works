"use client";

import { Crosshair, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOCATION } from "@/lib/constants";
import type { GeolocationFailure } from "@/lib/location/geolocation";

interface QuickActionsProps {
  locating: boolean;
  failure: GeolocationFailure | null;
  onLocate: () => void;
  onUseDefault: () => void;
}

/**
 * 현재 위치 다시 받기와 기본 위치 선택. 위치 권한은 "현재 위치 다시 받기"를 눌렀을 때만 요청하고,
 * 실패하면 원인별 안내를 보여 준다.
 */
export function QuickActions({ locating, failure, onLocate, onUseDefault }: QuickActionsProps) {
  return (
    <section aria-label="다른 방법" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onLocate} disabled={locating}>
          <Crosshair data-icon="inline-start" aria-hidden />
          {locating ? "위치 확인 중..." : "현재 위치 다시 받기"}
        </Button>
        <Button variant="secondary" onClick={onUseDefault}>
          <MapPinned data-icon="inline-start" aria-hidden />
          기본 위치({DEFAULT_LOCATION.regionName}) 사용
        </Button>
      </div>
      {failure && (
        <div role="alert" className="flex flex-col gap-1">
          <p className="text-sm text-danger">{failure.message}</p>
          {failure.recoveryHint && <p className="text-xs text-muted-foreground">{failure.recoveryHint}</p>}
        </div>
      )}
    </section>
  );
}
