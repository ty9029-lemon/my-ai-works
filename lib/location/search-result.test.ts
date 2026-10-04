import { describe, expect, it } from "vitest";
import { toSearchedLocation } from "@/lib/location/search-result";

describe("toSearchedLocation", () => {
  it("검색 결과를 'search' 출처의 기준 위치로 바꾼다", () => {
    expect(
      toSearchedLocation({ label: "서울 중구 태평로1가", latitude: 37.5663, longitude: 126.9779, source: "kakao", kind: "address" }),
    ).toEqual({
      latRounded: 37.5663,
      lonRounded: 126.9779,
      regionName: "서울 중구 태평로1가",
      source: "search",
    });
  });

  it("종류·국가 코드 같은 부가 정보는 저장할 위치에 넣지 않는다", () => {
    const location = toSearchedLocation({ label: "도쿄, 일본", latitude: 35.68, longitude: 139.69, source: "open-meteo", countryCode: "JP" });
    expect(Object.keys(location).sort()).toEqual(["latRounded", "lonRounded", "regionName", "source"]);
  });
});
