import type { Intensity, Sensitivity } from "@/lib/profile/types";

/**
 * 복장 추천 기준값 (PRD F004). 모두 초안이며 출시 전 검증이 필요하다.
 * 구간은 "하한 포함, 상한 미포함"이다. 컴포넌트에는 숫자를 직접 쓰지 않는다.
 * (고온 31℃, 미세먼지 나쁨 등 안전 기준과 같은 값은 `lib/safety/rules.ts`를 쓴다.)
 */

/** 보정 표: 체감온도에 더하는 값(℃) */
export interface AdjustmentTable {
  sensitivity: Record<Sensitivity, number>;
  intensity: Record<Intensity, number>;
}

/** 민감도 보정: 추위 많이 탐 -3 / 보통 0 / 더위 많이 탐 +3. 장거리 +1은 확인 필요 */
export const DEFAULT_ADJUSTMENT_TABLE: AdjustmentTable = {
  sensitivity: { cold: -3, normal: 0, hot: 3 },
  intensity: { jog: 0, long: 1, interval: 4 },
};

/** 체감온도 구간. minC 이상이면 해당 구간이며, 마지막으로 맞는 구간을 쓴다. */
export interface OutfitBand {
  id: string;
  /** 구간 하한(℃, 포함). 가장 낮은 구간은 -Infinity */
  minC: number;
  top: string;
  bottom: string | null;
  layers: string | null;
  accessories: readonly string[];
}

/** 러닝 복장 구간(8개): 보정 체감온도 기준 */
export const RUNNING_BANDS: readonly OutfitBand[] = [
  {
    id: "run-below-minus10",
    minC: Number.NEGATIVE_INFINITY,
    top: "보온 베이스 + 미드 + 윈드재킷",
    bottom: "기모 타이츠",
    layers: "3겹",
    accessories: ["두꺼운 장갑", "방한모", "버프", "방한 마스크"],
  },
  {
    id: "run-minus10-0",
    minC: -10,
    top: "보온 베이스 + 미드",
    bottom: "기모 타이츠",
    layers: "3겹",
    accessories: ["두꺼운 장갑", "방한모", "넥게이터"],
  },
  {
    id: "run-0-5",
    minC: 0,
    top: "베이스 + 긴팔",
    bottom: "타이츠",
    layers: "2겹",
    accessories: ["장갑", "비니", "넥게이터"],
  },
  {
    id: "run-5-10",
    minC: 5,
    top: "긴팔(또는 반팔 + 암슬리브)",
    bottom: "타이츠(또는 쇼츠 + 레깅스)",
    layers: "1~2겹, 얇은 윈드재킷 휴대",
    accessories: ["얇은 장갑", "이어밴드"],
  },
  {
    id: "run-10-15",
    minC: 10,
    top: "긴팔 또는 얇은 긴팔",
    bottom: "쇼츠 또는 7부 타이츠",
    layers: "1겹, 윈드재킷 허리에 휴대",
    accessories: [],
  },
  {
    id: "run-15-20",
    minC: 15,
    top: "반팔",
    bottom: "쇼츠",
    layers: "1겹",
    accessories: ["캡(선택)"],
  },
  {
    id: "run-20-25",
    minC: 20,
    top: "메쉬 반팔 또는 민소매",
    bottom: "쇼츠",
    layers: "1겹",
    accessories: ["캡", "선크림"],
  },
  {
    id: "run-25-plus",
    minC: 25,
    top: "민소매 또는 메쉬 반팔(밝은 색)",
    bottom: "쇼츠",
    layers: "1겹",
    accessories: ["캡", "선글라스", "선크림", "수분"],
  },
];

/** 외출 복장 구간(6개): 보정하지 않은 체감온도 기준 */
export const OUTING_BANDS: readonly OutfitBand[] = [
  {
    id: "outing-below-0",
    minC: Number.NEGATIVE_INFINITY,
    top: "패딩",
    bottom: null,
    layers: null,
    accessories: ["목도리", "장갑", "모자"],
  },
  { id: "outing-0-10", minC: 0, top: "코트·니트", bottom: null, layers: null, accessories: [] },
  { id: "outing-10-17", minC: 10, top: "자켓·가디건", bottom: null, layers: null, accessories: [] },
  {
    id: "outing-17-23",
    minC: 17,
    top: "얇은 긴팔",
    bottom: null,
    layers: "가벼운 겉옷",
    accessories: [],
  },
  { id: "outing-23-28", minC: 23, top: "반팔", bottom: null, layers: null, accessories: [] },
  {
    id: "outing-28-plus",
    minC: 28,
    top: "가벼운 옷차림",
    bottom: null,
    layers: null,
    accessories: ["양산", "수분"],
  },
];

/** 강수확률(%) 이 값 이상이면 비를 대비한다(러닝: 방수 재킷, 외출: 우산) */
export const RAIN_PROBABILITY_MIN = 60;

/** 기온(℃)이 이 값 이하이고 강수가 있으면 눈으로 본다 */
export const SNOW_TEMPERATURE_MAX_C = 0;

/** 일교차(최고 - 최저, ℃) 가 이 값 이상이면 외출 시 겉옷을 추가한다 */
export const DIURNAL_RANGE_LAYER_MIN_C = 10;

/** 비 오는 날 러닝 아이템. 눈이면 신발 항목이 추가된다. */
export const RUN_RAIN_ITEMS: readonly string[] = ["방수(발수) 재킷", "챙 있는 캡"];
export const RUN_SNOW_EXTRA_ITEMS: readonly string[] = ["접지력 좋은 신발"];

/** 야간 러닝 아이템 */
export const RUN_NIGHT_ITEMS: readonly string[] = [
  "반사 소재 의류",
  "헤드램프 또는 클립 라이트",
];

export const RUN_INTERVAL_NOTE = "웜업·쿨다운용 겉옷을 챙기세요";
export const RUN_HYDRATION_NOTE = "물과 전해질을 챙기세요";

/** 러닝 모드에서 항상 표시하는 공통 팁 */
export const RUN_COMMON_TIPS: readonly string[] = [
  "면 소재는 피하세요",
  "출발할 때 약간 춥게 느껴지는 정도가 적당합니다",
  "쓸림 방지 크림이나 테이프를 쓰세요",
  "주변 소리가 들리는 이어폰을 쓰세요",
];

/** 외출 추가 아이템 */
export const OUTING_UMBRELLA = "우산";
export const OUTING_MASK = "마스크";
export const OUTING_SUNSCREEN = "선크림";
export const OUTING_EXTRA_LAYER = "겉옷 추가";
