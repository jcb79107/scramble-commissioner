import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const publicLinks = [
  { label: "Board", href: "/#leaderboard" },
  { label: "Money", href: "/#money" },
  { label: "Teams", href: "/#teams" },
  { label: "Contests", href: "/#contests" },
];

export function PublicNav() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/65 bg-[var(--sand)]/90 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-[620px] items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/brand/scramble-illinois-mark.png"
              alt=""
              width={1110}
              height={2375}
              priority
              className="h-12 w-8 shrink-0 object-contain drop-shadow-[0_8px_16px_rgba(17,32,23,0.14)]"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-[var(--ink)] sm:text-base">
                Chevy Chase Scramble
              </p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--fairway)]/72">
                June 13, 2026
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1.5 rounded-full border border-white/70 bg-white/55 p-1 shadow-[0_10px_28px_rgba(17,32,23,0.06)] md:flex">
            {publicLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink)]/72 transition hover:bg-white/80 hover:text-[var(--ink)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--fairway)]/10 bg-white/94 px-4 py-2.5 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] backdrop-blur md:hidden">
        <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-2">
          {publicLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="min-h-11 rounded-[18px] bg-[var(--sand)]/82 px-2 py-2.5 text-center text-[13px] font-semibold text-[var(--ink)]/72 transition hover:bg-[var(--pine)] hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[620px] flex-col gap-4 px-4 py-5 pb-24 text-[var(--ink)] sm:px-6 md:pb-8">
      {children}
    </main>
  );
}

export function BrandHeader({
  eyebrow,
  title,
  meta,
  hero = false,
  action,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
  hero?: boolean;
  action?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/75 bg-white/88 p-4 shadow-[0_14px_34px_rgba(17,32,23,0.09)] backdrop-blur md:rounded-[28px] md:p-5">
      {hero && (
        <Image
          src="/brand/scramble-illinois-mark.png"
          alt=""
          width={1110}
          height={2375}
          className="absolute -right-8 -top-12 h-64 w-auto opacity-[0.08]"
        />
      )}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d8c07d]/45 bg-[var(--sand)]/70">
            <Image
              src="/brand/scramble-illinois-mark.png"
              alt=""
              width={1110}
              height={2375}
              className="h-11 w-auto object-contain"
            />
          </div>
          <div className="min-w-0">
            {eyebrow && <p className="label-caps text-[var(--fairway)]/66">{eyebrow}</p>}
            <h1 className="mt-1 truncate text-2xl font-semibold leading-tight text-[var(--pine)] md:text-3xl">
              {title}
            </h1>
            {meta && <p className="mt-1 text-sm font-medium leading-5 text-[var(--ink)]/64">{meta}</p>}
          </div>
        </div>
        {action}
      </div>
    </section>
  );
}

export function ScreenBody({ children }: { children: ReactNode }) {
  return <div className="grid gap-4">{children}</div>;
}

export function Section({
  id,
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`surface-glass min-w-0 scroll-mt-24 rounded-[24px] border border-white/70 p-4 shadow-[0_14px_34px_rgba(17,32,23,0.09)] md:rounded-[28px] md:p-6 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 md:mb-5">
        <div className="min-w-0">
          {eyebrow && <p className="label-caps text-[var(--fairway)]/68">{eyebrow}</p>}
          <h2 className="mt-1.5 text-[1.18rem] font-semibold leading-tight text-[var(--ink)] md:mt-2 md:text-[1.42rem]">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[18px] border border-[var(--mist)] bg-[#fbf8f0] sm:grid-cols-4">
      {children}
    </div>
  );
}

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b border-r border-[var(--mist)] px-3 py-3 odd:border-r sm:border-b-0 sm:last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fairway)]/62">
        {label}
      </p>
      <p className="mt-1 truncate text-2xl font-semibold leading-none text-[var(--ink)]">
        {value}
      </p>
    </div>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="min-h-12 w-full rounded-full bg-[var(--pine)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(17,32,23,0.18)] transition hover:bg-[#103126]"
    >
      {children}
    </button>
  );
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--fairway)]/15 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink)]/70"
    >
      {children}
    </Link>
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
    <label className="grid gap-1.5 text-sm font-semibold text-[var(--ink)]">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        type={type}
        className="min-h-12 rounded-2xl border border-[var(--mist)] bg-white px-4 text-base text-[var(--ink)]"
      />
    </label>
  );
}
