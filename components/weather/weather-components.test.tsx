// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeHourly } from "@/lib/fixtures/weather";
import { AIR_KOREA_URL, CC_BY_URL, OPEN_METEO_URL } from "@/lib/links";
import { DataSourceNote } from "./data-source-note";
import { HourlyForecast } from "./hourly-forecast";
import { ModelEstimateLabel } from "./model-estimate-label";
import { StaleNotice } from "./stale-notice";

describe("HourlyForecast", () => {
  it("현재 + 12시간, 13칸의 시각과 수치를 표로 보여 준다", () => {
    const points = makeHourly(13).map((p, i) => ({ ...p, apparentTemperatureC: 10 + i, windSpeedMs: 3 }));
    render(<HourlyForecast points={points} />);
    const table = screen.getByRole("table", { name: "시간별 예보" });
    const headers = within(table).getAllByRole("columnheader");
    expect(headers).toHaveLength(14); // "시각" + 13칸
    expect(within(table).getByRole("columnheader", { name: "지금" })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: "체감(℃)" })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: "바람(m/s)" })).toBeInTheDocument();
  });

  it("값은 반올림해서 보여 준다", () => {
    render(<HourlyForecast points={makeHourly(2).map((p) => ({ ...p, apparentTemperatureC: 17.6, precipitationProbability: 29.6 }))} />);
    expect(screen.getAllByText("18")).toHaveLength(2);
    expect(screen.getAllByText("30")).toHaveLength(2);
  });
});

describe("ModelEstimateLabel", () => {
  it("누르면 실측값과 다를 수 있다는 안내와 에어코리아 링크를 보여 준다", async () => {
    render(<ModelEstimateLabel />);
    expect(screen.queryByText(/실측값과 다를 수 있어요/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /모델 추정치/ }));
    expect(await screen.findByText(/실측값과 다를 수 있어요/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "에어코리아 열기" })).toHaveAttribute("href", AIR_KOREA_URL);
  });
});

describe("DataSourceNote", () => {
  it("출처와 라이선스 링크를 항상 보여 준다", () => {
    render(<DataSourceNote />);
    expect(screen.getByRole("link", { name: "Open-Meteo.com" })).toHaveAttribute("href", OPEN_METEO_URL);
    expect(screen.getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute("href", CC_BY_URL);
    expect(screen.queryByText(/데이터 기준/)).not.toBeInTheDocument();
  });

  it("기준 시각이 있으면 함께 보여 준다", () => {
    render(<DataSourceNote fetchedAt="2026-10-03T03:07:00.000Z" />);
    expect(screen.getByText(/데이터 기준 \d{2}:\d{2}/)).toBeInTheDocument();
  });
});

describe("StaleNotice", () => {
  it("직전 데이터는 'N분 전 데이터'로 알리고 다시 시도할 수 있다", async () => {
    const onRetry = vi.fn();
    render(<StaleNotice status="stale" minutesAgo={25} onRetry={onRetry} />);
    expect(screen.getByText(/25분 전 데이터예요/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("방금 받은 직전 데이터는 '방금 전'으로 표시한다", () => {
    render(<StaleNotice status="stale" minutesAgo={0} onRetry={() => {}} />);
    expect(screen.getByText(/방금 전 데이터예요/)).toBeInTheDocument();
  });

  it("보여 줄 데이터가 없으면 오류를 알리고 다시 시도 버튼을 보여 준다", () => {
    render(<StaleNotice status="error" onRetry={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("날씨를 불러오지 못했어요.");
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });
});
