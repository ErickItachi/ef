"""Round 2: tighter spacing, alternative f, EF capital monograms."""
from ef2 import *
from ef2 import g_fi as _g_fi, g_Fi as _g_Fi

def P2(w, trk=0.0, **kw):
    p = P(w=w, **kw)
    p.trk = trk
    return p

def lig_gap(p, base):
    return base + getattr(p, 'trk', 0.0)

def g_fi2(p):
    return _g_fi(p, gap=lig_gap(p, p.side['stem'] * 2 - X * 0.06))

def g_Fi2(p):
    return _g_Fi(p, gap=lig_gap(p, p.side['open'] + p.side['stem']))

def f_parts(p, xs):
    """stem + crossbar shared by the f variants"""
    w = p.w
    return w, X * 0.24

def g_f_h(p, rx=None, ry=None, bar_l=None, bar_r=None, cut=0.0):
    """f with a compact hook whose terminal is cut flat (horizontal)."""
    w = p.w
    bar_l = bar_l if bar_l is not None else X * 0.18
    bar_r = bar_r if bar_r is not None else X * 0.24
    rx = rx or (X * 0.27 + (w - 10) * 0.45)
    ry = ry or (X * 0.30 + (w - 10) * 0.4)
    xs = bar_l
    cy = p.asc + ry
    hook = ring(xs + rx, cy, rx, ry, w, p.wh).intersection(box(xs - 1, p.asc - 5, xs + 2 * rx + 5, cy + ry * cut))
    parts = [box(xs, cy - 0.01, xs + w, BASE), hook, box(0, XL, xs + w + bar_r, XL + p.wh)]
    return unary_union(parts), 'open', 'open'

def g_f_sq(p, arm=None, bar_l=None, bar_r=None):
    """f with a square shoulder: stem + flat top arm, like the capital F."""
    w = p.w
    bar_l = bar_l if bar_l is not None else X * 0.18
    bar_r = bar_r if bar_r is not None else X * 0.24
    arm = arm if arm is not None else X * 0.36
    xs = bar_l
    parts = [box(xs, p.asc, xs + w, BASE), box(xs, p.asc, xs + w + arm, p.asc + p.wh),
             box(0, XL, xs + w + bar_r, XL + p.wh)]
    return unary_union(parts), 'open', 'open'

def caps_EF(p, gap=None, mid_join=False, ratio_e=0.56, ratio_f=0.54):
    """E and F set tight, one continuous top bar over both."""
    w, wh, top = p.w, p.wh, p.cap
    EW = (BASE - top) * ratio_e + (w - 10) * 0.5
    FW = (BASE - top) * ratio_f + (w - 10) * 0.5
    gap = gap if gap is not None else p.side['open'] + p.side['stem'] + getattr(p, 'trk', 0.0)
    xf = EW + gap
    mid = (top + BASE) / 2 + wh * 0.05
    parts = [box(0, top, w, BASE), box(0, top, xf + FW, top + wh), box(0, BASE - wh, EW, BASE),
             box(xf, top, xf + w, BASE)]
    if mid_join:
        parts.append(box(0, mid - wh / 2, xf + FW * 0.88, mid + wh / 2))
    else:
        parts += [box(0, mid - wh / 2, EW * 0.9, mid + wh / 2), box(xf, mid - wh / 2, xf + FW * 0.88, mid + wh / 2)]
    return unary_union(parts), 'stem', 'open'

def caps_EF_plain(p, gap=None):
    e, _, _ = g_E(p)
    f_, _, _ = g_F(p)
    gap = gap if gap is not None else p.side['open'] + p.side['stem'] + getattr(p, 'trk', 0.0)
    xf = e.bounds[2] + gap
    return unary_union([e, affinity.translate(f_, xf, 0)]), 'stem', 'open'

GLYPHS.update({'φ': g_fi2, 'Φ': g_Fi2, 'ƒ': g_f_h, 'ſ': g_f_sq})
