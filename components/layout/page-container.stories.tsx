import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageContainer } from "./page-container";

const meta = {
  title: "Layout/PageContainer",
  component: PageContainer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** max-w-5xl, 좌우 16px 여백, 섹션 간격 24px(넓은 화면 48px) */
export const Default: Story = {
  args: {
    children: (
      <>
        <section className="rounded-4xl border border-border p-6">섹션 1</section>
        <section className="rounded-4xl border border-border p-6">섹션 2</section>
      </>
    ),
  },
};
