"use client";

import { useCallback } from "react";
import {
  clearLocation,
  getBrowserStorage,
  LOCATION_STORAGE_KEY,
  parseLocation,
  saveLocation,
} from "@/lib/profile/storage";
import { notifyStorageChange } from "@/lib/profile/storage-store";
import type { SavedLocation } from "@/lib/profile/types";
import { useStoredValue } from "@/lib/profile/use-stored-value";

/** 저장된 기준 위치(1개)를 읽고 저장·삭제한다. 좌표는 저장 전에 반올림된다. */
export function useSavedLocation() {
  const { value, isLoaded } = useStoredValue(LOCATION_STORAGE_KEY, parseLocation);

  const save = useCallback((input: Omit<SavedLocation, "savedAt">) => {
    const storage = getBrowserStorage();
    if (!storage) return null;
    const saved = saveLocation(storage, input);
    notifyStorageChange();
    return saved;
  }, []);

  const clear = useCallback(() => {
    const storage = getBrowserStorage();
    if (!storage) return;
    clearLocation(storage);
    notifyStorageChange();
  }, []);

  return { location: value, isLoaded, saveLocation: save, clearLocation: clear };
}
