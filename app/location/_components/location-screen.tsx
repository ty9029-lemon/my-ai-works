"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { QuickActions } from "./quick-actions";
import { SearchSection } from "./search-section";
import { useLocationChoice } from "./use-location-choice";

/**
 * 위치 검색 화면. 주소 검색 결과·현재 위치·기본 위치 중 하나를 고르면
 * 기준 위치로 저장하고 홈으로 이동한다.
 */
export function LocationScreen() {
  const choice = useLocationChoice();
  return (
    <PageContainer>
      <PageHeader title="위치 바꾸기" backHref="/" />
      <div className="flex w-full max-w-md flex-col gap-8">
        <SearchSection onSelect={choice.selectSearchResult} />
        <QuickActions
          locating={choice.locating}
          failure={choice.failure}
          onLocate={choice.useCurrentLocation}
          onUseDefault={choice.useDefaultLocation}
        />
      </div>
    </PageContainer>
  );
}
