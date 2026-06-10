import { EventWorkspace } from "@/components/event-workspace";
import { headers } from "next/headers";

type HomeProps = {
  searchParams: Promise<{
    access?: string | string[] | undefined;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const requestHeaders = await headers();

  return (
    <EventWorkspace
      baseOrigin={getRequestOrigin(requestHeaders)}
      initialAccessToken={params.access ?? null}
    />
  );
}

function getRequestOrigin(requestHeaders: Headers) {
  const forwardedHost = firstHeaderValue(requestHeaders.get("x-forwarded-host"));
  const host = forwardedHost ?? firstHeaderValue(requestHeaders.get("host"));
  const forwardedProto = firstHeaderValue(requestHeaders.get("x-forwarded-proto"));
  const proto = forwardedProto ?? (isLocalHost(host) ? "http" : "https");

  return host ? `${proto}://${host}` : undefined;
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function isLocalHost(host: string | null | undefined) {
  return host?.startsWith("localhost") || host?.startsWith("127.0.0.1") || host?.startsWith("[::1]");
}
