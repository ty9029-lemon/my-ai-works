// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

function renderGroup(onValueChange = vi.fn(), value?: string[]) {
  render(
    <ToggleGroup
      aria-label="체감 민감도"
      variant="outline"
      value={value}
      onValueChange={onValueChange}
    >
      <ToggleGroupItem value="cold">추위 많이 탐</ToggleGroupItem>
      <ToggleGroupItem value="normal">보통</ToggleGroupItem>
    </ToggleGroup>,
  );
  return onValueChange;
}

describe("ToggleGroup (base-ui 동작 확인)", () => {
  it("항목을 누르면 값이 배열로 전달된다", async () => {
    const onValueChange = renderGroup();
    await userEvent.click(screen.getByRole("button", { name: "추위 많이 탐" }));
    expect(onValueChange.mock.calls[0][0]).toEqual(["cold"]);
  });

  it("선택된 항목은 aria-pressed가 true다", () => {
    renderGroup(vi.fn(), ["normal"]);
    expect(screen.getByRole("button", { name: "보통" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "추위 많이 탐" })).toHaveAttribute("aria-pressed", "false");
  });

  it("선택된 항목을 다시 누르면 빈 배열이 전달된다(필수 선택은 사용하는 쪽에서 막는다)", async () => {
    const onValueChange = renderGroup(vi.fn(), ["cold"]);
    await userEvent.click(screen.getByRole("button", { name: "추위 많이 탐" }));
    expect(onValueChange.mock.calls[0][0]).toEqual([]);
  });
});
