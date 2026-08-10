"use client";

import { CoachApp } from "@/components/coach/CoachApp";

export function CoachClient({ sdkKey }: { sdkKey: string }) {
  return <CoachApp sdkKey={sdkKey} />;
}
