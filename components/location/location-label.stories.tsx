import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LocationLabel } from "./location-label";

const meta = {
  title: "Location/LocationLabel",
  component: LocationLabel,
  tags: ["autodocs"],
} satisfies Meta<typeof LocationLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { regionName: "서울 마포구 합정동" } };
/** 기본 위치를 쓰는 중이면 그 사실을 함께 보여 준다 */
export const DefaultLocation: Story = {
  args: { regionName: "서울", fallbackNotice: "기본 위치: 서울" },
};
export const LastSaved: Story = {
  args: { regionName: "부산 연제구", fallbackNotice: "마지막 저장 위치: 부산 연제구" },
};
export const Coordinates: Story = { args: { regionName: "현재 위치(35.68, 139.65)" } };
