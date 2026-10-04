"use client";

import { useState } from "react";

import { OutfitCard } from "@/components/outfit/outfit-card";
import { SafetyBanner } from "@/components/safety/safety-banner";
import { AirQualitySummary } from "@/components/weather/air-quality-summary";
import { HourlyForecast } from "@/components/weather/hourly-forecast";
import { formatHourLabel } from "@/lib/format";
import { recommendOutfit } from "@/lib/outfit/recommend";
import type { UserProfile } from "@/lib/profile/types";
import { evaluateSafety } from "@/lib/safety/evaluate";
import type { NormalizedWeather } from "@/lib/weather/types";
import { ConditionChips } from "./condition-chips";

interface HomeForecastProps {
  weather: NormalizedWeather;
  profile: UserProfile;
}

/**
 * 날씨를 받은 뒤의 홈 본문: 안전 배너 → 조건 칩 → 복장 카드 → 대기질 → 12시간 예보.
 * 모드·강도는 프로필 기본값에서 시작하며 저장하지 않는다. 출발 시각은 "지금"에서 시작한다.
 */
export function HomeForecast({ weather, profile }: HomeForecastProps) {
  const [mode, setMode] = useState(profile.defaultMode);
  const [intensity, setIntensity] = useState(profile.defaultIntensity);
  const [hourIndex, setHourIndex] = useState(0);
  const index = Math.min(hourIndex, weather.hourly.length - 1);
  const point = weather.hourly[index];
  const hourOptions = weather.hourly.map((p, i) => ({ value: String(i), label: formatHourLabel(p.time, i) }));

  const safety = evaluateSafety({ point, weather, hasHealthCondition: profile.hasHealthCondition });
  const outfit = recommendOutfit({ mode, intensity, sensitivity: profile.sensitivity, point, weather });

  return (
    <>
      <SafetyBanner result={safety} />
      <ConditionChips
        mode={mode}
        onModeChange={setMode}
        intensity={intensity}
        onIntensityChange={setIntensity}
        hourOptions={hourOptions}
        hourIndex={index}
        onHourChange={setHourIndex}
      />
      <OutfitCard recommendation={outfit} timeLabel={formatHourLabel(point.time, index)} />
      <AirQualitySummary point={point} />
      <HourlyForecast points={weather.hourly} />
    </>
  );
}
