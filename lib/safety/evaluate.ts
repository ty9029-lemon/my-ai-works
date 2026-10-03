import { MS_PER_MINUTE } from "@/lib/constants";
import {
  COLD_CAUTION_APPARENT_C,
  COLD_STOP_APPARENT_C,
  HEALTH_ESCALATED_FACTORS,
  HEAT_CAUTION_APPARENT_C,
  HEAT_STOP_APPARENT_C,
  ICE_TEMPERATURE_MAX_C,
  NIGHT_MARGIN_MINUTES,
  PM10_BAD_MIN,
  PM10_STOP_MIN,
  PM25_AVOID_HIGH_INTENSITY_MIN,
  PM25_BAD_MIN,
  PM25_STOP_MIN,
  UV_AVOID_MIDDAY_MIN,
  UV_EXTREME_MIN,
  UV_SUNSCREEN_MIN,
  WIND_CAUTION_MS,
  WIND_STOP_MS,
} from "@/lib/safety/rules";
import type {
  SafetyFactor,
  SafetyLevel,
  SafetyReason,
  SafetyResult,
} from "@/lib/safety/types";
import type { HourlyPoint, NormalizedWeather } from "@/lib/weather/types";

/** 안전 판정 입력. 시계를 읽지 않으므로 같은 입력이면 항상 같은 결과다. */
export interface SafetyInput {
  /** 판정할 출발 시각의 시간별 값 */
  point: HourlyPoint;
  /** 일출·일몰 시각을 얻기 위한 날씨 전체 */
  weather: NormalizedWeather;
  /** 심혈관·호흡기 질환 여부 */
  hasHealthCondition: boolean;
}

const LEVEL_RANK: Record<SafetyLevel, number> = { ok: 0, caution: 1, stop: 2 };
const MODEL_ESTIMATE_NOTE = "모델 추정치예요. 에어코리아 실측을 확인하세요.";
const MODEL_ESTIMATE_STOP_NOTE =
  "모델 추정치 기준 '매우 나쁨' 수준일 수 있어요. 에어코리아 실측을 확인하세요.";
const HEALTH_SUFFIX = " (질환 보수 기준 적용)";

type FactorEvaluator = (point: HourlyPoint, weather: NormalizedWeather) => SafetyReason | null;

/** 사유 한 건을 만든다. */
function reason(
  factor: SafetyFactor,
  level: SafetyReason["level"],
  message: string,
): SafetyReason {
  return { factor, level, message };
}

/** 풍속: 10m/s 이상 주의, 14m/s 이상 중단 권고 */
function evaluateWind(point: HourlyPoint): SafetyReason | null {
  const v = point.windSpeedMs;
  if (v >= WIND_STOP_MS) {
    return reason("wind", "stop", `풍속 ${v.toFixed(1)}m/s: 바람이 매우 강해요. 실내 운동을 권해요.`);
  }
  if (v >= WIND_CAUTION_MS) {
    return reason("wind", "caution", `풍속 ${v.toFixed(1)}m/s: 바람이 강해요. 노출된 코스를 피하세요.`);
  }
  return null;
}

/** UV: 6 이상 캡·선크림, 8 이상 시간대 변경 권고, 11 이상 노출 최소화(모두 주의 등급) */
function evaluateUv(point: HourlyPoint): SafetyReason | null {
  const uv = point.uvIndex;
  if (uv === null) return null;
  if (uv >= UV_EXTREME_MIN) {
    return reason("uv", "caution", `UV 지수 ${uv}: 매우 강해요. 노출을 최소화하세요.`);
  }
  if (uv >= UV_AVOID_MIDDAY_MIN) {
    return reason("uv", "caution", `UV 지수 ${uv}: 강해요. 다른 시간대를 권해요.`);
  }
  if (uv >= UV_SUNSCREEN_MIN) {
    return reason("uv", "caution", `UV 지수 ${uv}: 캡과 선크림을 챙기세요.`);
  }
  return null;
}

/** 체감온도 고온: 31℃ 이상 주의, 35℃ 이상 중단 권고 */
function evaluateHeat(point: HourlyPoint): SafetyReason | null {
  const t = point.apparentTemperatureC;
  if (t >= HEAT_STOP_APPARENT_C) {
    return reason("heat", "stop", `체감온도 ${t.toFixed(1)}℃: 위험한 더위예요. 실내 운동을 권해요.`);
  }
  if (t >= HEAT_CAUTION_APPARENT_C) {
    return reason("heat", "caution", `체감온도 ${t.toFixed(1)}℃: 고강도 운동은 자제하세요.`);
  }
  return null;
}

/** 체감온도 저온: -10℃ 이하 주의, -15℃ 이하 중단 권고 */
function evaluateCold(point: HourlyPoint): SafetyReason | null {
  const t = point.apparentTemperatureC;
  if (t <= COLD_STOP_APPARENT_C) {
    return reason("cold", "stop", `체감온도 ${t.toFixed(1)}℃: 위험한 추위예요. 실내 운동을 권해요.`);
  }
  if (t <= COLD_CAUTION_APPARENT_C) {
    return reason("cold", "caution", `체감온도 ${t.toFixed(1)}℃: 노출 피부를 최소화하고 거리를 줄이세요.`);
  }
  return null;
}

