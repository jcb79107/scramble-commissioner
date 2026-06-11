import Image from "next/image";
import type { ReactNode } from "react";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen justify-center bg-[var(--club-bg)] text-[var(--ink)] sm:px-5 sm:py-4">
      <div className="min-h-screen w-full max-w-[430px] overflow-hidden border border-[var(--brand-green)]/20 bg-[var(--paper)] shadow-[0_18px_60px_rgba(4,62,51,0.16)] sm:min-h-[calc(100vh-2rem)] sm:rounded-lg">
        {children}
      </div>
    </main>
  );
}

export function BrandHeader({
  eyebrow,
  title,
  meta,
  hero = false,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
  hero?: boolean;
}) {
  return (
    <header className="border-b border-[var(--brand-green)]/20 bg-[var(--brand-green)] text-white">
      <div className="bg-black px-5 py-4">
        <Image
          src="/brand/scramble-horizontal-left.png"
          alt="Scramble"
          width={3234}
          height={791}
          priority
          className="mx-auto h-auto max-h-16 w-full object-contain"
        />
      </div>
      <div className="relative overflow-hidden px-5 py-5">
        {hero && (
          <Image
            src="/brand/scramble-illinois-mark.png"
            alt=""
            width={1110}
            height={2375}
            className="absolute -right-8 -top-8 h-52 w-auto opacity-20"
          />
        )}
        <div className="relative">
          {eyebrow && (
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--flag-red)]">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-balance font-display text-3xl font-semibold leading-tight text-white">
            {title}
          </h1>
          {meta && <p className="mt-2 text-sm font-semibold text-white/78">{meta}</p>}
        </div>
      </div>
    </header>
  );
}

export function ScreenBody({ children }: { children: ReactNode }) {
  return <div className="space-y-4 px-4 py-4">{children}</div>;
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-white/72 p-3">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--line)] pb-2">
        <h2 className="font-display text-2xl font-semibold leading-none text-[var(--brand-green-dark)]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--brand-green)]">
        {label}
      </div>
      <div className="mt-1 truncate font-display text-2xl font-semibold leading-none text-[var(--ink)]">
        {value}
      </div>
    </div>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="min-h-12 w-full rounded-md bg-[var(--brand-green)] px-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm hover:bg-[var(--brand-green-dark)]"
    >
      {children}
    </button>
  );
}

export function TextInput({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        type={type}
        className="min-h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm"
      />
    </label>
  );
}
