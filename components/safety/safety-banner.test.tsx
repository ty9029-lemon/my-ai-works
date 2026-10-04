// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makePoint, makeWeather } from "@/lib/fixtures/weather";
import { AIR_KOREA_URL, KMA_WARNING_URL } from "@/lib/links";
import { evaluateSafety } from "@/lib/safety/evaluate";
import { SafetyBanner } from "./safety-banner";

const weather = makeWeather();

function renderBanner(overrides: Parameters<typeof makePoint>[0], hasHealthCondition = false) {
  const result = evaluateSafety({ point: makePoint(overrides), weather, hasHealthCondition });
  render(<SafetyBanner result={result} />);
}

describe("SafetyBanner", () => {
  it.each<[string, Parameters<typeof makePoint>[0], string]>([
    ["정상", {}, "정상"],
    ["주의", { windSpeedMs: 10 }, "주의"],
    ["중단 권고", { windSpeedMs: 14 }, "중단 권고"],
  ])("%s 등급은 텍스트로도 표시한다", (_, overrides, text) => {
    renderBanner(overrides);
    expect(screen.getByRole("heading", { name: text })).toBeInTheDocument();
  });

  it("걸린 사유를 모두 나열한다", () => {
    renderBanner({ windSpeedMs: 11, uvIndex: 7, pm10: 90 });
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("기상특보 링크와 낙뢰 안내는 정상 등급에서도 항상 보인다", () => {
    renderBanner({});
    expect(screen.getByRole("link", { name: /기상특보 확인/ })).toHaveAttribute("href", KMA_WARNING_URL);
    expect(screen.getByText(/천둥·번개/)).toBeInTheDocument();
  });

  it("미세먼지 사유가 있을 때만 에어코리아 링크를 보여 준다", () => {
    renderBanner({ pm25: 60 });
    expect(screen.getByRole("link", { name: /에어코리아/ })).toHaveAttribute("href", AIR_KOREA_URL);
  });

  it("미세먼지 사유가 없으면 에어코리아 링크가 없다", () => {
    renderBanner({ windSpeedMs: 11 });
    expect(screen.queryByRole("link", { name: /에어코리아/ })).not.toBeInTheDocument();
  });

  it("체감온도 사유에는 계산식 안내가 붙는다", () => {
    renderBanner({ apparentTemperatureC: 32 });
    expect(screen.getByText(/계산식이 다릅니다/)).toBeInTheDocument();
  });

  it("값을 받지 못한 요소는 판정에서 제외했다고 알린다", () => {
    renderBanner({ uvIndex: null, pm25: null, pm10: null });
    expect(screen.getByText(/UV·초미세먼지·미세먼지 정보를 가져오지 못해/)).toBeInTheDocument();
  });

  it("외부 링크는 새 탭에서 안전하게 연다", () => {
    renderBanner({});
    const link = screen.getByRole("link", { name: /기상특보 확인/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});
