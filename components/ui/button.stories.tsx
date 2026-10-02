import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { ArrowRight, Loader2, Plus } from "lucide-react";

import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "버튼" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "xl", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── variant ── */
export const Default: Story = { args: { variant: "default" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Link: Story = { args: { variant: "link" } };

/* ── size ── */
export const ExtraSmall: Story = { args: { size: "xs" } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const ExtraLarge: Story = { args: { size: "xl" } };
export const Icon: Story = {
  args: { size: "icon", "aria-label": "추가", children: <Plus /> },
};

/* ── 아이콘 ── */
export const IconStart: Story = {
  render: (args) => (
    <Button {...args}>
      <Plus data-icon="inline-start" />
      추가
    </Button>
  ),
};
export const IconEnd: Story = {
  render: (args) => (
    <Button {...args}>
      다음
      <ArrowRight data-icon="inline-end" />
    </Button>
  ),
};

/* ── 상태 ── */
/** 마우스를 올린 상태 (play로 hover 재현) */
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button"));
  },
};

/** 키보드 포커스 상태 (focus-visible 링) */
export const Focus: Story = {
  play: async () => {
    await userEvent.tab();
  },
};

export const Disabled: Story = { args: { disabled: true } };

/** Button에는 loading prop이 없어 disabled + 스피너로 로딩 모습을 표현한다 */
export const Loading: Story = {
  args: { disabled: true },
  render: (args) => (
    <Button {...args}>
      <Loader2 className="animate-spin" data-icon="inline-start" />
      저장 중
    </Button>
  ),
};

export const Invalid: Story = { args: { "aria-invalid": true } };
