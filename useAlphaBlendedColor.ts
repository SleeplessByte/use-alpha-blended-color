import { useMemo } from 'react';

const RGBA_PATTERN = /rgba?\(([0-9]+),([0-9]+),([0-9]+)(?:,(1|0|0\.[0-9]*))?\)/;

/**
 * Color:
 *
 * Supported formats for string input are:
 * - #rgb
 * - #rrggbb
 * - #rrggbbaa
 * - rgb(r, g, b)      (0 <= rgb <= 255)
 * - rgba(r, g, b, a)  (0 <= rgb <= 255, 0 <= a <= 1)
 *
 * Supported formats for array input are:
 * - [r, g, b]         (0 <= rgb <= 255)
 * - [r, g, b, a]      (0 <= rgb <= 255, 0 <= a <= 1)
 *
 * @example
 *
 *   '#333'
 *   '#fefefe'
 *   '#aeaeaeae'
 *   'rgb(127, 127, 255)'
 *   'rgba(32, 64, 87, 0.2)'
 *
 * @example
 *   [127, 127, 255]
 *   [32, 64, 87, 1]
 */
type Color =
  | string
  | [number, number, number]
  | [number, number, number, number];

export function blendColors(
  foreground: Color,
  ...colors: Color[]
): [number, number, number, number] {
  let foregroundColor = extract(foreground);

  if (foregroundColor[3] === 1 || colors.length === 0) {
    return foregroundColor;
  }

  const backgroundColor = extract(colors.shift()!);
  const blended = normalizeToBytes(
    blend(normalize(foregroundColor), normalize(backgroundColor))
  );

  return blendColors(blended, ...colors);
}

export function useAlphaBlendedColor(foreground: Color, ...colors: Color[]) {
  return useMemo(() => blendColors(foreground, ...colors), [
    foreground,
    colors,
  ]);
}

export function extract(color: Color): [number, number, number, number] {
  if (typeof color === 'string') {
    if (color[0] === '#') {
      const rgb = color.slice(1);
      if (rgb.length === 3) {
        return [
          hexToByte(rgb[0] + rgb[0]),
          hexToByte(rgb[1] + rgb[1]),
          hexToByte(rgb[2] + rgb[2]),
          1,
        ];
      }

      if (rgb.length === 8 || rgb.length === 6) {
        return [
          hexToByte(rgb.slice(0, 2)),
          hexToByte(rgb.slice(2, 4)),
          hexToByte(rgb.slice(4, 6)),
          hexToByte(rgb.slice(6, 8) || 'FF') / 255,
        ];
      }
      throw new UnsupportedFormat(color);
    }

    const matches = color.replace(/ /g, '').match(RGBA_PATTERN);

    if (matches) {
      return [
        Number(matches[1]),
        Number(matches[2]),
        Number(matches[3]),
        Number(matches[4] || '1'),
      ];
    }

    throw new UnsupportedFormat(color);
  }

  return assertRgbColor(color);
}

function normalize(
  color: [number, number, number, number]
): [number, number, number, number] {
  return [color[0] / 255, color[1] / 255, color[2] / 255, color[3]];
}

function normalizeToBytes(
  color: [number, number, number, number]
): [number, number, number, number] {
  return [
    Math.round(color[0] * 255),
    Math.round(color[1] * 255),
    Math.round(color[2] * 255),
    color[3],
  ];
}

function hexToByte(hex: string): number {
  return parseInt(hex, 16) / 255;
}

export function blend(
  [sr, sg, sb, sa]: [number, number, number, number],
  [dr, dg, db, da]: [number, number, number, number],
  premultiplied: boolean = false
): [number, number, number, number] {
  if (premultiplied) {
    const ra = 1 - (sa || 1);
    return [
      sr + dr * ra,
      sg + dg * ra,
      sb + db * ra,
      (sa || 1) + (da || 1) * ra,
    ];
  }

  // Foreground is fully opaque
  if (sa === 1) {
    return [sr, sg, sb, 1];
  }

  // Foreground is transparent
  if (sa === 0) {
    return [dr, dg, db, da || 1];
  }

  // Background is transparent
  if (da === 0) {
    return [sr, sg, sb, sa || 1];
  }

  // Background dis fully opaque
  if (da === 1) {
    const ra = 1 - sa;
    return [sr * sa + dr * ra, sg * sa + dg * ra, sb * sa + db * ra, 1];
  }

  const ra = da * (1 - sa);
  const oa = sa + ra;

  return [
    (sr * sa + dr * ra) / oa,
    (sg * sa + dg * ra) / oa,
    (sb * sa + db * ra) / oa,
    oa,
  ];
}

function assertRgbColor(
  color: Exclude<Color, string>
): [number, number, number, number] {
  if (
    color.length < 3 ||
    color.length > 4 ||
    color.some((d) => d < 0 || d > 255)
  ) {
    throw new UnsupportedFormat(`[${color.join(', ')}]`);
  }
  return [color[0], color[1], color[2], color[3] || 1];
}

class UnsupportedFormat extends Error {
  constructor(color: string) {
    super(
      `
Expected color to be in a supported format, actual: ${color}.

Supported formats for string input are:

- #rgb
- #rrggbb
- #rrggbbaa
- rgb(r, g, b)       (0 <= rgb <= 255)
- rgba(r, g, b, a)   (0 <= rgb <= 255, 0 <= 1 <= 1)

Supported formats for array input are:

 - [r, g, b]         (0 <= rgb <= 255)
 - [r, g, b, a]      (0 <= rgb <= 255, 0 <= a <= 1)

Keyword/system colors are not supported (nor consistent across environments).
      `.trim()
    );
  }
}
