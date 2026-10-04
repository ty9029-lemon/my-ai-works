"use client";

import { useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { resolveFallbackLocation } from "@/lib/location/resolve-location";
import type { LocationSearchResult } from "@/lib/location/types";
import { useCurrentPosition } from "@/lib/location/use-current-position";
import { useSavedLocation } from "@/lib/profile/use-saved-location";
import { QuickActions } from "./quick-actions";
import { SearchSection } from "./search-section";

/**
 * 위치 검색 화면. 주소 검색 결과·현재 위치·기본 위치 중 하나를 고르면
 * 기준 위치로 저장하고 홈으로 이동한다.
 */
export function LocationScreen() {
  const router = useRouter();
  const { saveLocation } = useSavedLocation();
  const { status, failure, locate } = useCurrentPosition();

  /** 주소 검색 결과를 기준 위치로 저장하고 홈으로 이동한다. */
  function handleSelect(result: LocationSearchResult) {
    saveLocation({
      latRounded: result.latitude,
      lonRounded: result.longitude,
      regionName: result.label,
      source: "search",
    });
    router.replace("/");
  }

  async function handleLocate() {
    const result = await locate();
    if (!result.ok) return;
    saveLocation(result.location);
    router.replace("/");
  }

  function handleUseDefault() {
    saveLocation(resolveFallbackLocation({ lastSaved: null, searched: null }).location);
    router.replace("/");
  }

  return (
    <PageContainer>
      <PageHeader title="위치 바꾸기" backHref="/" />
      <div className="flex w-full max-w-md flex-col gap-8">
        <SearchSection onSelect={handleSelect} />
        <QuickActions
          locating={status === "loading"}
          failure={failure}
          onLocate={handleLocate}
          onUseDefault={handleUseDefault}
        />
      </div>
    </PageContainer>
  );
}
