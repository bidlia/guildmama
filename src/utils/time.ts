export function getTimezoneUtcOffset(timezone: string): number | null {
  try {
    const format = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    });

    const parts = format.formatToParts(new Date());
    const timezoneChunk = parts.find(
      (prt) => prt.type === "timeZoneName",
    )!.value;

    if (timezoneChunk === "GMT") return 0;
    const offsetString = timezoneChunk.replace("GMT", "");
    const offsetSign = offsetString.startsWith("-") ? -1 : 1;
    const [hours, minutes] = offsetString.slice(1).split(":");
    return (
      (parseInt(hours, 10) + (minutes ? parseInt(minutes, 10) / 60 : 0)) *
      offsetSign
    );
  } catch {
    return null;
  }
}

export function convertOffsetToGlobeEmoji(offset: number): "🌎" | "🌍" | "🌏" {
  if (offset < -1) return "🌎";
  else if (offset >= 1 && offset <= 3) return "🌍";
  else return "🌏";
}
