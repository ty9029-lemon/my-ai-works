"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileFields } from "@/components/profile/profile-fields";
import { Button } from "@/components/ui/button";
import { EMPTY_PROFILE_FORM, toProfileInput, type ProfileFormValue } from "@/lib/profile/form";
import { useProfile } from "@/lib/profile/use-profile";
import { LocationSection } from "./location-section";

/** 프로필을 확인하는 동안(하이드레이션) 보여 주는 자리표시. 이미 쓰던 사람이 온보딩을 잠깐 보는 깜빡임을 막는다. */
function OnboardingSkeleton() {
  return (
    <PageContainer aria-busy="true">
      <div className="h-9 w-40 animate-pulse rounded-3xl bg-muted" />
      <div className="h-64 max-w-md animate-pulse rounded-4xl bg-muted" />
    </PageContainer>
  );
}

/**
 * 온보딩 화면: 질문 3개(체감 민감도·기본 운동 강도·기본 모드)로 프로필을 만든다.
 * 이미 프로필이 있으면 홈으로 보낸다.
 */
export function OnboardingScreen() {
  const router = useRouter();
  const { profile, isLoaded, saveProfile } = useProfile();
  const [form, setForm] = useState<ProfileFormValue>(EMPTY_PROFILE_FORM);
  const input = toProfileInput(form);

  useEffect(() => {
    if (isLoaded && profile) router.replace("/");
  }, [isLoaded, profile, router]);

  /** 프로필을 저장한 뒤 이동한다. 질문이 비어 있으면 아무것도 하지 않는다. */
  function saveAndGo(path: string) {
    if (!input) return;
    saveProfile(input);
    router.replace(path);
  }

  if (!isLoaded || profile) return <OnboardingSkeleton />;
  return (
    <PageContainer>
      <PageHeader
        title="시작하기"
        description="질문 3개에 답하면 나에게 맞는 복장과 안전 경고를 알려 드려요."
      />
      <div className="flex w-full max-w-md flex-col gap-8">
        <ProfileFields
          value={form}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        />
        <LocationSection canSearch={input !== null} onSearch={() => saveAndGo("/location")} />
        <Button size="xl" disabled={input === null} onClick={() => saveAndGo("/")}>
          시작하기
        </Button>
      </div>
    </PageContainer>
  );
}
