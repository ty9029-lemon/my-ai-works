import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";

// 앱과 동일한 토큰(theme.css 포함)을 적용하기 위해 전역 스타일을 불러온다
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    // 다크 모드는 .dark 클래스 방식 (globals.css의 @custom-variant dark와 동일)
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    // 앱의 body 스타일(bg-background, text-foreground)을 스토리 영역에도 적용
    (Story) => (
      <div className="bg-background font-sans text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default preview;
