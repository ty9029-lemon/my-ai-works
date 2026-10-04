// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makePoint, makeWeather } from "@/lib/fixtures/weather";
import { recommendOutfit, type OutfitInput } from "@/lib/outfit/recommend";
import { RUNNING_BANDS } from "@/lib/outfit/rules";
import { OutfitCard } from "./outfit-card";

const weather = makeWeather();

function renderCard(apparent: number, overrides: Partial<OutfitInput> = {}) {
  const recommendation = recommendOutfit({
    mode: "run",
    intensity: "jog",
    sensitivity: "normal",
    point: makePoint({ apparentTemperatureC: apparent, temperatureC: apparent }),
    weather,
    ...overrides,
  });
  render(<OutfitCard recommendation={recommendation} />);
}

/** 각 러닝 구간 안쪽의 대표 체감온도 */
const BAND_SAMPLES = [-15, -5, 2, 7, 12, 17, 22, 28];

describe("OutfitCard", () => {
  it("러닝 8개 구간 모두 해당 구간의 상의·하의를 보여 준다", () => {
    expect(BAND_SAMPLES).toHaveLength(RUNNING_BANDS.length);
    BAND_SAMPLES.forEach((sample, index) => {
      const band = RUNNING_BANDS[index];
      const { unmount } = render(
        <OutfitCard
          recommendation={recommendOutfit({
            mode: "run",
            intensity: "jog",
            sensitivity: "normal",
            point: makePoint({ apparentTemperatureC: sample }),
            weather,
          })}
        />,
      );
      expect(screen.getByText(band.top)).toBeInTheDocument();
      expect(screen.getByText(band.bottom as string)).toBeInTheDocument();
      unmount();
    });
  });

  it("러닝은 실제 체감온도와 보정 체감온도, 보정 내역을 함께 보여 준다", () => {
    renderCard(8, { sensitivity: "cold", intensity: "interval" });
    expect(screen.getByText(/체감 8\.0℃ → 보정 9\.0℃/)).toBeInTheDocument();
    expect(screen.getByText("추위 -3, 인터벌 +4 (합계 +1℃)")).toBeInTheDocument();
  });

  it("보정이 없으면 보정 체감온도와 내역을 숨긴다", () => {
    renderCard(15);
    expect(screen.getByText(/체감 15\.0℃/)).toBeInTheDocument();
    expect(screen.queryByText(/보정/)).not.toBeInTheDocument();
  });

  it("외출 모드는 하의·레이어 칸을 그리지 않고 제목이 바뀐다", () => {
    renderCard(5, { mode: "outing" });
    expect(screen.getByText("외출 복장")).toBeInTheDocument();
    expect(screen.queryByText("하의")).not.toBeInTheDocument();
    expect(screen.queryByText("레이어")).not.toBeInTheDocument();
  });

  it("액세서리와 추가 문구를 나열한다", () => {
    renderCard(2);
    expect(screen.getByRole("list", { name: "액세서리" })).toBeInTheDocument();
    expect(screen.getByText("면 소재는 피하세요")).toBeInTheDocument();
  });

  it("액세서리가 없는 구간은 액세서리 목록을 그리지 않는다", () => {
    renderCard(12);
    expect(screen.queryByRole("list", { name: "액세서리" })).not.toBeInTheDocument();
  });
});
