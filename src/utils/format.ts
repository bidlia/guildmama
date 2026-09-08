export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase().concat(word.slice(1));
}

export function addOrdinalSuffix(number: number): string {
  const numString = number.toString();

  if (numString.at(-2) == "1") {
    return numString + "th";
  } else {
    switch (numString.at(-1)) {
      case "1":
        return numString + "st";
      case "2":
        return numString + "nd";
      case "3":
        return numString + "rd";
      default:
        return numString + "th";
    }
  }
}
