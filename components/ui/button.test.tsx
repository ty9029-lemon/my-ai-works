// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button (화면 테스트 환경 확인)", () => {
  it("클릭하면 onClick을 호출한다", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>시작하기</Button>);
    await userEvent.click(screen.getByRole("button", { name: "시작하기" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled이면 클릭해도 호출하지 않는다", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        시작하기
      </Button>,
    );
    const button = screen.getByRole("button", { name: "시작하기" });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
