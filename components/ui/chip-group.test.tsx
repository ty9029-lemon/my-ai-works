// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChipGroup } from "@/components/ui/chip-group";

const OPTIONS = [
  { value: "run", label: "러닝" },
  { value: "outing", label: "외출" },
] as const;

describe("ChipGroup", () => {
  it("칩을 누르면 해당 값으로 onChange를 호출한다", async () => {
    const onChange = vi.fn();
    render(<ChipGroup label="모드" options={OPTIONS} value="run" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "외출" }));
    expect(onChange).toHaveBeenCalledWith("outing");
  });

  it("선택된 칩을 다시 눌러도 선택이 해제되지 않는다", async () => {
    const onChange = vi.fn();
    render(<ChipGroup label="모드" options={OPTIONS} value="run" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "러닝" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("선택된 칩만 aria-pressed가 true이고, 값이 null이면 모두 false다", () => {
    const { rerender } = render(
      <ChipGroup label="모드" options={OPTIONS} value="outing" onChange={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "외출" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "러닝" })).toHaveAttribute("aria-pressed", "false");
    rerender(<ChipGroup label="모드" options={OPTIONS} value={null} onChange={() => {}} />);
    expect(screen.getAllByRole("button").every((b) => b.getAttribute("aria-pressed") === "false")).toBe(true);
  });

  it("그룹에 접근성 이름이 붙는다", () => {
    render(<ChipGroup label="운동 강도" options={OPTIONS} value={null} onChange={() => {}} />);
    expect(screen.getByRole("group", { name: "운동 강도" })).toBeInTheDocument();
  });
});
