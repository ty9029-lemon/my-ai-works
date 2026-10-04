// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KMA_WARNING_URL } from "@/lib/links";
import { LOCATION_STORAGE_KEY, PROFILE_STORAGE_KEY } from "@/lib/profile/storage";
import { MEDICAL_DISCLAIMER } from "@/lib/safety/copy";
import { SettingsScreen } from "./settings-screen";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const WEATHER_KEY = "weather:last:37.57:126.98";

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

function savedProfile() {
  return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) as string);
}

beforeEach(() => {
  localStorage.clear();
  router.replace.mockClear();
});

describe("SettingsScreen: 프로필", () => {
  it("프로필이 없으면 온보딩으로 보낸다", async () => {
    render(<SettingsScreen />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/onboarding"));
    expect(screen.queryByRole("heading", { name: "설정" })).not.toBeInTheDocument();
  });

  it("저장된 프로필을 선택된 상태로 보여 준다", async () => {
    seedProfile({ sensitivity: "cold", defaultIntensity: "interval", defaultMode: "outing" });
    render(<SettingsScreen />);
    expect(await screen.findByRole("button", { name: "추위 많이 탐" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "인터벌·템포" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "외출" })).toHaveAttribute("aria-pressed", "true");
  });

  it("칩을 바꾸면 곧바로 저장하고 다른 항목은 유지한다", async () => {
    seedProfile({ sensitivity: "cold", hasHealthCondition: true });
    render(<SettingsScreen />);
    await userEvent.click(await screen.findByRole("button", { name: "더위 많이 탐" }));
    expect(savedProfile()).toMatchObject({ sensitivity: "hot", defaultIntensity: "jog", defaultMode: "run", hasHealthCondition: true });
    expect(savedProfile().updatedAt).not.toBe("2026-10-03T00:00:00.000Z");
    expect(screen.getByRole("button", { name: "더위 많이 탐" })).toHaveAttribute("aria-pressed", "true");
  });

  it("질환 체크를 켜면 저장되고, 보수 판정 안내가 보인다", async () => {
    seedProfile();
    render(<SettingsScreen />);
    const checkbox = await screen.findByRole("checkbox", { name: /심혈관·호흡기 질환 있음/ });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(savedProfile().hasHealthCondition).toBe(true);
    expect(screen.getByRole("checkbox", { name: /심혈관·호흡기 질환 있음/ })).toBeChecked();
    expect(screen.getByText(/더 보수적으로 적용/)).toBeInTheDocument();
  });
});

describe("SettingsScreen: 데이터 초기화", () => {
  function seedAll() {
    seedProfile();
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ latRounded: 37.57, lonRounded: 126.98, regionName: "서울", source: "default", savedAt: "x" }));
    localStorage.setItem(WEATHER_KEY, "{}");
    localStorage.setItem("other-app:setting", "keep");
  }

  it("초기화 버튼을 누르면 확인 다이얼로그가 열리고, 아직 아무것도 지우지 않는다", async () => {
    seedAll();
    render(<SettingsScreen />);
    await userEvent.click(await screen.findByRole("button", { name: "데이터 초기화" }));
    expect(await screen.findByRole("dialog")).toHaveTextContent("저장한 데이터를 모두 지울까요?");
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).not.toBeNull();
  });

  it("취소하면 데이터가 그대로 남는다", async () => {
    seedAll();
    render(<SettingsScreen />);
    await userEvent.click(await screen.findByRole("button", { name: "데이터 초기화" }));
    await userEvent.click(await screen.findByRole("button", { name: "취소" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).not.toBeNull();
    expect(router.replace).not.toHaveBeenCalledWith("/onboarding");
  });

  it("확인하면 프로필·위치·날씨 캐시를 지우고 온보딩으로 이동한다(다른 키는 유지)", async () => {
    seedAll();
    render(<SettingsScreen />);
    await userEvent.click(await screen.findByRole("button", { name: "데이터 초기화" }));
    await userEvent.click(await screen.findByRole("button", { name: "초기화" }));
    expect(localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LOCATION_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(WEATHER_KEY)).toBeNull();
    expect(localStorage.getItem("other-app:setting")).toBe("keep");
    expect(router.replace).toHaveBeenCalledWith("/onboarding");
  });
});

describe("SettingsScreen: 출처와 안내", () => {
  it("출처, 모델 추정치 설명, 면책 문구, 기상특보 링크를 보여 준다", async () => {
    seedProfile();
    render(<SettingsScreen />);
    expect(await screen.findByRole("link", { name: "Open-Meteo.com" })).toBeInTheDocument();
    expect(screen.getByText(/기상 모델이 계산한 값/)).toBeInTheDocument();
    expect(screen.getByText(MEDICAL_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /기상특보 확인/ })).toHaveAttribute("href", KMA_WARNING_URL);
    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/");
  });
});
