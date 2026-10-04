import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageHeader } from "./page-header";

const meta = {
  title: "Layout/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: "시작하기" } };
export const WithDescription: Story = {
  args: { title: "시작하기", description: "질문 3개에 답하면 나에게 맞는 복장을 추천해 드려요." },
};
export const WithBackLink: Story = { args: { title: "위치 바꾸기", backHref: "/" } };
