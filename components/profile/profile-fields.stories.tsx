import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { EMPTY_PROFILE_FORM, type ProfileFormValue } from "@/lib/profile/form";
import { ProfileFields } from "./profile-fields";

const meta = {
  title: "Profile/ProfileFields",
  component: ProfileFields,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { value: EMPTY_PROFILE_FORM, onChange: () => {} },
  decorators: [(Story) => <div className="w-96 max-w-full"><Story /></div>],
  render: (args) => {
    const [value, setValue] = useState<ProfileFormValue>(args.value);
    return (
      <ProfileFields
        {...args}
        value={value}
        onChange={(patch) => setValue((prev) => ({ ...prev, ...patch }))}
      />
    );
  },
} satisfies Meta<typeof ProfileFields>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 온보딩: 질문 3개만 보여 준다 */
export const Onboarding: Story = {};

/** 설정: 질환 체크가 함께 나온다 */
export const Settings: Story = {
  args: {
    showHealthCondition: true,
    value: { sensitivity: "cold", defaultIntensity: "interval", defaultMode: "run", hasHealthCondition: true },
  },
};
