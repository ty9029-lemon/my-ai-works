import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DataSourceNote } from "./data-source-note";

const meta = {
  title: "Weather/DataSourceNote",
  component: DataSourceNote,
  tags: ["autodocs"],
  args: { className: "text-xs text-muted-foreground" },
} satisfies Meta<typeof DataSourceNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTime: Story = { args: { fetchedAt: "2026-10-03T03:07:00.000Z" } };
export const WithoutTime: Story = {};
