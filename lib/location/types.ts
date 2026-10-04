/** 주소·지명 검색 결과 한 건 */
export interface LocationSearchResult {
  /** 목록에 표시할 이름 (예: "서울시청 · 서울 중구 태평로1가") */
  label: string;
  latitude: number;
  longitude: number;
  /** 결과를 준 서비스 */
  source: "kakao" | "open-meteo";
  /** ISO 국가 코드(예: "KR", "JP"). 알 수 있는 경우에만 채운다. */
  countryCode?: string;
  /**
   * 결과의 종류. address는 주소·행정구역·지명, place는 상호·시설(POI)이다.
   * 검색 결과를 정렬할 때 쓰며, 알 수 없으면 비워 둔다.
   */
  kind?: "address" | "place";
}
