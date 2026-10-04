// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makePoint } from "@/lib/fixtures/weather";
import { AirQualitySummary } from "./air-quality-summary";

describe("AirQualitySummary", () => {
  it("초미세먼지·미세먼지·UV 수치와 모델 추정치 라벨을 함께 보여 준다", () => {
    render(<AirQualitySummary point={makePoint({ pm25: 22.4, pm10: 41, uvIndex: 3 })} />);
    expect(screen.getByText("22 ㎍/㎥")).toBeInTheDocument();
    expect(screen.getByText("41 ㎍/㎥")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /모델 추정치/ })).toBeInTheDocument();
  });

  it("값이 없으면 '정보 없음'으로 표시한다", () => {
    render(<AirQualitySummary point={makePoint({ pm25: null, pm10: null, uvIndex: null })} />);
    expect(screen.getAllByText("정보 없음")).toHaveLength(3);
  });
});
