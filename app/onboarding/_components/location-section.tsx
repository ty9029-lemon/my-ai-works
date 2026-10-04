"use client";

import { MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GeolocationFailure } from "@/lib/location/geolocation";
import { useCurrentPosition, type LocateStatus } from "@/lib/location/use-current-position";
import type { SavedLocation } from "@/lib/profile/types";
import { useSavedLocation } from "@/lib/profile/use-saved-location";

interface LocationSectionProps {
  /** 질문 3개에 답했는지. "주소로 찾기"는 프로필을 먼저 저장하므로 이때만 쓸 수 있다. */
  canSearch: boolean;
  onSearch: () => void;
}

interface LocationResultProps {
  status: LocateStatus;
  location: SavedLocation | null;
  failure: GeolocationFailure | null;
}

/** 위치 확인 결과: 성공하면 기준 위치를, 실패하면 원인별 안내(iOS 설정 경로 포함)를 보여 준다. */
function LocationResult({ status, location, failure }: LocationResultProps) {
  if (status === "success" && location) {
    return (
      <p role="status" className="text-sm">
        기준 위치: <span className="font-medium">{location.regionName}</span>
      </p>
    );
  }
  if (status === "failure" && failure) {
    return (
      <div role="alert" className="flex flex-col gap-1">
        <p className="text-sm text-danger">{failure.message}</p>
        {failure.recoveryHint && <p className="text-xs text-muted-foreground">{failure.recoveryHint}</p>}
      </div>
    );
  }
  return null;
}

/** 위치 영역의 제목과 "건너뛰어도 된다"는 안내 */
function LocationHeader() {
  return (
    <div className="flex flex-col gap-1">
      <h2 id="onboarding-location" className="text-sm font-medium">위치</h2>
      <p className="text-xs text-muted-foreground">
        건너뛰면 기본 위치(서울)로 시작하고, 나중에 바꿀 수 있어요.
      </p>
    </div>
  );
}

/**
 * 위치 선택 영역. "현재 위치 사용"을 눌렀을 때만 위치 권한을 요청하고,
 * 실패하면 원인별 안내와 "주소로 찾기"를 보여 준다. 위치는 건너뛰어도 된다(기본 위치: 서울).
 */
export function LocationSection({ canSearch, onSearch }: LocationSectionProps) {
  const { status, failure, locate } = useCurrentPosition();
  const { location, saveLocation } = useSavedLocation();

  async function handleLocate() {
    const result = await locate();
    if (result.ok) saveLocation(result.location);
  }

  return (
    <section aria-labelledby="onboarding-location" className="flex flex-col gap-3">
      <LocationHeader />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleLocate} disabled={status === "loading"}>
          <MapPin data-icon="inline-start" aria-hidden />
          {status === "loading" ? "위치 확인 중..." : "현재 위치 사용"}
        </Button>
        <Button variant="secondary" onClick={onSearch} disabled={!canSearch}>
          <Search data-icon="inline-start" aria-hidden />
          주소로 찾기
        </Button>
      </div>
      {!canSearch && (
        <p className="text-xs text-muted-foreground">주소 검색은 위 질문 3개에 답한 뒤 쓸 수 있어요.</p>
      )}
      <LocationResult status={status} location={location} failure={failure} />
    </section>
  );
}
