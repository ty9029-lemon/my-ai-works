/** 위치 권한 요청 타임아웃(ms). 초안 값이며 출시 전 검증이 필요하다. */
export const GEOLOCATION_TIMEOUT_MS = 10_000;

/** 서버 요청·저장에 쓰는 좌표 반올림 자릿수 (약 1.1km 정밀도) */
export const COORDINATE_DECIMAL_PLACES = 2;

/** 기본 위치(서울시청). 위치 확인에 모두 실패했을 때 사용한다. */
export const DEFAULT_LOCATION = {
  regionName: "서울",
  latitude: 37.5663,
  longitude: 126.9779,
} as const;

/** 출발 시각 선택과 미니 예보가 다루는 시간 범위(시간) */
export const FORECAST_HOURS = 12;

/** 현재 시각 1개 + 이후 FORECAST_HOURS개의 시간별 값 */
export const HOURLY_POINT_COUNT = FORECAST_HOURS + 1;

/** 직전 강수(빙판 판정)를 계산하려고 추가로 가져오는 과거 시간 수 */
export const PAST_HOURS = 3;

/** 날씨 공급자에서 가져오는 일별 예보 일수 (오늘 + 내일 일출 확인용) */
export const DAILY_FORECAST_DAYS = 2;

/** 주소 검색어 최대 길이 */
export const MAX_SEARCH_QUERY_LENGTH = 100;

/** 1분(ms). "N분 전 데이터" 계산에 쓴다. */
export const MS_PER_MINUTE = 60_000;

/** 민감도·강도 보정 합계의 상한(℃). 안전장치 용도의 초안 값이다. */
export const MAX_ADJUSTMENT_C = 7;
