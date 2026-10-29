"""Round 5: indirect symbols — the e carries a film idea in its construction."""
import math
from ef5 import *

def base_e(w=18.0, scale=3.0):
    """the wordmark e, heavier and enlarged; origin at its top-left ink."""
    p = P3(w)
    g, _, _ = g_e(p)
    g = affinity.translate(g, -g.bounds[0], -g.bounds[1])
    return affinity.scale(g, scale, scale, origin=(0, 0))

def halfplane(p, d, side, R=2000):
    """polygon of points on one side of the line through p with direction d"""
    nx, ny = -d[1], d[0]
    if side < 0: nx, ny = -nx, -ny
    a = (p[0] - d[0] * R, p[1] - d[1] * R)
    b = (p[0] + d[0] * R, p[1] + d[1] * R)
    return Polygon([a, b, (b[0] + nx * R, b[1] + ny * R), (a[0] + nx * R, a[1] + ny * R)])

def sym_corte(angle=62.0, slide=14.0, gap=6.0):
    """the cut: the e sliced on a diagonal, one half slid along the cut."""
    e = base_e()
    x0, y0, x1, y1 = e.bounds
    c = ((x0 + x1) / 2, (y0 + y1) / 2)
    a = math.radians(angle)
    d = (math.cos(a), -math.sin(a))
    A = e.intersection(halfplane(c, d, 1))
    B = e.intersection(halfplane(c, d, -1))
    nx, ny = -d[1], d[0]
    B = affinity.translate(B, d[0] * slide + nx * -gap, d[1] * slide + ny * -gap)
    return unary_union([A, B])

def sym_fade(n=9):
    """fade: the e drawn in horizontal bands that thin out toward the bottom."""
    e = base_e()
    x0, y0, x1, y1 = e.bounds
    H = y1 - y0
    pitch = H / n
    bands = []
    for i in range(n):
        t = pitch * (0.92 - 0.72 * i / (n - 1))
        top = y0 + i * pitch
        bands.append(box(x0 - 5, top, x1 + 5, top + t))
    return e.intersection(unary_union(bands))

def stadium(cx, cy, w, h):
    r = h / 2
    return LineString([(cx - w / 2 + r, cy), (cx + w / 2 - r, cy)]).buffer(r, quad_segs=48)

def sym_anamorfico(ratio=2.39, H=150.0, w=40.0):
    """an e in cinemascope proportion (2.39:1)."""
    W = H * ratio
    cx, cy = W / 2, H / 2
    ring = stadium(cx, cy, W, H).difference(stadium(cx, cy, W - 2 * w * 1.05, H - 2 * w * 0.86))
    yb = cy - H * 0.04
    bar = box(w * 0.5, yb - w * 0.43, W - w * 0.5, yb + w * 0.43)
    g = unary_union([ring, bar])
    return g.difference(box(cx + W * 0.08, yb + w * 0.43, W + 5, cy + H * 0.24))

def polygon_ring(cx, cy, R, n, rot, w):
    pts = [(cx + R * math.cos(rot + 2 * math.pi * i / n), cy + R * math.sin(rot + 2 * math.pi * i / n)) for i in range(n)]
    outer = Polygon(pts)
    inner = outer.buffer(-w, join_style='mitre')
    return outer, inner

def sym_iris(R=120.0, w=36.0):
    """iris: the e built on a hexagon, the shape of a lens aperture."""
    outer, inner = polygon_ring(R, R, R, 6, 0.0, w)
    ring = outer.difference(inner)
    yb = R - 2
    bar = box(R - R, yb - w * 0.42, 2 * R, yb + w * 0.42).intersection(outer)
    g = unary_union([ring, bar])
    return g.difference(box(R, yb + w * 0.42, 2 * R + 5, R + R * 0.5))

def sym_play(S=250.0, w=40.0, r=26.0):
    """play: an e whose bowl is a rounded triangle pointing right."""
    h = S * math.sqrt(3) / 2
    tri = Polygon([(0, 0), (h, S / 2), (0, S)])
    outer = tri.buffer(-r, join_style='mitre').buffer(r, quad_segs=24)
    inner = tri.buffer(-r - w, join_style='mitre').buffer(r * 0.4, quad_segs=24)
    ring = outer.difference(inner)
    yb = S / 2 - w * 0.15
    bar = box(0, yb - w * 0.42, h, yb + w * 0.42).intersection(outer)
    g = unary_union([ring, bar])
    return g.difference(box(h * 0.42, yb + w * 0.42, h + 5, S * 0.8))

def sym_movimento(n=6, shift=7.0):
    """motion: the e cut in horizontal slices, each nudged right like a rolling shutter."""
    e = base_e()
    x0, y0, x1, y1 = e.bounds
    H = y1 - y0
    pitch = H / n
    parts = []
    for i in range(n):
        top = y0 + i * pitch
        sl = e.intersection(box(x0 - 5, top + (2.2 if i else 0), x1 + 5, top + pitch))
        parts.append(affinity.translate(sl, i * shift, 0))
    return unary_union(parts)

def sym_play2(S=330.0, w=40.0, r=20.0):
    h = S * math.sqrt(3) / 2
    tri = Polygon([(0, 0), (h, S / 2), (0, S)])
    outer = tri.buffer(-r, join_style='mitre').buffer(r, quad_segs=24)
    inner = tri.buffer(-r - w, join_style='mitre').buffer(r * 0.5, quad_segs=24)
    ring = outer.difference(inner)
    yb = S / 2 - w * 0.2
    bar = box(0, yb - w * 0.4, h, yb + w * 0.4).intersection(outer)
    g = unary_union([ring, bar])
    return g.difference(box(h * 0.36, yb + w * 0.4, h + 5, S * 0.7))

def sym_corte2():
    return sym_corte(angle=72.0, slide=12.0, gap=7.0)

def sym_mov2():
    return sym_movimento(n=5, shift=13.0)

def sym_fade2(n=7):
    """fade on a lighter e: the gaps between bands grow toward the bottom"""
    p = P3(15.0)
    e, _, _ = g_e(p)
    e = affinity.translate(e, -e.bounds[0], -e.bounds[1])
    e = affinity.scale(e, 3.0, 3.0, origin=(0, 0))
    x0, y0, x1, y1 = e.bounds
    pitch = (y1 - y0) / n
    bands, y = [], y0
    for i in range(n):
        gap = pitch * (0.14 + 0.46 * i / (n - 1))
        bands.append(box(x0 - 5, y, x1 + 5, y + pitch - gap))
        y += pitch
    return e.intersection(unary_union(bands))

def sym_obturador(gap=16.0):
    """shutter: the e parts along its bar, as if opening."""
    p = P3(18.0)
    e, _, _ = g_e(p)
    e = affinity.translate(e, -e.bounds[0], -e.bounds[1])
    e = affinity.scale(e, 3.0, 3.0, origin=(0, 0))
    yb = (XL + X * 0.44 - (XL - p.o)) * 3.0 - p.wh * 1.5
    top = e.intersection(box(-10, -10, 400, yb))
    bot = e.intersection(box(-10, yb, 400, 400))
    return unary_union([affinity.translate(top, 0, -gap / 2), affinity.translate(bot, 0, gap / 2)])
