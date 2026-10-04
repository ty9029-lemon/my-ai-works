// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocationLabel } from "./location-label";

describe("LocationLabel", () => {
  it("지역명을 보여 주고 위치 검색 화면으로 연결한다", () => {
    render(<LocationLabel regionName="서울 마포구 합정동" />);
    const link = screen.getByRole("link", { name: /서울 마포구 합정동/ });
    expect(link).toHaveAttribute("href", "/location");
  });

  it("대체 위치를 쓰는 중이면 안내 문구를 함께 보여 준다", () => {
    render(<LocationLabel regionName="서울" fallbackNotice="기본 위치: 서울" />);
    expect(screen.getByText("기본 위치: 서울")).toBeInTheDocument();
  });

  it("대체 위치가 아니면 안내 문구가 없다", () => {
    render(<LocationLabel regionName="서울 마포구 합정동" fallbackNotice={null} />);
    expect(screen.queryByText(/기본 위치|저장 위치/)).not.toBeInTheDocument();
  });
});
