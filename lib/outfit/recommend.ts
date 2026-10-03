import { calculateAdjustment } from "@/lib/outfit/adjust";
import {
  DIURNAL_RANGE_LAYER_MIN_C,
  OUTING_BANDS,
  OUTING_EXTRA_LAYER,
  OUTING_MASK,
  OUTING_SUNSCREEN,
  OUTING_UMBRELLA,
  RAIN_PROBABILITY_MIN,
  RUN_COMMON_TIPS,
  RUN_HYDRATION_NOTE,
  RUN_INTERVAL_NOTE,
  RUN_NIGHT_ITEMS,
  RUN_RAIN_ITEMS,
  RUN_SNOW_EXTRA_ITEMS,
  RUNNING_BANDS,
  SNOW_TEMPERATURE_MAX_C,
  type OutfitBand,
} from "@/lib/outfit/rules";
import type { OutfitAdjustments, OutfitRecommendation } from "@/lib/outfit/types";
import type { Intensity, Mode, Sensitivity } from "@/lib/profile/types";
import { isNightTime } from "@/lib/safety/evaluate";
import {
  HEAT_CAUTION_APPARENT_C,
  PM10_BAD_MIN,
  PM25_BAD_MIN,
  UV_SUNSCREEN_MIN,
} from "@/lib/safety/rules";
import type { HourlyPoint, NormalizedWeather } from "@/lib/weather/types";

/** 소수점 계산 오차가 구간 경계 판정을 흔들지 않도록 체감온도를 반올림하는 자릿수 */
const TEMPERATURE_DECIMAL_PLACES = 1;
const DECIMAL_BASE = 10;

/** 복장 추천 입력. 시계를 읽지 않으므로 같은 입력이면 항상 같은 결과다. */
export interface OutfitInput {
  mode: Mode;
  intensity: Intensity;
  sensitivity: Sensitivity;
  /** 추천 기준 출발 시각의 시간별 값 */
  point: HourlyPoint;
  /** 일교차·일출·일몰을 얻기 위한 날씨 전체 */
  weather: NormalizedWeather;
}

/** 체감온도에 맞는 구간을 고른다. 하한 포함, 상한 미포함이라 마지막으로 맞는 구간을 쓴다. */
export function selectBand(bands: readonly OutfitBand[], valueC: number): OutfitBand {
  return bands.reduce((found, band) => (valueC >= band.minC ? band : found), bands[0]);
}

/** 소수점 1자리로 반올림한다. */
function roundTemperature(valueC: number): number {
  const factor = DECIMAL_BASE ** TEMPERATURE_DECIMAL_PLACES;
  return Math.round(valueC * factor) / factor;
}

/** 비·눈 대비 아이템. 강수확률이 높거나 강수가 있으면 방수 아이템, 0℃ 이하(눈)이면 신발도 추가한다. */
function rainItems(point: HourlyPoint): string[] {
  const wet = point.precipitationProbability >= RAIN_PROBABILITY_MIN || point.precipitationMm > 0;
  if (!wet) return [];
  const snowing = point.temperatureC <= SNOW_TEMPERATURE_MAX_C;
  return snowing ? [...RUN_RAIN_ITEMS, ...RUN_SNOW_EXTRA_ITEMS] : [...RUN_RAIN_ITEMS];
}

/** 러닝 모드의 추가 문구·아이템. 공통 팁은 항상 마지막에 붙는다. */
function runningNotes(
  point: HourlyPoint,
  weather: NormalizedWeather,
  intensity: Intensity,
): string[] {
  const notes: string[] = [];
  if (intensity === "interval") notes.push(RUN_INTERVAL_NOTE);
  notes.push(...rainItems(point));
  if (point.apparentTemperatureC >= HEAT_CAUTION_APPARENT_C) notes.push(RUN_HYDRATION_NOTE);
  if (isNightTime(point.time, weather)) notes.push(...RUN_NIGHT_ITEMS);
  return [...notes, ...RUN_COMMON_TIPS];
}

/** 미세먼지가 '나쁨' 이상인지(모델 추정치) */
function isDustBad(point: HourlyPoint): boolean {
  const pm25Bad = point.pm25 !== null && point.pm25 >= PM25_BAD_MIN;
  const pm10Bad = point.pm10 !== null && point.pm10 >= PM10_BAD_MIN;
  return pm25Bad || pm10Bad;
}

/** 외출 모드의 추가 아이템: 우산·마스크·선크림·일교차 겉옷 */
function outingNotes(point: HourlyPoint, weather: NormalizedWeather): string[] {
  const notes: string[] = [];
  if (point.precipitationProbability >= RAIN_PROBABILITY_MIN) notes.push(OUTING_UMBRELLA);
  if (isDustBad(point)) notes.push(OUTING_MASK);
  if (point.uvIndex !== null && point.uvIndex >= UV_SUNSCREEN_MIN) notes.push(OUTING_SUNSCREEN);
  if (weather.dailyMaxC - weather.dailyMinC >= DIURNAL_RANGE_LAYER_MIN_C) {
    notes.push(OUTING_EXTRA_LAYER);
  }
  return notes;
}

/** 외출 모드는 보정하지 않으므로 보정 내역은 모두 0이다. */
function noAdjustment(sensitivity: Sensitivity, intensity: Intensity): OutfitAdjustments {
  return { sensitivity, sensitivityC: 0, intensity, intensityC: 0, totalC: 0 };
}

/**
 * 출발 시각의 예보값으로 복장을 추천한다.
 * 러닝 모드는 보정 체감온도로, 외출 모드는 보정하지 않은 체감온도로 구간을 정한다.
 */
export function recommendOutfit(input: OutfitInput): OutfitRecommendation {
  const { mode, intensity, sensitivity, point, weather } = input;
  const running = mode === "run";
  const adjustments = running
    ? calculateAdjustment(sensitivity, intensity)
    : noAdjustment(sensitivity, intensity);
  const adjustedApparentC = roundTemperature(point.apparentTemperatureC + adjustments.totalC);
  const band = selectBand(running ? RUNNING_BANDS : OUTING_BANDS, adjustedApparentC);
  const extraNotes = running
    ? runningNotes(point, weather, intensity)
    : outingNotes(point, weather);
  return {
    mode,
    targetTime: point.time,
    apparentC: point.apparentTemperatureC,
    adjustedApparentC,
    adjustments,
    bandId: band.id,
    items: {
      top: band.top,
      bottom: band.bottom,
      layers: band.layers,
      accessories: [...band.accessories],
      extraNotes,
    },
  };
}
