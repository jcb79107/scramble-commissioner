"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { HoleConfig, ScrambleEvent, Team } from "@/lib/types";
import {
  getSegmentHoles,
  scorecardScoreMarkClass,
  scorecardScoreStyle,
} from "./scorecard-table";

type Segment = "front" | "back";

const SEGMENT_LABELS: Record<Segment, { label: string; total: string }> = {
  front: { label: "Front 9", total: "Out" },
  back: { label: "Back 9", total: "In" },
};

export function TeamScorecardEditor({
  event,
  team,
}: {
  event: ScrambleEvent;
  team: Team;
}) {
  const initialScores = useMemo(() => {
    return Object.fromEntries(
      Array.from({ length: 18 }, (_, index) => {
        const holeNumber = index + 1;
        const savedScore = event.scores.find(
          (score) => score.teamId === team.id && score.hole === holeNumber,
        );

        return [holeNumber, savedScore?.strokes == null ? "" : String(savedScore.strokes)];
      }),
    ) as Record<number, string>;
  }, [event.scores, team.id]);
  const [segment, setSegment] = useState<Segment>("front");
  const [scores, setScores] = useState(initialScores);
  const [selectedHole, setSelectedHole] = useState(1);
  const visibleHoleNumbers = getSegmentHoles(segment);
  const visibleHoles = visibleHoleNumbers.map((holeNumber) => getHole(event, holeNumber));
  const completedHoles = Object.values(scores).filter((value) => value.trim() !== "").length;
  const roundTotal = sumScores(scores, Array.from({ length: 18 }, (_, index) => index + 1));
  const segmentTotal = sumScores(scores, visibleHoleNumbers);
  const totalParForCompleted = Object.entries(scores).reduce((sum, [holeNumber, score]) => {
    if (!score.trim()) {
      return sum;
    }

    return sum + getHolePar(getHole(event, Number(holeNumber)));
  }, 0);
  const totalVsPar = completedHoles > 0 && roundTotal != null ? roundTotal - totalParForCompleted : null;
  const showRoundTotal = segment === "back";
  const gridTemplateColumns = `132px repeat(${visibleHoles.length}, 56px) ${showRoundTotal ? "62px 62px" : "62px"}`;
  const minWidth = showRoundTotal ? "760px" : "698px";

  function updateScore(holeNumber: number, value: string) {
    const normalized = value.replace(/[^\d]/g, "").slice(0, 2);
    setSelectedHole(holeNumber);
    setScores((current) => ({
      ...current,
      [holeNumber]: normalized,
    }));
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-[26px] border border-[#d7c28d] bg-white/92 p-4 shadow-[0_14px_34px_rgba(17,32,23,0.08)]">
      {Array.from({ length: 18 }, (_, index) => {
        const holeNumber = index + 1;

        return (
          <input
            key={`hidden-${holeNumber}`}
            type="hidden"
            name={`hole-${holeNumber}`}
            value={scores[holeNumber] ?? ""}
            readOnly
          />
        );
      })}

      <div className="rounded-[24px] bg-[#706d64] px-4 py-4 text-white shadow-[0_12px_28px_rgba(76,58,26,0.16)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">
          Scramble scorecard
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight">{team.name}</h2>
        <p className="mt-1 text-sm font-medium text-white/72">{completedHoles}/18 holes filled</p>
      </div>

      <div className="mt-4 rounded-[20px] border border-[#cfe0d6] bg-[#eef8f1] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="label-caps truncate text-[var(--fairway)]">Team gross</p>
            <p className="mt-1 truncate text-sm font-semibold text-[var(--ink)]/62">
              Burnt Red tees / Par 72
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fairway)]/62">
              Total
            </p>
            <p className="mt-1 text-3xl font-semibold leading-none text-[var(--ink)]">
              {roundTotal ?? "-"}
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[#cfe0d6] bg-[#cfe0d6]">
          <SummaryCell label="Out" value={formatTotal(sumScores(scores, getSegmentHoles("front")))} />
          <SummaryCell label="In" value={formatTotal(sumScores(scores, getSegmentHoles("back")))} />
          <SummaryCell label="Vs Par" value={formatVsPar(totalVsPar)} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["front", "back"] as Segment[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setSegment(item);
              setSelectedHole(getSegmentHoles(item)[0] ?? 1);
            }}
            className={`focus-ring min-h-12 rounded-full border px-4 text-base font-semibold transition ${
              segment === item
                ? "border-[var(--pine)] bg-[var(--pine)] text-white"
                : "border-[#d7c28d] bg-white text-[var(--ink)]/58"
            }`}
          >
            {SEGMENT_LABELS[item].label}
          </button>
        ))}
      </div>

      <div className="-mx-4 mt-4 max-w-[calc(100%+2rem)] overflow-x-auto overscroll-x-contain px-4 pb-2">
        <div
          className="overflow-hidden rounded-[24px] border border-[#bfa66a] bg-white shadow-[0_12px_28px_rgba(76,58,26,0.08)]"
          style={{ width: minWidth }}
        >
          <div className="grid bg-[#f2ead9]" style={{ gridTemplateColumns }}>
            <HeaderCell sticky>Hole</HeaderCell>
            {visibleHoles.map((hole) => (
              <div
                key={hole.number}
                className={`border-b border-r border-[#c8b77f] px-1 py-2 text-center ${
                  selectedHole === hole.number ? "bg-[#ead99d]" : "bg-[#f2ead9]"
                }`}
              >
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pine)]/10 text-sm font-semibold text-[var(--ink)]">
                  {hole.number}
                </span>
              </div>
            ))}
            <HeaderCell>{SEGMENT_LABELS[segment].total}</HeaderCell>
            {showRoundTotal ? <HeaderCell>Total</HeaderCell> : null}

            <MetaRow
              label="Contest"
              values={visibleHoles.map((hole) => formatContest(hole))}
              activeTotal=""
              roundTotal=""
              showRoundTotal={showRoundTotal}
              rowClassName="bg-[#f5eddc]"
              totalClassName="bg-[#eee1c6]"
            />
            <MetaRow
              label="Yards"
              values={visibleHoles.map((hole) => hole.teeYardage ?? "-")}
              activeTotal=""
              roundTotal="6046"
              showRoundTotal={showRoundTotal}
              rowClassName="bg-[#fffaf0]"
              totalClassName="bg-[#f7f1e3]"
            />
            <MetaRow
              label="Par"
              values={visibleHoles.map((hole) => getHolePar(hole))}
              activeTotal={visibleHoles.reduce((sum, hole) => sum + getHolePar(hole), 0)}
              roundTotal={72}
              showRoundTotal={showRoundTotal}
              rowClassName="bg-[#f7df8b]"
              totalClassName="bg-[#efd16c]"
            />

            <div className="sticky left-0 z-10 border-b border-r border-[#bfa66a] bg-[#fffaf0] px-3 py-3">
              <span className="block text-sm font-semibold text-[var(--ink)]">Team score</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)]/54">
                Gross
              </span>
            </div>
            {visibleHoles.map((hole) => {
              const value = scores[hole.number] ?? "";
              const par = getHolePar(hole);

              return (
                <div
                  key={`score-${hole.number}`}
                  className={`border-b border-r border-[#c8b77f] px-1 py-2 text-center ${
                    selectedHole === hole.number ? "bg-[#fff9e6]" : "bg-white"
                  }`}
                >
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={value}
                    min={1}
                    max={12}
                    aria-label={`${team.name} hole ${hole.number} strokes`}
                    onFocus={() => setSelectedHole(hole.number)}
                    onChange={(event) => updateScore(hole.number, event.target.value)}
                    placeholder={String(par)}
                    className={`mx-auto flex items-center justify-center text-center font-semibold outline-none transition focus:ring-2 focus:ring-[var(--pine)]/35 ${scorecardScoreMarkClass} ${scorecardScoreStyle(value, par)}`}
                  />
                </div>
              );
            })}
            <TotalCell value={formatTotal(segmentTotal)} />
            {showRoundTotal ? <TotalCell value={formatTotal(roundTotal)} strong /> : null}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="focus-ring mt-3 min-h-14 w-full rounded-full bg-[var(--pine)] px-4 text-base font-semibold text-white shadow-[0_14px_28px_rgba(17,32,23,0.18)] transition hover:bg-[#103126]"
      >
        Submit official scorecard
      </button>
    </section>
  );
}

