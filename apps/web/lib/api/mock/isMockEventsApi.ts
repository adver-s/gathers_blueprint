export function isMockEventsApi(): boolean {
  const v = process.env.NEXT_PUBLIC_MOCK_EVENTS;
  return v === "true" || v === "1";
}
