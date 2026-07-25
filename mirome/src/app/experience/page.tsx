import type { Metadata } from "next";
import { ExperienceClient } from "./ExperienceClient";

export const metadata: Metadata = {
  title: "Participant Assessment — MIROME Team Intelligence",
  description:
    "The confidential 15-minute digital-human team-diagnosis session: consent, context, pulse survey, structured interview, scenario simulation, reflection and summary confirmation.",
};

/** Always read env at request time — NEXT_PUBLIC_* is otherwise inlined empty in the Docker image. */
export const dynamic = "force-dynamic";

export default function ExperiencePage() {
  const sdkKey =
    process.env.KLLEON_SDK_KEY || process.env["NEXT_PUBLIC_KLLEON_SDK_KEY"] || "";
  return <ExperienceClient sdkKey={sdkKey} />;
}