function HeaderCell({
  children,
  sticky = false,
}: {
  children: ReactNode;
  sticky?: boolean;
}) {
  return (
    <div
      className={`border-b border-r border-[#c8b77f] bg-[#f2ead9] px-2 py-3 text-center text-sm font-semibold text-[var(--ink)] ${
        sticky ? "sticky left-0 z-10 text-left text-[11px] uppercase tracking-[0.14em] text-[var(--ink)]/58" : ""
      }`}
    >
      {children}
    </div>
  );
}

function MetaRow({
  label,
  values,
  activeTotal,
  roundTotal,
  showRoundTotal,
  rowClassName,
  totalClassName,
}: {
  label: string;
  values: Array<string | number>;
  activeTotal: string | number;
  roundTotal: string | number;
  showRoundTotal: boolean;
  rowClassName: string;
  totalClassName: string;
}) {
  return (
    <>
      <div
        className={`sticky left-0 z-10 border-b border-r border-[#bfa66a] px-3 py-3 text-sm font-semibold text-[var(--ink)] ${rowClassName}`}
      >
        {label}
      </div>
      {values.map((value, index) => (
        <div
          key={`${label}-${index}`}
          className={`border-b border-r border-[#c8b77f] px-1 py-3 text-center text-sm font-semibold text-[var(--ink)]/64 ${rowClassName}`}
        >
          {value}
        </div>
      ))}
      <div
        className={`border-b border-r border-[#c8b77f] px-2 py-3 text-center text-sm font-semibold text-[var(--ink)] ${totalClassName}`}
      >
        {activeTotal}
      </div>
      {showRoundTotal ? (
        <div
          className={`border-b border-r border-[#c8b77f] px-2 py-3 text-center text-sm font-semibold text-[var(--ink)] ${totalClassName}`}
        >
          {roundTotal}
        </div>
      ) : null}
    </>
  );
}

function SummaryCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/82 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fairway)]/66">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}

function TotalCell({ value, strong = false }: { value: string | number; strong?: boolean }) {
  return (
    <div className={`border-b border-r border-[#c8b77f] bg-[#f7f1e3] px-2 py-3 text-center ${strong ? "bg-[#efe7d6]" : ""}`}>
      <span className={`mx-auto flex items-center justify-center font-semibold text-[var(--ink)] ${scorecardScoreMarkClass}`}>
        {value}
      </span>
    </div>
  );
}

function getHole(event: ScrambleEvent, holeNumber: number): HoleConfig {
  return event.holes.find((hole) => hole.number === holeNumber) ?? { number: holeNumber };
}

function getHolePar(hole: HoleConfig) {
  if (hole.par) {
    return hole.par;
  }

  if (hole.sideGame === "closest_to_pin") {
    return 3;
  }

  if (hole.sideGame === "long_drive") {
    return 5;
  }

  return 4;
}

function formatContest(hole: HoleConfig) {
  if (hole.sideGame === "closest_to_pin") {
    return "CTP";
  }

  if (hole.sideGame === "long_drive") {
    return "LD";
  }

  return "";
}

function parseScore(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sumScores(scores: Record<number, string>, holeNumbers: number[]) {
  const values = holeNumbers
    .map((holeNumber) => parseScore(scores[holeNumber]))
    .filter((value): value is number => value != null);

  if (!values.length) {
    return null;
  }

  return values.reduce((sum, score) => sum + score, 0);
}

function formatTotal(value: number | null) {
  return value == null ? "-" : value;
}

function formatVsPar(value: number | null) {
  if (value == null) {
    return "-";
  }

  if (value === 0) {
    return "E";
  }

  return value > 0 ? `+${value}` : String(value);
}
