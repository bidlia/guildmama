import { createHash } from "node:crypto";

export function generateReleaseTint(object: Object): number {
  const objectString = JSON.stringify(object);
  const sha256Hex = createHash("sha256").update(objectString).digest("hex");
  const hashInteger = parseInt(sha256Hex.slice(0, 8), 16);
  const hue = hashInteger % 360;

  return hslToHex(hue, 75, 55);
}

function hslToHex(hue: number, saturation: number, lightness: number): number {
  lightness *= 0.01;
  const delta = saturation * Math.min(lightness, 1 - lightness) * 0.01;
  const getComp = (num: number) => {
    const hueSector = (num + hue / 30) % 12;
    const colorChannel =
      lightness -
      delta * Math.max(Math.min(hueSector - 3, 9 - hueSector, 1), -1);
    return Math.round(255 * colorChannel);
  };

  return (getComp(0) << 16) + (getComp(8) << 8) + getComp(4);
}
