import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta = {
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  args: { variant: "outline", size: "lg", "aria-label": "체감 민감도" },
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="cold">추위 많이 탐</ToggleGroupItem>
      <ToggleGroupItem value="normal">보통</ToggleGroupItem>
      <ToggleGroupItem value="hot">더위 많이 탐</ToggleGroupItem>
    </ToggleGroup>
  ),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 하나만 선택하는 칩 묶음 (온보딩·홈의 모드/강도 선택) */
export const Single: Story = { args: { defaultValue: ["normal"] } };
export const NoSelection: Story = {};
export const Small: Story = { args: { size: "sm", defaultValue: ["cold"] } };
export const Disabled: Story = { args: { disabled: true, defaultValue: ["hot"] } };
