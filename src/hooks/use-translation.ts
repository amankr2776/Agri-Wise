
'use client';

import { useAppState } from "@/lib/app-state";
import { getTranslation } from "@/lib/i18n/dictionaries";

export function useTranslation() {
  const { language } = useAppState();
  
  const t = (key: string, params?: Record<string, string>) => {
    return getTranslation(language, key, params);
  };
  
  return { t, language };
}
