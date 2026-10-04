// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeHourly, makeWeather } from "@/lib/fixtures/weather";
import { LOCATION_STORAGE_KEY, PROFILE_STORAGE_KEY } from "@/lib/profile/storage";
import { MEDICAL_DISCLAIMER } from "@/lib/safety/copy";
import { HomeScreen } from "./home-screen";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
const provider = vi.hoisted(() => ({ name: "mock", getWeather: vi.fn() }));
vi.mock("@/lib/weather/open-meteo", () => ({ createOpenMeteoProvider: () => provider }));

const MINUTES_AGO = 25;
const MS_PER_MINUTE = 60_000;

/** 시각마다 체감온도가 다른 날씨: 0번째 10℃, 3번째(15시) 16℃ */
function makeVaryingWeather(overrides: Parameters<typeof makeWeather>[0] = {}) {
  const hourly = makeHourly(13).map((p, i) => ({ ...p, apparentTemperatureC: 10 + i * 2 }));
  return makeWeather({ hourly, ...overrides });
}

function seedProfile(overrides: Record<string, unknown> = {}) {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({
      sensitivity: "normal",
      defaultIntensity: "jog",
      defaultMode: "run",
      hasHealthCondition: false,
      updatedAt: "2026-10-03T00:00:00.000Z",
      ...overrides,
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  router.replace.mockClear();
  provider.getWeather.mockReset();
  provider.getWeather.mockResolvedValue(makeVaryingWeather());
});

describe("HomeScreen: 진입", () => {
  it("프로필이 없으면 온보딩으로 보내고 본문을 그리지 않는다", async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/onboarding"));
    expect(screen.queryByRole("heading", { name: "정상" })).not.toBeInTheDocument();
    expect(provider.getWeather).not.toHaveBeenCalled();
  });

  it("저장된 위치가 없으면 기본 위치(서울)로 조회하고 안내를 보여 준다", async () => {
    seedProfile();
    render(<HomeScreen />);
    expect(await screen.findByText("기본 위치: 서울")).toBeInTheDocument();
    await waitFor(() => expect(provider.getWeather).toHaveBeenCalledTimes(1));
    expect(provider.getWeather).toHaveBeenCalledWith({ latitude: 37.57, longitude: 126.98 });
  });

  it("저장된 위치는 안내 없이 지역명으로 보여 주고 그 좌표로 조회한다", async () => {
    seedProfile();
    localStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({ latRounded: 35.18, lonRounded: 129.08, regionName: "부산 연제구", source: "gps", savedAt: "x" }),
    );
    render(<HomeScreen />);
    expect(await screen.findByRole("link", { name: /부산 연제구/ })).toBeInTheDocument();
    expect(screen.queryByText(/기본 위치/)).not.toBeInTheDocument();
    await waitFor(() => expect(provider.getWeather).toHaveBeenCalledWith({ latitude: 35.18, longitude: 129.08 }));
  });

  it("설정으로 가는 링크가 있다", async () => {
    seedProfile();
    render(<HomeScreen />);
    expect(await screen.findByRole("link", { name: "설정" })).toHaveAttribute("href", "/settings");
  });
});

