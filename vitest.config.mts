import { defineConfig } from "vitest/config";

// 단위 테스트(node)와 화면 테스트(jsdom) 공용 설정.
// 화면 테스트 파일(.test.tsx)은 첫 줄에 `// @vitest-environment jsdom`을 적는다.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "app/**/*.test.{ts,tsx}",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
