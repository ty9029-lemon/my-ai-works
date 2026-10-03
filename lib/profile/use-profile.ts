"use client";

import { useCallback } from "react";
import {
  clearProfile,
  getBrowserStorage,
  parseProfile,
  PROFILE_STORAGE_KEY,
  saveProfile,
} from "@/lib/profile/storage";
import { notifyStorageChange } from "@/lib/profile/storage-store";
import type { UserProfile } from "@/lib/profile/types";
import { useStoredValue } from "@/lib/profile/use-stored-value";

/**
 * 저장된 프로필을 읽고 저장·초기화한다.
 * isLoaded가 true인데 profile이 null이면 온보딩 대상이다.
 */
export function useProfile() {
  const { value, isLoaded } = useStoredValue(PROFILE_STORAGE_KEY, parseProfile);

  const save = useCallback((input: Omit<UserProfile, "updatedAt">) => {
    const storage = getBrowserStorage();
    if (!storage) return null;
    const saved = saveProfile(storage, input);
    notifyStorageChange();
    return saved;
  }, []);

  const clear = useCallback(() => {
    const storage = getBrowserStorage();
    if (!storage) return;
    clearProfile(storage);
    notifyStorageChange();
  }, []);

  return { profile: value, isLoaded, saveProfile: save, clearProfile: clear };
}
