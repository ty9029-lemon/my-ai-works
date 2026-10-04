import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { ChipGroup } from "./chip-group";

const MODES = [
  { value: "run", label: "러닝" },
  { value: "outing", label: "외출" },
] as const;

const HOURS = Array.from({ length: 13 }, (_, i) => ({
  value: String(i),
  label: i === 0 ? "지금" : `${(12 + i) % 24}시`,
}));

const meta = {
  title: "UI/ChipGroup",
  component: ChipGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 선택된 칩을 다시 눌러도 해제되지 않는다 */
export const Mode: Story = {
  args: { label: "모드", options: MODES, value: "run", onChange: () => {} },
  render: (args) => {
    const [value, setValue] = useState<string | null>("run");
    return <ChipGroup {...args} value={value} onChange={setValue} />;
  },
};

export const NothingSelected: Story = {
  args: { label: "모드", options: MODES, value: null, onChange: () => {} },
};

/** 출발 시각처럼 칩이 많으면 가로로 스크롤한다 */
export const Scrollable: Story = {
  args: { label: "출발 시각", options: HOURS, value: "0", onChange: () => {}, scrollable: true },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
};