/** 빙판: 기온 0℃ 이하이고 해당 시각 또는 직전 3시간에 강수가 있으면 주의 */
function evaluateIce(point: HourlyPoint): SafetyReason | null {
  const rained = point.precipitationMm > 0 || point.precipitationPrev3hMm > 0;
  if (point.temperatureC > ICE_TEMPERATURE_MAX_C || !rained) return null;
  return reason(
    "ice",
    "caution",
    `기온 ${point.temperatureC.toFixed(1)}℃, 최근 강수: 길이 미끄러울 수 있어요. 코스 변경을 권해요.`,
  );
}

/** PM2.5: 36 이상 단축, 56 이상 고강도 자제, 76 이상 중단 권고 (모델 추정치) */
function evaluatePm25(point: HourlyPoint): SafetyReason | null {
  const v = point.pm25;
  if (v === null) return null;
  const label = `초미세먼지(PM2.5) ${v.toFixed(0)}㎍/㎥`;
  if (v >= PM25_STOP_MIN) return reason("pm25", "stop", `${label}: ${MODEL_ESTIMATE_STOP_NOTE}`);
  if (v >= PM25_AVOID_HIGH_INTENSITY_MIN) {
    return reason("pm25", "caution", `${label}: 고강도 운동은 자제하세요. ${MODEL_ESTIMATE_NOTE}`);
  }
  if (v >= PM25_BAD_MIN) {
    return reason("pm25", "caution", `${label}: 강도와 시간을 줄이세요. ${MODEL_ESTIMATE_NOTE}`);
  }
  return null;
}

/** PM10: 81 이상 주의, 151 이상 중단 권고 (모델 추정치) */
function evaluatePm10(point: HourlyPoint): SafetyReason | null {
  const v = point.pm10;
  if (v === null) return null;
  const label = `미세먼지(PM10) ${v.toFixed(0)}㎍/㎥`;
  if (v >= PM10_STOP_MIN) return reason("pm10", "stop", `${label}: ${MODEL_ESTIMATE_STOP_NOTE}`);
  if (v >= PM10_BAD_MIN) {
    return reason("pm10", "caution", `${label}: 강도와 시간을 줄이세요. ${MODEL_ESTIMATE_NOTE}`);
  }
  return null;
}

/** 시각 문자열(시간대 없는 ISO)을 비교용 밀리초로 바꾼다. 모든 값을 같은 방식으로 해석해 상대 비교만 한다. */
function toComparableMs(iso: string): number {
  return Date.parse(`${iso}Z`);
}

/**
 * 선택 시각이 야간인지 판정한다.
 * 일몰 30분 전 ~ 다음 일출 30분 후, 또는 오늘 일출 30분 후 이전이면 야간이다.
 */
export function isNightTime(time: string, weather: NormalizedWeather): boolean {
  const margin = NIGHT_MARGIN_MINUTES * MS_PER_MINUTE;
  const t = toComparableMs(time);
  const beforeTodaySunrise = t <= toComparableMs(weather.sunrise) + margin;
  const afterSunset =
    t >= toComparableMs(weather.sunset) - margin &&
    t <= toComparableMs(weather.nextSunrise) + margin;
  return beforeTodaySunrise || afterSunset;
}

/** 야간: 반사 소재·라이트 착용 안내 (주의 등급) */
function evaluateNight(point: HourlyPoint, weather: NormalizedWeather): SafetyReason | null {
  if (!isNightTime(point.time, weather)) return null;
  return reason("night", "caution", "야간 러닝: 반사 소재 의류와 라이트를 착용하세요.");
}

const EVALUATORS: FactorEvaluator[] = [
  evaluateWind,
  evaluateUv,
  evaluateHeat,
  evaluateCold,
  evaluateIce,
  evaluatePm25,
  evaluatePm10,
  evaluateNight,
];

/** 질환이 있으면 미세먼지·폭염·한파의 "주의"를 "중단 권고"로 올린다. */
function applyHealthCondition(item: SafetyReason): SafetyReason {
  const escalate = item.level === "caution" && HEALTH_ESCALATED_FACTORS.includes(item.factor);
  return escalate
    ? { ...item, level: "stop", message: `${item.message}${HEALTH_SUFFIX}` }
    : item;
}

/** 값이 없어 판정하지 못한 요소(UV·PM2.5·PM10)를 찾는다. */
function findMissingFactors(point: HourlyPoint): SafetyFactor[] {
  const missing: SafetyFactor[] = [];
  if (point.uvIndex === null) missing.push("uv");
  if (point.pm25 === null) missing.push("pm25");
  if (point.pm10 === null) missing.push("pm10");
  return missing;
}

/**
 * 선택한 출발 시각의 원본 기상값으로 안전 등급을 판정한다. 개인 보정은 적용하지 않는다.
 * 가장 높은 등급을 결과 등급으로 하고, 걸린 사유는 등급이 높은 순으로 모두 나열한다.
 */
export function evaluateSafety({ point, weather, hasHealthCondition }: SafetyInput): SafetyResult {
  const reasons = EVALUATORS.map((evaluate) => evaluate(point, weather))
    .filter((item) => item !== null)
    .map((item) => (hasHealthCondition ? applyHealthCondition(item) : item))
    .sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level]);
  const level: SafetyLevel = reasons[0]?.level ?? "ok";
  return { level, reasons, missingFactors: findMissingFactors(point), targetTime: point.time };
}
