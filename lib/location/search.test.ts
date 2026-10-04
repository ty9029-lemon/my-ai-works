import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as geocodeGet } from "@/app/api/geocode/route";
import { GET as reverseGet } from "@/app/api/reverse-geocode/route";
import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/constants";
import { reverseGeocode, searchAddress } from "@/lib/location/api-client";
import {
  createKakaoClient,
  mapAddressDocuments,
  mapKeywordDocuments,
  mapRegionDocuments,
} from "@/lib/location/kakao";
import {
  mapGeocodingItems,
  searchOpenMeteoGeocoding,
} from "@/lib/location/open-meteo-geocoding";
import { searchLocations } from "@/lib/location/search-locations";
import type { KakaoClient } from "@/lib/location/kakao";
import type { LocationSearchResult } from "@/lib/location/types";

const KAKAO_RESULT: LocationSearchResult = {
  label: "서울 중구 태평로1가",
  latitude: 37.56,
  longitude: 126.97,
  source: "kakao",
};

/** JSON 응답을 돌려주는 가짜 fetch를 만든다. */
function jsonFetch(...bodies: unknown[]) {
  const queue = [...bodies];
  return vi.fn(
    async () => new Response(JSON.stringify(queue.shift() ?? {}), { status: 200 }),
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Kakao 응답 변환", () => {
  it("주소·키워드 검색 응답을 좌표 숫자 결과로 바꾼다", () => {
    expect(
      mapAddressDocuments([{ address_name: "서울 중구", x: "126.97", y: "37.56" }]),
    ).toEqual([
      { label: "서울 중구", latitude: 37.56, longitude: 126.97, source: "kakao", kind: "address" },
    ]);
    expect(
      mapKeywordDocuments([
        { place_name: "서울시청", address_name: "서울 중구", x: "126.97", y: "37.56" },
      ])[0].label,
    ).toBe("서울시청 · 서울 중구");
    expect(
      mapKeywordDocuments([
        { place_name: "서울시청", address_name: "서울 중구", x: "126.97", y: "37.56" },
      ])[0].kind,
    ).toBe("place");
  });

  it("좌표가 숫자가 아닌 문서는 버린다", () => {
    expect(
      mapAddressDocuments([{ address_name: "이상한 곳", x: "abc", y: "37" }]),
    ).toEqual([]);
  });

  it("행정동(H)을 우선해 지역명을 고른다", () => {
    const region = mapRegionDocuments([
      { region_type: "B", region_1depth_name: "서울특별시", region_2depth_name: "마포구", region_3depth_name: "합정동(법정)" },
      { region_type: "H", region_1depth_name: "서울특별시", region_2depth_name: "마포구", region_3depth_name: "서교동" },
    ]);
    expect(region).toEqual({ city: "서울특별시", district: "마포구", neighborhood: "서교동" });
    expect(mapRegionDocuments([])).toBeNull();
  });
});

describe("createKakaoClient", () => {
  it("인증 헤더를 붙이고, 주소 결과가 없으면 키워드 검색으로 넘어간다", async () => {
    const fetchFn = jsonFetch(
      { documents: [] },
      { documents: [{ place_name: "서울시청", address_name: "서울 중구", x: "126.97", y: "37.56" }] },
    );
    const client = createKakaoClient("secret-key", fetchFn as typeof fetch);
    const results = await client.searchAddress("서울시청");
    expect(results[0].label).toBe("서울시청 · 서울 중구");
    expect(fetchFn).toHaveBeenCalledTimes(2);
    const init = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(init[1].headers).toEqual({ Authorization: "KakaoAK secret-key" });
    expect(init[0]).toContain("search/address.json");
  });

  it("좌표→지역명 요청은 x에 경도, y에 위도를 넣는다", async () => {
    const fetchFn = jsonFetch({ documents: [] });
    await createKakaoClient("k", fetchFn as typeof fetch).reverseGeocode(37.5, 127.1);
    const url = new URL((fetchFn.mock.calls[0] as unknown as [string])[0]);
    expect(url.searchParams.get("x")).toBe("127.1");
    expect(url.searchParams.get("y")).toBe("37.5");
  });

  it("정상 응답이 아니면 예외를 던지고 메시지에 키를 넣지 않는다", async () => {
    const fetchFn = vi.fn(async () => new Response("{}", { status: 401 }));
    const client = createKakaoClient("secret-key", fetchFn as typeof fetch);
    const error = await client.searchAddress("x").catch((e: Error) => e);
    expect((error as Error).message).toContain("401");
    expect((error as Error).message).not.toContain("secret-key");
  });
});

