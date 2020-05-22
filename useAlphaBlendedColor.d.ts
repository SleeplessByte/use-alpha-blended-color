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
declare type Color = string | [number, number, number] | [number, number, number, number];
export declare function blendColors(foreground: Color, ...colors: Color[]): [number, number, number, number];
export declare function useAlphaBlendedColor(foreground: Color, ...colors: Color[]): [number, number, number, number];
export declare function extract(color: Color): [number, number, number, number];
export declare function blend([sr, sg, sb, sa]: [number, number, number, number], [dr, dg, db, da]: [number, number, number, number], premultiplied?: boolean): [number, number, number, number];
export {};
//# sourceMappingURL=useAlphaBlendedColor.d.ts.map