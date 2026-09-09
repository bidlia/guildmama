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
  return "🌏";
}

export function convertTimeToClockEmoji(timezone: string): string {
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const components = format.formatToParts(Date.now());
  const hour = parseInt(
    components.find((prt) => prt.type == "hour")!.value,
    10,
  );
  const minutes = parseInt(
    components.find((prt) => prt.type == "minute")!.value,
    10,
  );

  const emojiParts: string[] = [];

  switch ((minutes > 45 ? hour + 1 : hour) % 12) {
    case 0:
      emojiParts.push("twelve");
      break;
    case 1:
      emojiParts.push("one");
      break;
    case 2:
      emojiParts.push("two");
      break;
    case 3:
      emojiParts.push("three");
      break;
    case 4:
      emojiParts.push("four");
      break;
    case 5:
      emojiParts.push("five");
      break;
    case 6:
      emojiParts.push("six");
      break;
    case 7:
      emojiParts.push("seven");
      break;
    case 8:
      emojiParts.push("eight");
      break;
    case 9:
      emojiParts.push("nine");
      break;
    case 10:
      emojiParts.push("ten");
      break;
    case 11:
      emojiParts.push("eleven");
      break;
  }

  emojiParts.push(minutes > 15 && minutes <= 45 ? "thirty" : "oclock");

  return `:${emojiParts.join("_")}:`;
}
