import type { SafetyFactor } from "@/lib/safety/types";

/**
 * 안전 판정 기준값 (PRD F005). 모두 초안이며 출시 전 검증이 필요하다.
 * "이상/이하"는 경계값을 포함한다. 개인 보정은 적용하지 않는다.
 */

/** 풍속(m/s): 주의 / 중단 권고 */
export const WIND_CAUTION_MS = 10;
export const WIND_STOP_MS = 14;

/** UV 지수: 캡·선크림 / 시간대 변경 권고 / 강한 주의(노출 최소화) */
export const UV_SUNSCREEN_MIN = 6;
export const UV_AVOID_MIDDAY_MIN = 8;
export const UV_EXTREME_MIN = 11;

/** 체감온도 고온(℃): 고강도 운동 자제(확인 필요) / 중단 권고 */
export const HEAT_CAUTION_APPARENT_C = 31;
export const HEAT_STOP_APPARENT_C = 35;

/** 체감온도 저온(℃): 노출 피부 최소화 / 중단 권고 */
export const COLD_CAUTION_APPARENT_C = -10;
export const COLD_STOP_APPARENT_C = -15;

/** 빙판: 기온이 이 값 이하이고 해당 시각 또는 직전 3시간에 강수가 있으면 주의(℃) */
export const ICE_TEMPERATURE_MAX_C = 0;

/** PM2.5(㎍/㎥, 모델 추정치): 나쁨(강도·시간 단축) / 고강도 자제(확인 필요) / 중단 권고 */
export const PM25_BAD_MIN = 36;
export const PM25_AVOID_HIGH_INTENSITY_MIN = 56;
export const PM25_STOP_MIN = 76;

/** PM10(㎍/㎥, 모델 추정치): 나쁨 / 중단 권고 */
export const PM10_BAD_MIN = 81;
export const PM10_STOP_MIN = 151;

/** 야간 범위의 여유(분): 일몰 30분 전 ~ 일출 30분 후 */
export const NIGHT_MARGIN_MINUTES = 30;

/** 질환(심혈관·호흡기)이 있으면 "주의"를 "중단 권고"로 올리는 요소 */
export const HEALTH_ESCALATED_FACTORS: readonly SafetyFactor[] = [
  "pm25",
  "pm10",
  "heat",
  "cold",
];
