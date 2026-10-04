"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileFields } from "@/components/profile/profile-fields";
import { toFormValue, toProfileInput, type ProfileFormValue } from "@/lib/profile/form";
import { clearAllAppData, getClearableStorage } from "@/lib/profile/storage";
import { notifyStorageChange } from "@/lib/profile/storage-store";
import { useProfile } from "@/lib/profile/use-profile";
import { AboutSection } from "./about-section";
import { ResetSection } from "./reset-section";

/**
 * 설정 화면. 프로필은 바꾸는 즉시 저장한다. 프로필이 없으면 온보딩으로 보낸다.
 * 데이터를 초기화하면 저장소의 변경을 알린 뒤 온보딩으로 이동한다.
 */
export function SettingsScreen() {
  const router = useRouter();
  const { profile, isLoaded, saveProfile } = useProfile();

  useEffect(() => {
    if (isLoaded && !profile) router.replace("/onboarding");
  }, [isLoaded, profile, router]);

  /** 바뀐 항목만 합쳐 곧바로 저장한다. */
  function handleChange(patch: Partial<ProfileFormValue>) {
    const input = toProfileInput({ ...toFormValue(profile), ...patch });
    if (input) saveProfile(input);
  }

  function handleReset() {
    const storage = getClearableStorage();
    if (storage) clearAllAppData(storage);
    notifyStorageChange();
    router.replace("/onboarding");
  }

  if (!isLoaded || !profile) return <PageContainer aria-busy="true"><div className="h-64 max-w-md animate-pulse rounded-4xl bg-muted" /></PageContainer>;
  return (
    <PageContainer>
      <PageHeader title="설정" backHref="/" />
      <div className="flex w-full max-w-md flex-col gap-10">
        <section aria-labelledby="settings-profile" className="flex flex-col gap-4">
          <h2 id="settings-profile" className="text-base font-medium">내 정보</h2>
          <ProfileFields value={toFormValue(profile)} onChange={handleChange} showHealthCondition />
        </section>
        <ResetSection onConfirm={handleReset} />
        <AboutSection />
      </div>
    </PageContainer>
  );
}
