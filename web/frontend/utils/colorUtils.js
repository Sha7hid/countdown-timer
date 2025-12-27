export function hsbToHex({ hue, saturation, brightness }) {
    const chroma = brightness * saturation;
    const huePrime = hue / 60;
    const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
    const m = brightness - chroma;

    let r = 0, g = 0, b = 0;

    if (0 <= huePrime && huePrime < 1) { r = chroma; g = x; b = 0; }
    else if (1 <= huePrime && huePrime < 2) { r = x; g = chroma; b = 0; }
    else if (2 <= huePrime && huePrime < 3) { r = 0; g = chroma; b = x; }
    else if (3 <= huePrime && huePrime < 4) { r = 0; g = x; b = chroma; }
    else if (4 <= huePrime && huePrime < 5) { r = x; g = 0; b = chroma; }
    else if (5 <= huePrime && huePrime <= 6) { r = chroma; g = 0; b = x; }

    const toHex = (n) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(r) + toHex(g) + toHex(b);
}

export function hexToHsb(hex) {
    if (!hex) return { hue: 0, saturation: 1, brightness: 1 };

    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');

    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    r /= 255; g /= 255; b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        hue: h * 360,
        saturation: s,
        brightness: v
    };
}
