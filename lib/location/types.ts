/** 주소·지명 검색 결과 한 건 */
export interface LocationSearchResult {
  /** 목록에 표시할 이름 (예: "서울시청 · 서울 중구 태평로1가") */
  label: string;
  latitude: number;
  longitude: number;
  /** 결과를 준 서비스 */
  source: "kakao" | "open-meteo";
}
