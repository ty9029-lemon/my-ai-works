import { defineConfig } from "vitest/config";

// 순수 함수 단위 테스트용 설정 (훅·컴포넌트 테스트는 3단계에서 jsdom 추가)
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
