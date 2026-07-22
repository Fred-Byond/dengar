"use client";

import { ExperienceApp } from "@/components/experience/ExperienceApp";

export function ExperienceClient({ sdkKey }: { sdkKey: string }) {
  return <ExperienceApp sdkKey={sdkKey} />;
}
