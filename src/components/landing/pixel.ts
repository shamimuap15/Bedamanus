"use client";

type Fbq = (...args: unknown[]) => void;

export function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (!fbq) return;
  if (eventId) fbq("track", event, params ?? {}, { eventID: eventId });
  else fbq("track", event, params ?? {});
}
