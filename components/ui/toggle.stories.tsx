import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Toggle } from "./toggle";

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  args: { children: "토글" },
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
export const Outline: Story = { args: { variant: "outline" } };
/** 선택된 상태: 테두리와 면이 함께 바뀐다 */
export const Pressed: Story = { args: { variant: "outline", defaultPressed: true } };
export const Disabled: Story = { args: { variant: "outline", disabled: true } };
