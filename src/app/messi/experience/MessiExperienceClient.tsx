"use client";

import { MessiExperienceApp } from "@/components/messi/experience/MessiExperienceApp";

export function MessiExperienceClient({ sdkKey }: { sdkKey: string }) {
  return <MessiExperienceApp sdkKey={sdkKey} />;
}
