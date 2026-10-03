import type { Mode } from "@/lib/profile/types";

/** 복장 카드에 표시할 추천 항목 */
export interface OutfitItems {
  top: string;
  bottom: string;
  /** 레이어 구성 설명 (예: "1~2겹") */
  layers: string;
  accessories: string[];
  /** 추가 문구·아이템 (우산, 선크림, 공통 팁 등) */
  extraNotes: string[];
}

/** 복장 추천 계산 결과 (저장하지 않는다) */
export interface OutfitRecommendation {
  mode: Mode;
  /** 추천 기준 출발 시각 (ISO 8601) */
  targetTime: string;
  /** 보정 체감온도(℃). 외출 모드는 보정 없는 체감온도와 같다. */
  adjustedApparentC: number;
  /** 해당하는 구간 식별자 */
  bandId: string;
  items: OutfitItems;
}
