"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-indigo px-4 py-2.5 text-sm font-extrabold text-white"
    >
      🖨️ Print / Save as PDF
    </button>
  );
}
