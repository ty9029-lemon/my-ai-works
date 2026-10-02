import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";

import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "배지" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Link: Story = { args: { variant: "link" } };

/** 링크로 렌더링(render prop)된 배지에 마우스를 올린 상태 */
export const LinkHover: Story = {
  args: { variant: "default", render: <a href="#" /> },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("link"));
  },
};

/** 오류 상태 (aria-invalid) */
export const Invalid: Story = { args: { "aria-invalid": true } };
