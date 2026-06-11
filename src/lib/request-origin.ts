type HeaderReader = {
  get(name: string): string | null;
};

export function getRequestOrigin(requestHeaders: HeaderReader) {
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
  return (
    host?.startsWith("localhost") ||
    host?.startsWith("127.0.0.1") ||
    host?.startsWith("[::1]")
  );
}
