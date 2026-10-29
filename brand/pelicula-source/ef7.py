"""Round 6: variations on the anamorphic e (48)."""
import math
from ef6 import *

def rounded(cx, cy, W, H, r):
    r = min(r, H / 2 - 0.01, W / 2 - 0.01)
    return box(cx - W / 2 + r, cy - H / 2 + r, cx + W / 2 - r, cy + H / 2 - r).buffer(r, quad_segs=32)

def shape(cx, cy, W, H, corner):
    return stadium(cx, cy, W, H) if corner is None else rounded(cx, cy, W, H, corner)

def anam(ratio=2.39, H=170.0, w=46.0, corner=None, bar=-0.04, term=None, ap=0.08, sides=1.05, tb=0.86, hbar=1.0):
    """corner None = stadium; a number = corner radius of a rounded rectangle"""
    W = H * ratio
    cx, cy = W / 2, H / 2
    ws, wt = w * sides, w * tb
    inner_r = None if corner is None else max(corner - ws * 0.8, 2)
    ring = shape(cx, cy, W, H, corner).difference(shape(cx, cy, W - 2 * ws, H - 2 * wt, inner_r))
    yb = cy + H * bar
    hb = wt * 0.5 * hbar
    b = box(ws * 0.5, yb - hb, W - ws * 0.5, yb + hb)
    g = unary_union([ring, b])
    cut = (H - wt) if term is None else cy + H * term   # flush with the counter floor
    return g.difference(box(cx + W * ap, yb + hb, W + 5, cut))

def anam_flare(L=0.55, t_end=1.2, **kw):
    """the bar carries on past both sides as a thin anamorphic flare"""
    g = anam(**kw)
    x0, y0, x1, y1 = g.bounds
    H = y1 - y0
    w = kw.get('w', 46.0); tb = kw.get('tb', 0.86); bar = kw.get('bar', -0.04)
    yb = H / 2 + H * bar
    t1 = w * tb * 0.55
    W = x1 - x0
    Lp = W * L
    right = Polygon([(x1 - 4, yb - t1 / 2), (x1 + Lp, yb - t_end / 2), (x1 + Lp, yb + t_end / 2), (x1 - 4, yb + t1 / 2)])
    left = Polygon([(x0 + 4, yb - t1 / 2), (x0 - Lp, yb - t_end / 2), (x0 - Lp, yb + t_end / 2), (x0 + 4, yb + t1 / 2)])
    return unary_union([g, right, left])

def anam_dot(gap=0.5, **kw):
    g = anam(**kw)
    x0, y0, x1, y1 = g.bounds
    w = kw.get('w', 46.0)
    s = w * 1.0
    return unary_union([g, box(x1 + w * gap, y1 - s, x1 + w * gap + s, y1)])

def anam_solid(ratio=2.39, H=170.0, w=46.0, slot=0.15):
    """solid screen: a filled pill with a wide eye on top and a slot opening right"""
    W = H * ratio
    cx, cy = W / 2, H / 2
    full = stadium(cx, cy, W, H)
    ws, wt = w * 1.05, w * 0.86
    inner = stadium(cx, cy, W - 2 * ws, H - 2 * wt)
    yb = cy - H * 0.04
    hb = wt * 0.5
    eye = inner.intersection(box(0, 0, W, yb - hb))
    sl = box(cx + W * 0.08, yb + hb, W + 5, yb + hb + H * slot)
    return full.difference(eye).difference(sl)

def anam_contorno(t=5.0, **kw):
    g = anam(**kw)
    return g.buffer(t / 2, quad_segs=16).difference(g.buffer(-t / 2, quad_segs=16))
