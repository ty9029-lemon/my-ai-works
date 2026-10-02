import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  args: { children: "기온 (°C)" },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Label htmlFor 와 Input id 를 짝지어 쓰는 기본 패턴 */
export const WithInput: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="story-label-temp" {...args} />
      <Input id="story-label-temp" type="number" defaultValue="26" />
    </div>
  ),
};

/** peer 입력이 비활성화되면 라벨도 흐려진다 */
export const DisabledInput: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-2">
      <Input id="story-label-disabled" className="peer order-2" disabled />
      <Label htmlFor="story-label-disabled" className="order-1" {...args} />
    </div>
  ),
};
