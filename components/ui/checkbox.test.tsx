// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

describe("Checkbox (base-ui 동작 확인)", () => {
  it("label로 감싸면 접근 가능한 이름이 생기고, 클릭하면 값이 바뀐다", async () => {
    const onCheckedChange = vi.fn();
    render(
      <Label>
        <Checkbox onCheckedChange={onCheckedChange} />
        심혈관·호흡기 질환 있음
      </Label>,
    );
    const checkbox = screen.getByRole("checkbox", { name: "심혈관·호흡기 질환 있음" });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(onCheckedChange.mock.calls[0][0]).toBe(true);
  });

  it("checked가 true이면 체크된 상태로 보인다", () => {
    render(
      <Label>
        <Checkbox checked onCheckedChange={() => {}} />
        질환 있음
      </Label>,
    );
    expect(screen.getByRole("checkbox", { name: "질환 있음" })).toBeChecked();
  });
});
