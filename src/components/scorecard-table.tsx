import type { ReactNode } from "react";

type Segment = "front" | "back";

export function getSegmentHoles(segment: Segment) {
  return segment === "front" ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [10, 11, 12, 13, 14, 15, 16, 17, 18];
}

function getGridClass(segment: Segment) {
  return segment === "front"
    ? "grid grid-cols-[104px_repeat(9,52px)_58px] sm:grid-cols-[160px_repeat(9,56px)_64px]"
    : "grid grid-cols-[104px_repeat(9,52px)_58px_58px] sm:grid-cols-[160px_repeat(9,56px)_64px_64px]";
}

function getMinWidthClass(segment: Segment) {
  return segment === "front" ? "min-w-[630px] sm:min-w-[728px]" : "min-w-[688px] sm:min-w-[792px]";
}

export function ScorecardTableFrame({
  segment,
  children,
}: {
  segment: Segment;
  children: ReactNode;
}) {
  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain pb-2">
      <div
        className={`${getMinWidthClass(segment)} overflow-hidden rounded-[24px] border border-[#bfa66a] bg-white shadow-[0_12px_28px_rgba(76,58,26,0.08)]`}
      >
        <div className={getGridClass(segment)}>{children}</div>
      </div>
    </div>
  );
}

export const scorecardHeaderCellClass =
  "px-1.5 py-2 text-center text-sm font-semibold sm:px-3 sm:py-3";

export const scorecardLabelCellClass =
  "px-2 py-2.5 text-[11px] font-semibold sm:px-4 sm:py-3 sm:text-sm";

export const scorecardBodyCellClass = "px-1 py-2 text-center sm:px-3 sm:py-3";

export const scorecardScoreMarkClass = "h-9 w-9 text-lg leading-none tracking-normal";
