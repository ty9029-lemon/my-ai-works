import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent } from "storybook/test";

import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "기온을 입력하세요", className: "w-64" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: "26" } };
export const Number: Story = { args: { type: "number", defaultValue: "26" } };
export const File: Story = { args: { type: "file" } };

/** 키보드 포커스 상태 (포커스 링) */
export const Focus: Story = {
  play: async () => {
    await userEvent.tab();
  },
};

export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { "aria-invalid": true, defaultValue: "abc" } };
