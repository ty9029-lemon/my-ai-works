import type { Intensity, Mode, Sensitivity } from "@/lib/profile/types";

/** 복장 카드에 표시할 추천 항목. 외출 모드에서는 해당 정보가 없는 칸이 null이다. */
export interface OutfitItems {
  top: string;
  bottom: string | null;
  /** 레이어 구성 설명 (예: "1~2겹") */
  layers: string | null;
  accessories: string[];
  /** 추가 문구·아이템 (우산, 선크림, 공통 팁 등) */
  extraNotes: string[];
}

/** 체감온도 보정 내역 ("추위 -3, 인터벌 +4" 표시용). 외출 모드는 모두 0이다. */
export interface OutfitAdjustments {
  sensitivity: Sensitivity;
  /** 민감도 보정(℃) */
  sensitivityC: number;
  intensity: Intensity;
  /** 운동 강도 보정(℃) */
  intensityC: number;
  /** 합계(상한 적용 후, ℃) */
  totalC: number;
}

/** 복장 추천 계산 결과 (저장하지 않는다) */
export interface OutfitRecommendation {
  mode: Mode;
  /** 추천 기준 출발 시각 (ISO 8601) */
  targetTime: string;
  /** 보정하지 않은 실제 체감온도(℃) */
  apparentC: number;
  /** 구간 선택에 쓴 체감온도(℃). 러닝은 보정 체감온도, 외출은 apparentC와 같다. */
  adjustedApparentC: number;
  adjustments: OutfitAdjustments;
  /** 해당하는 구간 식별자 */
  bandId: string;
  items: OutfitItems;
}
