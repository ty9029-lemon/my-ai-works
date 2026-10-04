"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LocationLabel } from "@/components/location/location-label";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataSourceNote } from "@/components/weather/data-source-note";
import { StaleNotice } from "@/components/weather/stale-notice";
import { pickHomeLocation } from "@/lib/location/home-location";
import type { SavedLocation, UserProfile } from "@/lib/profile/types";
import { useProfile } from "@/lib/profile/use-profile";
import { useSavedLocation } from "@/lib/profile/use-saved-location";
import { MEDICAL_DISCLAIMER } from "@/lib/safety/copy";
import { useWeather, type WeatherState } from "@/lib/weather/use-weather";
import { HomeForecast } from "./home-forecast";

/** 프로필·위치·날씨를 기다리는 동안 보여 주는 자리표시 */
function HomeLoading() {
  return (
    <div role="status" aria-label="불러오는 중" className="flex flex-col gap-6">
      <div className="h-40 animate-pulse rounded-4xl bg-muted" />
      <div className="h-24 animate-pulse rounded-4xl bg-muted" />
      <div className="h-56 animate-pulse rounded-4xl bg-muted" />
    </div>
  );
}

/** 날씨 상태에 맞는 본문. 직전 데이터를 보여 줄 때는 "N분 전 데이터" 알림을 위에 붙인다. */
function WeatherBody({ state, profile, onRetry }: { state: WeatherState; profile: UserProfile; onRetry: () => void }) {
  if (state.status === "loading") return <HomeLoading />;
  if (state.status === "error") return <StaleNotice status="error" onRetry={onRetry} />;
  return (
    <>
      {state.status === "stale" && (
        <StaleNotice status="stale" minutesAgo={state.minutesAgo} onRetry={onRetry} />
      )}
      <HomeForecast weather={state.data} profile={profile} />
    </>
  );
}

/** 위치·날씨를 불러와 홈 화면을 구성한다. 출처와 면책 문구는 상태와 무관하게 항상 보인다. */
function HomeContent({ profile, savedLocation }: { profile: UserProfile; savedLocation: SavedLocation | null }) {
  const { location, fallbackNotice } = pickHomeLocation(savedLocation);
  const { state, retry } = useWeather({ latitude: location.latRounded, longitude: location.lonRounded });
  const fetchedAt = state.status === "fresh" || state.status === "stale" ? state.data.fetchedAt : null;
  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-2">
        <LocationLabel regionName={location.regionName} fallbackNotice={fallbackNotice} />
        <Link href="/settings" aria-label="설정" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <Settings aria-hidden />
        </Link>
      </div>
      <WeatherBody state={state} profile={profile} onRetry={retry} />
      <footer className="flex flex-col gap-3 text-xs text-muted-foreground">
        <DataSourceNote fetchedAt={fetchedAt} />
        <p>{MEDICAL_DISCLAIMER}</p>
      </footer>
    </PageContainer>
  );
}

/**
 * 홈 화면. 프로필이 없으면 온보딩으로 보내고, 프로필·위치를 읽는 동안에는 자리표시를 보여 준다.
 */
export function HomeScreen() {
  const router = useRouter();
  const { profile, isLoaded: profileLoaded } = useProfile();
  const { location, isLoaded: locationLoaded } = useSavedLocation();

  useEffect(() => {
    if (profileLoaded && !profile) router.replace("/onboarding");
  }, [profileLoaded, profile, router]);

  if (!profileLoaded || !locationLoaded || !profile) {
    return (
      <PageContainer>
        <HomeLoading />
      </PageContainer>
    );
  }
  return <HomeContent profile={profile} savedLocation={location} />;
}
