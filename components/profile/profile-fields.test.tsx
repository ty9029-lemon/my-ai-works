// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_PROFILE_FORM } from "@/lib/profile/form";
import { ProfileFields } from "./profile-fields";

describe("ProfileFields", () => {
  it("질문 3개의 선택지를 모두 보여 준다", () => {
    render(<ProfileFields value={EMPTY_PROFILE_FORM} onChange={() => {}} />);
    for (const name of ["추위 많이 탐", "보통", "더위 많이 탐", "조깅", "장거리", "인터벌·템포", "러닝", "외출"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("질환 체크는 기본적으로 숨긴다", () => {
    render(<ProfileFields value={EMPTY_PROFILE_FORM} onChange={() => {}} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("칩을 누르면 바뀐 항목만 전달한다", async () => {
    const onChange = vi.fn();
    render(<ProfileFields value={EMPTY_PROFILE_FORM} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "더위 많이 탐" }));
    expect(onChange).toHaveBeenCalledWith({ sensitivity: "hot" });
    await userEvent.click(screen.getByRole("button", { name: "인터벌·템포" }));
    expect(onChange).toHaveBeenCalledWith({ defaultIntensity: "interval" });
  });

  it("저장된 값에 해당하는 칩이 선택된 상태로 보인다", () => {
    render(
      <ProfileFields
        value={{ sensitivity: "cold", defaultIntensity: "long", defaultMode: "outing", hasHealthCondition: false }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "추위 많이 탐" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "장거리" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "외출" })).toHaveAttribute("aria-pressed", "true");
  });

  it("질환 체크를 보여 주면 값을 바꿀 수 있다", async () => {
    const onChange = vi.fn();
    render(<ProfileFields value={EMPTY_PROFILE_FORM} onChange={onChange} showHealthCondition />);
    await userEvent.click(screen.getByRole("checkbox", { name: /심혈관·호흡기 질환 있음/ }));
    expect(onChange).toHaveBeenCalledWith({ hasHealthCondition: true });
  });
});
