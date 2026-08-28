"use client";

import { AurenApp } from "@/components/auren";

export default function AurenClient({ sdkKey }: { sdkKey: string }) {
  return <AurenApp sdkKey={sdkKey} />;
}
