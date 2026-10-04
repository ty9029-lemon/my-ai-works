// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { locateCurrentPosition } from "@/lib/location/locate";
import { LOCATION_STORAGE_KEY, PROFILE_STORAGE_KEY } from "@/lib/profile/storage";
import { OnboardingScreen } from "./onboarding-screen";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/location/locate", () => ({ locateCurrentPosition: vi.fn() }));

const locate = vi.mocked(locateCurrentPosition);

beforeEach(() => {
  localStorage.clear();
  router.push.mockClear();
  router.replace.mockClear();
  locate.mockReset();
});

/** 질문 3개에 모두 답한다. */
async function answerAll() {
  await userEvent.click(screen.getByRole("button", { name: "추위 많이 탐" }));
  await userEvent.click(screen.getByRole("button", { name: "조깅" }));
  await userEvent.click(screen.getByRole("button", { name: "러닝" }));
}

describe("OnboardingScreen", () => {
  it("질문 3개에 모두 답하기 전에는 '시작하기'가 비활성화된다", async () => {
    render(<OnboardingScreen />);
    const start = await screen.findByRole("button", { name: "시작하기" });
    expect(start).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "추위 많이 탐" }));
    await userEvent.click(screen.getByRole("button", { name: "조깅" }));
    expect(start).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "러닝" }));
    expect(start).toBeEnabled();
  });

  it("'시작하기'를 누르면 프로필을 저장하고 홈으로 이동한다", async () => {
    render(<OnboardingScreen />);
    await screen.findByRole("button", { name: "시작하기" });
    await answerAll();
    await userEvent.click(screen.getByRole("button", { name: "시작하기" }));
    const saved = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) as string);
    expect(saved).toMatchObject({
      sensitivity: "cold",
      defaultIntensity: "jog",
      defaultMode: "run",
      hasHealthCondition: false,
    });
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("화면을 열 때는 위치 권한을 요청하지 않는다", async () => {
    render(<OnboardingScreen />);
    await screen.findByRole("button", { name: "현재 위치 사용" });
    expect(locate).not.toHaveBeenCalled();
  });

  it("'현재 위치 사용'을 누르면 위치를 확인해 저장하고 지역명을 보여 준다", async () => {
    locate.mockResolvedValue({
      ok: true,
      location: { latRounded: 37.55, lonRounded: 126.91, regionName: "서울 마포구 합정동", source: "gps", savedAt: "2026-10-03T00:00:00.000Z" },
    });
    render(<OnboardingScreen />);
    await userEvent.click(await screen.findByRole("button", { name: "현재 위치 사용" }));
    expect(await screen.findByText("서울 마포구 합정동")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(LOCATION_STORAGE_KEY) as string)).toMatchObject({
      latRounded: 37.55,
      source: "gps",
    });
  });

  it("권한이 거부되면 원인 안내와 iOS 설정 경로를 보여 준다", async () => {
    locate.mockResolvedValue({
      ok: false,
      failure: { kind: "denied", message: "위치 권한이 거부되었어요.", recoveryHint: "iPhone은 설정 > Safari에서 허용해 주세요." },
    });
    render(<OnboardingScreen />);
    await userEvent.click(await screen.findByRole("button", { name: "현재 위치 사용" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("위치 권한이 거부되었어요.");
    expect(screen.getByText(/iPhone은 설정/)).toBeInTheDocument();
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull();
  });

  it("'주소로 찾기'는 질문에 답하기 전에는 비활성화되고, 답한 뒤에는 프로필을 저장하고 이동한다", async () => {
    render(<OnboardingScreen />);
    const search = await screen.findByRole("button", { name: "주소로 찾기" });
    expect(search).toBeDisabled();
    await answerAll();
    expect(search).toBeEnabled();
    await userEvent.click(search);
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).not.toBeNull();
    expect(router.replace).toHaveBeenCalledWith("/location");
  });

  it("이미 프로필이 있으면 홈으로 보낸다", async () => {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ sensitivity: "normal", defaultIntensity: "jog", defaultMode: "run", hasHealthCondition: false, updatedAt: "2026-10-03T00:00:00.000Z" }),
    );
    render(<OnboardingScreen />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    expect(screen.queryByRole("button", { name: "시작하기" })).not.toBeInTheDocument();
  });
});
