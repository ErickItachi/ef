"""Round 3: refined spacing for the chosen lowercase wordmark (11 / 14 / 16)."""
from ef3 import *
from ef2 import g_fi as _g_fi

def P3(w):
    p = P(w=w, side={'stem': 0.27 * w, 'round': 0.18 * w, 'open': 0.165 * w, 'diag': 0.09 * w})
    p.trk = 0.0
    return p

def g_fi3(p):
    return _g_fi(p, gap=0.44 * p.w)

GLYPHS.update({'φ': g_fi3})
KERN3 = {'es': 1.0, 'e.': -0.5}

def word3(text, w=16, space=None):
    p = P3(w)
    placed, _ = setword(text, p, 0.0, KERN3, space=space if space is not None else X * 0.33 * (0.85 + 0.15 * w / 16))
    return unary_union(placed)

def stack(lines, align='left', gap=14.0, scale_first=1.0):
    """lines: geometries (each with ascender at y=12, baseline 100)."""
    out, y = [], 0.0
    widths = [g.bounds[2] - g.bounds[0] for g in lines]
    maxw = max(w * (scale_first if i == 0 else 1) for i, w in enumerate(widths))
    for i, g in enumerate(lines):
        s = scale_first if i == 0 else 1.0
        g = affinity.translate(g, -g.bounds[0], 0)
        if s != 1.0:
            g = affinity.scale(g, s, s, origin=(0, 0))
        top = 12 * s
        g = affinity.translate(g, 0, y - top)
        wd = g.bounds[2] - g.bounds[0]
        if align == 'center':
            g = affinity.translate(g, (maxw - wd) / 2, 0)
        out.append(g)
        y = y - top + 100 * s + gap   # next line's ascender sits `gap` below this baseline
    return unary_union(out)
