import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StaleNotice } from "./stale-notice";

const meta = {
  title: "Weather/StaleNotice",
  component: StaleNotice,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { onRetry: () => {} },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
} satisfies Meta<typeof StaleNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 직전 데이터를 대신 보여 주는 중 */
export const Stale: Story = { args: { status: "stale", minutesAgo: 25 } };
export const JustNow: Story = { args: { status: "stale", minutesAgo: 0 } };
/** 보여 줄 데이터가 없는 경우 */
export const Error: Story = { args: { status: "error" } };
