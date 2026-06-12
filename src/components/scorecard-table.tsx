import type { ReactNode } from "react";

type Segment = "front" | "back";

export function getSegmentHoles(segment: Segment) {
  return segment === "front" ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [10, 11, 12, 13, 14, 15, 16, 17, 18];
}

function getGridClass(segment: Segment) {
  return segment === "front"
    ? "grid grid-cols-[132px_repeat(9,56px)_62px] sm:grid-cols-[180px_repeat(9,62px)_72px]"
    : "grid grid-cols-[132px_repeat(9,56px)_62px_62px] sm:grid-cols-[180px_repeat(9,62px)_72px_72px]";
}

function getMinWidthClass(segment: Segment) {
  return segment === "front" ? "min-w-[698px] sm:min-w-[810px]" : "min-w-[760px] sm:min-w-[882px]";
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
  "px-1.5 py-2 text-center text-sm font-semibold sm:px-3 sm:py-4 sm:text-base";

export const scorecardLabelCellClass =
  "px-2 py-2.5 text-[11px] font-semibold sm:px-4 sm:py-4 sm:text-sm";

export const scorecardBodyCellClass = "px-1 py-2 text-center sm:px-3 sm:py-3";

export const scorecardScoreMarkClass = "h-9 w-9 text-lg leading-none tracking-normal sm:h-10 sm:w-10";

export function scorecardScoreStyle(
  score: string | number | null | undefined,
  par: number | undefined,
) {
  const gross = score == null || score === "" ? null : Number(score);

  if (gross == null || !Number.isFinite(gross) || par == null) {
    return "rounded-full border-2 border-[var(--pine)]/28 bg-white text-[var(--ink)] shadow-none";
  }

  const delta = gross - par;

  if (delta <= -2) {
    return "rounded-full border-[2px] border-[#102018] bg-white text-[var(--ink)] shadow-[0_0_0_2px_white,0_0_0_4px_#102018]";
  }

  if (delta === -1) {
    return "rounded-full border-[4px] border-[#102018] bg-white text-[var(--ink)]";
  }

  if (delta === 0) {
    return "rounded-none border-2 border-transparent bg-white text-[var(--ink)] shadow-none";
  }

  if (delta === 1) {
    return "rounded-[4px] border-[4px] border-[#102018] bg-white text-[var(--ink)]";
  }

  return "rounded-[4px] border-[2px] border-[#102018] bg-white text-[var(--ink)] shadow-[0_0_0_2px_white,0_0_0_4px_#102018]";
}
