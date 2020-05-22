var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { useMemo } from 'react';
var RGBA_PATTERN = /rgba?\(([0-9]+),([0-9]+),([0-9]+)(?:,(1|0|0\.[0-9]*))?\)/;
export function blendColors(foreground) {
    var colors = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        colors[_i - 1] = arguments[_i];
    }
    var foregroundColor = extract(foreground);
    if (foregroundColor[3] === 1 || colors.length === 0) {
        return foregroundColor;
    }
    var backgroundColor = extract(colors.shift());
    var blended = normalizeToBytes(blend(normalize(foregroundColor), normalize(backgroundColor)));
    return blendColors.apply(void 0, __spreadArrays([blended], colors));
}
export function useAlphaBlendedColor(foreground) {
    var colors = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        colors[_i - 1] = arguments[_i];
    }
    return useMemo(function () { return blendColors.apply(void 0, __spreadArrays([foreground], colors)); }, [
        foreground,
        colors,
    ]);
}
export function extract(color) {
    if (typeof color === 'string') {
        if (color[0] === '#') {
            var rgb = color.slice(1);
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
        var matches = color.replace(/ /g, '').match(RGBA_PATTERN);
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
function normalize(color) {
    return [color[0] / 255, color[1] / 255, color[2] / 255, color[3]];
}
function normalizeToBytes(color) {
    return [
        Math.round(color[0] * 255),
        Math.round(color[1] * 255),
        Math.round(color[2] * 255),
        color[3],
    ];
}
function hexToByte(hex) {
    return parseInt(hex, 16) / 255;
}
export function blend(_a, _b, premultiplied) {
    var sr = _a[0], sg = _a[1], sb = _a[2], sa = _a[3];
    var dr = _b[0], dg = _b[1], db = _b[2], da = _b[3];
    if (premultiplied === void 0) { premultiplied = false; }
    if (premultiplied) {
        var ra_1 = 1 - (sa || 1);
        return [
            sr + dr * ra_1,
            sg + dg * ra_1,
            sb + db * ra_1,
            (sa || 1) + (da || 1) * ra_1,
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
        var ra_2 = 1 - sa;
        return [sr * sa + dr * ra_2, sg * sa + dg * ra_2, sb * sa + db * ra_2, 1];
    }
    var ra = da * (1 - sa);
    var oa = sa + ra;
    return [
        (sr * sa + dr * ra) / oa,
        (sg * sa + dg * ra) / oa,
        (sb * sa + db * ra) / oa,
        oa,
    ];
}
function assertRgbColor(color) {
    if (color.length < 3 ||
        color.length > 4 ||
        color.some(function (d) { return d < 0 || d > 255; })) {
        throw new UnsupportedFormat("[" + color.join(', ') + "]");
    }
    return [color[0], color[1], color[2], color[3] || 1];
}
var UnsupportedFormat = /** @class */ (function (_super) {
    __extends(UnsupportedFormat, _super);
    function UnsupportedFormat(color) {
        return _super.call(this, ("\nExpected color to be in a supported format, actual: " + color + ".\n\nSupported formats for string input are:\n\n- #rgb\n- #rrggbb\n- #rrggbbaa\n- rgb(r, g, b)       (0 <= rgb <= 255)\n- rgba(r, g, b, a)   (0 <= rgb <= 255, 0 <= 1 <= 1)\n\nSupported formats for array input are:\n\n - [r, g, b]         (0 <= rgb <= 255)\n - [r, g, b, a]      (0 <= rgb <= 255, 0 <= a <= 1)\n\nKeyword/system colors are not supported (nor consistent across environments).\n      ").trim()) || this;
    }
    return UnsupportedFormat;
}(Error));