describe("HomeScreen: 본문", () => {
  it("안전 배너·복장 카드·대기질·12시간 예보·출처·면책 문구를 보여 준다", async () => {
    seedProfile();
    render(<HomeScreen />);
    expect(await screen.findByRole("heading", { name: "정상" })).toBeInTheDocument();
    expect(screen.getByText("러닝 복장")).toBeInTheDocument();
    expect(screen.getByText("대기질·자외선")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "시간별 예보" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open-Meteo.com" })).toBeInTheDocument();
    expect(screen.getByText(MEDICAL_DISCLAIMER)).toBeInTheDocument();
  });

  it("프로필의 기본 모드가 외출이면 외출 복장으로 시작한다", async () => {
    seedProfile({ defaultMode: "outing" });
    render(<HomeScreen />);
    expect(await screen.findByText("외출 복장")).toBeInTheDocument();
  });

  it("질환이 있으면 미세먼지 주의가 중단 권고로 올라간다", async () => {
    seedProfile({ hasHealthCondition: true });
    provider.getWeather.mockResolvedValue(
      makeVaryingWeather({ hourly: makeHourly(13, { pm25: 40 }) }),
    );
    render(<HomeScreen />);
    expect(await screen.findByRole("heading", { name: "중단 권고" })).toBeInTheDocument();
  });
});

describe("HomeScreen: 칩 변경은 재조회 없이 다시 계산한다", () => {
  it("모드 칩을 바꾸면 복장 카드가 바뀌지만 날씨를 다시 조회하지 않는다", async () => {
    seedProfile();
    render(<HomeScreen />);
    await screen.findByText("러닝 복장");
    await userEvent.click(screen.getByRole("button", { name: "외출" }));
    expect(screen.getByText("외출 복장")).toBeInTheDocument();
    expect(provider.getWeather).toHaveBeenCalledTimes(1);
  });

  it("운동 강도 칩을 바꾸면 보정 내역이 바뀐다", async () => {
    seedProfile({ sensitivity: "cold" });
    render(<HomeScreen />);
    await screen.findByText("러닝 복장");
    expect(screen.getByText(/추위 -3, 조깅 0/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "인터벌·템포" }));
    expect(screen.getByText("추위 -3, 인터벌 +4 (합계 +1℃)")).toBeInTheDocument();
    expect(provider.getWeather).toHaveBeenCalledTimes(1);
  });

  it("출발 시각 칩은 지금 + 12시간이며, 바꾸면 그 시각의 예보로 추천한다", async () => {
    seedProfile();
    render(<HomeScreen />);
    await screen.findByText("러닝 복장");
    const group = screen.getByRole("group", { name: "출발 시각" });
    expect(within(group).getAllByRole("button")).toHaveLength(13);
    expect(screen.getByText(/지금 기준 · 체감 10\.0℃/)).toBeInTheDocument();
    expect(screen.getByText("긴팔 또는 얇은 긴팔")).toBeInTheDocument();
    await userEvent.click(within(group).getByRole("button", { name: "15시" }));
    expect(screen.getByText(/15시 기준 · 체감 16\.0℃/)).toBeInTheDocument();
    expect(screen.getByText("반팔")).toBeInTheDocument();
    expect(provider.getWeather).toHaveBeenCalledTimes(1);
  });

  it("외출 모드에서는 강도를 보정하지 않는다는 안내가 나온다", async () => {
    seedProfile();
    render(<HomeScreen />);
    await screen.findByText("러닝 복장");
    expect(screen.queryByText(/강도를 보정하지 않아요/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "외출" }));
    expect(screen.getByText(/강도를 보정하지 않아요/)).toBeInTheDocument();
  });
});

describe("HomeScreen: 불러오는 중·실패", () => {
  it("불러오는 동안에도 면책 문구와 출처를 항상 보여 준다", async () => {
    seedProfile();
    provider.getWeather.mockReturnValue(new Promise(() => {}));
    render(<HomeScreen />);
    expect(await screen.findByRole("status", { name: "불러오는 중" })).toBeInTheDocument();
    expect(screen.getByText(MEDICAL_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open-Meteo.com" })).toBeInTheDocument();
  });

  it("실패했고 직전 데이터가 있으면 'N분 전 데이터'와 함께 본문을 보여 준다", async () => {
    seedProfile();
    const fetchedAt = new Date(Date.now() - MINUTES_AGO * MS_PER_MINUTE).toISOString();
    localStorage.setItem("weather:last:37.57:126.98", JSON.stringify(makeVaryingWeather({ fetchedAt })));
    provider.getWeather.mockRejectedValue(new Error("network"));
    render(<HomeScreen />);
    expect(await screen.findByText(/25분 전 데이터예요/)).toBeInTheDocument();
    expect(screen.getByText("러닝 복장")).toBeInTheDocument();
  });

  it("실패했고 직전 데이터가 없으면 오류를 알리고, 다시 시도하면 조회한다", async () => {
    seedProfile();
    provider.getWeather.mockRejectedValueOnce(new Error("network"));
    render(<HomeScreen />);
    expect(await screen.findByRole("alert")).toHaveTextContent("날씨를 불러오지 못했어요.");
    expect(screen.queryByText("러닝 복장")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByText("러닝 복장")).toBeInTheDocument();
    expect(provider.getWeather).toHaveBeenCalledTimes(2);
  });
});
