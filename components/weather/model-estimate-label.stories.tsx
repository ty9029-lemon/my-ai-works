import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";

import { ModelEstimateLabel } from "./model-estimate-label";

const meta = {
  title: "Weather/ModelEstimateLabel",
  component: ModelEstimateLabel,
  tags: ["autodocs"],
} satisfies Meta<typeof ModelEstimateLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 누르면 안내와 에어코리아 링크가 열린다 */
export const Opened: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /모델 추정치/ }));
  },
};
