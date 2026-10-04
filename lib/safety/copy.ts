import type { SafetyFactor, SafetyLevel } from "@/lib/safety/types";

/** 안전 등급 표시 이름 */
export const SAFETY_LEVEL_LABEL: Record<SafetyLevel, string> = {
  ok: "정상",
  caution: "주의",
  stop: "중단 권고",
};

/** 등급이 정상일 때 보여 주는 설명 */
export const SAFETY_OK_MESSAGE = "특별한 위험 요인이 없어요.";

/** 홈 화면 하단에 항상 표시하는 면책 문구 */
export const MEDICAL_DISCLAIMER =
  "의료 조언이 아닙니다. 흉통·호흡곤란·어지럼이 있으면 즉시 운동을 중단하세요.";

/** 설정 화면에 싣는 면책 문구 전문(홈 하단의 짧은 문구와 함께 보여 준다) */
export const GENERAL_DISCLAIMER =
  "복장 추천과 안전 등급은 예보 수치로 계산한 참고 정보이며 실제 상황과 다를 수 있어요. 기상특보와 현장 상황을 함께 확인하세요.";

/** 기상특보를 자동 판정하지 않으므로 배너 아래에 항상 표시하는 안내 */
export const LIGHTNING_NOTICE = "천둥·번개가 치면 즉시 실내로 대피하세요.";

/** 미세먼지·UV 수치 옆에 붙이는 라벨 */
export const MODEL_ESTIMATE_LABEL = "모델 추정치";

/** 모델 추정치 라벨을 눌렀을 때의 안내 */
export const MODEL_ESTIMATE_GUIDE =
  "실측값과 다를 수 있어요. 정확한 수치는 에어코리아에서 확인하세요.";

/** 체감온도 사유 옆에 붙이는 안내 */
export const FEELS_LIKE_NOTE =
  "Open-Meteo 체감온도는 기상청 체감온도와 계산식이 다릅니다.";

/** 값을 받지 못한 요소의 표시 이름 */
export const MISSING_FACTOR_LABEL: Partial<Record<SafetyFactor, string>> = {
  uv: "UV",
  pm25: "초미세먼지",
  pm10: "미세먼지",
};
