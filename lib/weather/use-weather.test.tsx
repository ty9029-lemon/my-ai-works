// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeWeather } from "@/lib/fixtures/weather";
import type { WeatherStorage } from "@/lib/weather/fetch-with-fallback";
import { useWeather } from "@/lib/weather/use-weather";
import type { WeatherProvider } from "@/lib/weather/types";

const QUERY = { latitude: 37.57, longitude: 126.98 };

function makeStorage(): WeatherStorage {
  const data: Record<string, string> = {};
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

function okProvider(): WeatherProvider & { calls: number } {
  const provider = {
    name: "ok",
    calls: 0,
    async getWeather() {
      provider.calls += 1;
      return makeWeather({ fetchedAt: new Date().toISOString() });
    },
  };
  return provider;
}

const failingProvider: WeatherProvider = {
  name: "fail",
  getWeather: vi.fn(async () => {
    throw new Error("network");
  }),
};

describe("useWeather", () => {
  // provider·storage는 렌더마다 새로 만들면 훅이 계속 다시 조회하므로 테스트마다 한 번만 만든다.

  it("조회 중에는 loading이고 성공하면 fresh가 된다", async () => {
    const options = { provider: okProvider(), storage: makeStorage() };
    const { result } = renderHook(() => useWeather(QUERY, options));
    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state.status).toBe("fresh"));
  });

  it("위치를 아직 모르면(null) 조회하지 않고 loading으로 둔다", () => {
    const provider = okProvider();
    const options = { provider, storage: makeStorage() };
    const { result } = renderHook(() => useWeather(null, options));
    expect(result.current.state.status).toBe("loading");
    expect(provider.calls).toBe(0);
  });

  it("실패했고 직전 데이터가 없으면 error가 된다", async () => {
    const options = { provider: failingProvider, storage: makeStorage() };
    const { result } = renderHook(() => useWeather(QUERY, options));
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });

  it("실패했지만 직전 데이터가 있으면 stale이 된다", async () => {
    const storage = makeStorage();
    const okOptions = { provider: okProvider(), storage };
    const first = renderHook(() => useWeather(QUERY, okOptions));
    await waitFor(() => expect(first.result.current.state.status).toBe("fresh"));
    const failOptions = { provider: failingProvider, storage };
    const second = renderHook(() => useWeather(QUERY, failOptions));
    await waitFor(() => expect(second.result.current.state.status).toBe("stale"));
  });

  it("조회는 한 번만 일어난다(무한 반복하지 않는다)", async () => {
    const provider = okProvider();
    const options = { provider, storage: makeStorage() };
    const { result } = renderHook(() => useWeather(QUERY, options));
    await waitFor(() => expect(result.current.state.status).toBe("fresh"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(provider.calls).toBe(1);
  });

  it("retry를 호출하면 다시 조회한다", async () => {
    const provider = okProvider();
    const options = { provider, storage: makeStorage() };
    const { result } = renderHook(() => useWeather(QUERY, options));
    await waitFor(() => expect(result.current.state.status).toBe("fresh"));
    expect(provider.calls).toBe(1);
    act(() => result.current.retry());
    await waitFor(() => expect(provider.calls).toBe(2));
    await waitFor(() => expect(result.current.state.status).toBe("fresh"));
  });

  it("좌표가 바뀌면 새 좌표로 다시 조회한다", async () => {
    const provider = okProvider();
    const options = { provider, storage: makeStorage() };
    const { result, rerender } = renderHook(({ q }) => useWeather(q, options), {
      initialProps: { q: QUERY },
    });
    await waitFor(() => expect(result.current.state.status).toBe("fresh"));
    rerender({ q: { latitude: 35.18, longitude: 129.08 } });
    await waitFor(() => expect(provider.calls).toBe(2));
  });
});
