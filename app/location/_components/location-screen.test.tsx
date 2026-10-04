// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchAddress } from "@/lib/location/api-client";
import { locateCurrentPosition } from "@/lib/location/locate";
import { LOCATION_STORAGE_KEY } from "@/lib/profile/storage";
import { LocationScreen } from "./location-screen";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/location/api-client", () => ({ searchAddress: vi.fn(), reverseGeocode: vi.fn() }));
vi.mock("@/lib/location/locate", () => ({ locateCurrentPosition: vi.fn() }));

const search = vi.mocked(searchAddress);
const locate = vi.mocked(locateCurrentPosition);

const SEOUL_RESULT = { label: "서울 중구 태평로1가", latitude: 37.5663, longitude: 126.9779, source: "kakao" } as const;

function savedLocation() {
  return JSON.parse(localStorage.getItem(LOCATION_STORAGE_KEY) as string);
}

beforeEach(() => {
  localStorage.clear();
  router.replace.mockClear();
  search.mockReset();
  locate.mockReset();
});

describe("LocationScreen: 주소 검색", () => {
  it("빈 입력이거나 공백뿐이면 검색 버튼이 비활성화된다", async () => {
    render(<LocationScreen />);
    const button = screen.getByRole("button", { name: "검색" });
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText("주소 또는 지명"), "   ");
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText("주소 또는 지명"), "합정동");
    expect(button).toBeEnabled();
  });

  it("검색하면 공백을 다듬은 검색어로 요청하고 결과를 보여 준다", async () => {
    search.mockResolvedValue([SEOUL_RESULT]);
    render(<LocationScreen />);
    await userEvent.type(screen.getByLabelText("주소 또는 지명"), "  서울시청 ");
    await userEvent.click(screen.getByRole("button", { name: "검색" }));
    expect(search).toHaveBeenCalledWith("서울시청");
    expect(await screen.findByRole("button", { name: "서울 중구 태평로1가" })).toBeInTheDocument();
  });

  it("결과를 고르면 반올림한 좌표로 저장하고 홈으로 이동한다", async () => {
    search.mockResolvedValue([SEOUL_RESULT]);
    render(<LocationScreen />);
    await userEvent.type(screen.getByLabelText("주소 또는 지명"), "서울시청");
    await userEvent.click(screen.getByRole("button", { name: "검색" }));
    await userEvent.click(await screen.findByRole("button", { name: "서울 중구 태평로1가" }));
    expect(savedLocation()).toMatchObject({ latRounded: 37.57, lonRounded: 126.98, regionName: "서울 중구 태평로1가", source: "search" });
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("결과가 없으면 안내 문구를 보여 준다", async () => {
    search.mockResolvedValue([]);
    render(<LocationScreen />);
    await userEvent.type(screen.getByLabelText("주소 또는 지명"), "zzzz");
    await userEvent.click(screen.getByRole("button", { name: "검색" }));
    expect(await screen.findByText(/검색 결과가 없어요/)).toBeInTheDocument();
  });

  it("검색이 실패하면 오류를 알리고 다시 시도할 수 있다", async () => {
    search.mockRejectedValueOnce(new Error("502")).mockResolvedValueOnce([SEOUL_RESULT]);
    render(<LocationScreen />);
    await userEvent.type(screen.getByLabelText("주소 또는 지명"), "서울시청");
    await userEvent.click(screen.getByRole("button", { name: "검색" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("검색에 실패했어요");
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByRole("button", { name: "서울 중구 태평로1가" })).toBeInTheDocument();
    expect(search).toHaveBeenCalledTimes(2);
  });
});

describe("LocationScreen: 현재 위치·기본 위치", () => {
  it("화면을 열 때는 위치 권한을 요청하지 않는다", () => {
    render(<LocationScreen />);
    expect(locate).not.toHaveBeenCalled();
  });

  it("'현재 위치 다시 받기'가 성공하면 저장하고 홈으로 이동한다", async () => {
    locate.mockResolvedValue({
      ok: true,
      location: { latRounded: 37.55, lonRounded: 126.91, regionName: "서울 마포구 합정동", source: "gps", savedAt: "x" },
    });
    render(<LocationScreen />);
    await userEvent.click(screen.getByRole("button", { name: "현재 위치 다시 받기" }));
    await screen.findByRole("button", { name: "현재 위치 다시 받기" });
    expect(savedLocation()).toMatchObject({ regionName: "서울 마포구 합정동", source: "gps" });
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("실패하면 원인 안내를 보여 주고 이동하지 않는다", async () => {
    locate.mockResolvedValue({
      ok: false,
      failure: { kind: "denied", message: "위치 권한이 거부되었어요.", recoveryHint: "iPhone은 설정에서 허용해 주세요." },
    });
    render(<LocationScreen />);
    await userEvent.click(screen.getByRole("button", { name: "현재 위치 다시 받기" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("위치 권한이 거부되었어요.");
    expect(screen.getByText(/iPhone은 설정에서/)).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull();
  });

  it("'기본 위치(서울) 사용'을 누르면 기본 위치로 저장하고 홈으로 이동한다", async () => {
    render(<LocationScreen />);
    await userEvent.click(screen.getByRole("button", { name: "기본 위치(서울) 사용" }));
    expect(savedLocation()).toMatchObject({ latRounded: 37.57, lonRounded: 126.98, regionName: "서울", source: "default" });
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("홈으로 돌아가는 링크가 있다", () => {
    render(<LocationScreen />);
    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/");
  });
});