describe("Open-Meteo Geocoding", () => {
  it("이름·행정구역·국가로 표시 이름을 만든다", () => {
    expect(
      mapGeocodingItems([
        { name: "Tokyo", latitude: 35.68, longitude: 139.69, admin1: "Tokyo", country: "Japan", country_code: "JP" },
      ])[0],
    ).toEqual({
      label: "Tokyo, Tokyo, Japan",
      latitude: 35.68,
      longitude: 139.69,
      source: "open-meteo",
      countryCode: "JP",
    });
  });

  it("결과가 없으면 빈 배열이고, 한국어·5건 제한으로 요청한다", async () => {
    const fetchFn = jsonFetch({});
    expect(await searchOpenMeteoGeocoding("zzz", fetchFn as typeof fetch)).toEqual([]);
    const url = new URL((fetchFn.mock.calls[0] as unknown as [string])[0]);
    expect(url.searchParams.get("language")).toBe("ko");
    expect(url.searchParams.get("count")).toBe("5");
  });
});

describe("searchLocations", () => {
  const tokyo = { name: "도쿄", latitude: 35.68, longitude: 139.69, country_code: "JP", country: "일본" };
  const seoulKr = { name: "서울", latitude: 37.57, longitude: 126.98, country_code: "KR", country: "대한민국" };
  const KAKAO_PLACE = { ...KAKAO_RESULT, label: "도쿄커틀릿 · 서울 성북구", kind: "place" } as const;
  const KAKAO_ADDRESS = { ...KAKAO_RESULT, label: "대구광역시", kind: "address" } as const;
  const kakaoOk: KakaoClient = { searchAddress: async () => [KAKAO_RESULT], reverseGeocode: async () => null };
  const kakaoPlaces: KakaoClient = { searchAddress: async () => [KAKAO_PLACE], reverseGeocode: async () => null };
  const kakaoAddresses: KakaoClient = { searchAddress: async () => [KAKAO_ADDRESS], reverseGeocode: async () => null };
  const kakaoEmpty: KakaoClient = { searchAddress: async () => [], reverseGeocode: async () => null };
  const kakaoBroken: KakaoClient = {
    searchAddress: async () => {
      throw new Error("down");
    },
    reverseGeocode: async () => null,
  };
  const failingFetch = vi.fn(async () => new Response("{}", { status: 500 }));

  it("Kakao가 상호만 찾았으면 한국 밖 지명 결과를 Kakao 결과보다 앞에 둔다", async () => {
    const fetchFn = jsonFetch({ results: [tokyo] });
    const results = await searchLocations("도쿄", kakaoPlaces, fetchFn as typeof fetch);
    expect(results.map((r) => r.source)).toEqual(["open-meteo", "kakao"]);
    expect(results[0]).toMatchObject({ label: "도쿄, 일본", countryCode: "JP" });
  });

  it("해외 결과가 여러 개여도 모두 상호 결과보다 앞에 오고 Open-Meteo가 준 순서를 유지한다", async () => {
    const fetchFn = jsonFetch({ results: [{ ...tokyo, name: "A" }, { ...tokyo, name: "B" }] });
    const results = await searchLocations("도쿄", kakaoPlaces, fetchFn as typeof fetch);
    expect(results.map((r) => r.label)).toEqual(["A, 일본", "B, 일본", KAKAO_PLACE.label]);
  });

  it("Kakao가 주소·행정구역을 찾았으면 Kakao 결과가 먼저이고 해외 결과는 뒤에 붙는다", async () => {
    const kpDaegu = { name: "대구", latitude: 38.9, longitude: 127.6, country_code: "KP", country: "북한" };
    const fetchFn = jsonFetch({ results: [kpDaegu] });
    const results = await searchLocations("대구", kakaoAddresses, fetchFn as typeof fetch);
    expect(results.map((r) => r.source)).toEqual(["kakao", "open-meteo"]);
    expect(results[0].label).toBe("대구광역시");
  });

  it("Kakao 결과의 종류를 모르면 Kakao 결과를 먼저 둔다(보수적)", async () => {
    const fetchFn = jsonFetch({ results: [tokyo] });
    const results = await searchLocations("도쿄", kakaoOk, fetchFn as typeof fetch);
    expect(results.map((r) => r.source)).toEqual(["kakao", "open-meteo"]);
  });

  it("Open-Meteo의 한국 결과는 Kakao와 중복이라 제외한다(해외가 없으면 Kakao만 남는다)", async () => {
    const fetchFn = jsonFetch({ results: [seoulKr, tokyo] });
    const results = await searchLocations("서울", kakaoPlaces, fetchFn as typeof fetch);
    expect(results.filter((r) => r.source === "open-meteo").map((r) => r.countryCode)).toEqual(["JP"]);
  });

  it("덧붙이는 해외 결과는 최대 3개다", async () => {
    const many = Array.from({ length: 5 }, (_, i) => ({ ...tokyo, latitude: i }));
    const fetchFn = jsonFetch({ results: many });
    const results = await searchLocations("도쿄", kakaoOk, fetchFn as typeof fetch);
    expect(results.filter((r) => r.source === "open-meteo")).toHaveLength(3);
  });

  it("국가 코드를 모르는 결과는 해외로 보고 덧붙인다", async () => {
    const fetchFn = jsonFetch({ results: [{ name: "어딘가", latitude: 1, longitude: 2 }] });
    const results = await searchLocations("어딘가", kakaoOk, fetchFn as typeof fetch);
    expect(results).toHaveLength(2);
  });

  it("Kakao가 0건이거나 실패하거나 키가 없으면 Open-Meteo 결과 전체를 쓴다(한국 포함)", async () => {
    for (const kakao of [kakaoEmpty, kakaoBroken, null]) {
      const fetchFn = jsonFetch({ results: [seoulKr, tokyo] });
      const results = await searchLocations("서울", kakao, fetchFn as typeof fetch);
      expect(results.map((r) => r.countryCode)).toEqual(["KR", "JP"]);
    }
  });

  it("Open-Meteo만 실패하면 Kakao 결과만 돌려준다", async () => {
    const results = await searchLocations("서울시청", kakaoOk, failingFetch as typeof fetch);
    expect(results).toEqual([KAKAO_RESULT]);
  });

  it("쓸 수 있는 결과가 없으면 예외를 던진다", async () => {
    await expect(searchLocations("x", kakaoEmpty, failingFetch as typeof fetch)).rejects.toThrow("500");
    await expect(searchLocations("x", kakaoBroken, failingFetch as typeof fetch)).rejects.toThrow("500");
    await expect(searchLocations("x", null, failingFetch as typeof fetch)).rejects.toThrow("500");
  });

  it("Kakao와 Open-Meteo를 함께 조회한다", async () => {
    const fetchFn = jsonFetch({ results: [] });
    await searchLocations("서울", kakaoOk, fetchFn as typeof fetch);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});

describe("GET /api/geocode", () => {
  it("검색어가 없거나 너무 길면 400을 돌려준다", async () => {
    const empty = await geocodeGet(new Request("http://localhost/api/geocode"));
    const blank = await geocodeGet(new Request("http://localhost/api/geocode?q=%20"));
    const tooLong = await geocodeGet(
      new Request(`http://localhost/api/geocode?q=${"a".repeat(MAX_SEARCH_QUERY_LENGTH + 1)}`),
    );
    expect([empty.status, blank.status, tooLong.status]).toEqual([400, 400, 400]);
  });
});

describe("GET /api/reverse-geocode", () => {
  it("좌표가 없거나 범위를 벗어나면 400을 돌려준다", async () => {
    const missing = await reverseGet(new Request("http://localhost/api/reverse-geocode"));
    const outOfRange = await reverseGet(
      new Request("http://localhost/api/reverse-geocode?lat=91&lon=127"),
    );
    expect([missing.status, outOfRange.status]).toEqual([400, 400]);
  });

  it("Kakao 키가 없으면 region을 null로 돌려준다", async () => {
    vi.stubEnv("KAKAO_REST_API_KEY", "");
    const response = await reverseGet(
      new Request("http://localhost/api/reverse-geocode?lat=37.5&lon=127"),
    );
    expect(await response.json()).toEqual({ region: null });
  });
});

describe("api-client", () => {
  it("검색 결과를 돌려주고, 서버 오류면 예외를 던진다", async () => {
    const ok = jsonFetch({ results: [KAKAO_RESULT] });
    expect(await searchAddress("서울", ok as typeof fetch)).toEqual([KAKAO_RESULT]);
    const fail = vi.fn(async () => new Response("{}", { status: 502 }));
    await expect(searchAddress("서울", fail as typeof fetch)).rejects.toThrow("502");
  });

  it("지역명 요청이 실패하면 null을 돌려준다", async () => {
    const fail = vi.fn(async () => {
      throw new Error("offline");
    });
    expect(await reverseGeocode(37.5, 127, fail as typeof fetch)).toBeNull();
    const ok = jsonFetch({ region: { city: "서울특별시", district: "마포구", neighborhood: null } });
    expect((await reverseGeocode(37.5, 127, ok as typeof fetch))?.district).toBe("마포구");
  });
});
