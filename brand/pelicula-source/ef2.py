"""Erick Filmes — filled custom letterforms, built from boolean geometry.

SVG coordinates: baseline y=100, x-line y=40 (x-height 60), ascender ASC.
Each glyph is built with its ink starting at x=0; spacing comes from
side classes + kerning, like a font's sidebearings.
"""
import math
from shapely.geometry import box, Point, LineString, Polygon, MultiPolygon
from shapely.ops import unary_union
from shapely import affinity

BASE, XL = 100.0, 40.0
X = BASE - XL

def ell(cx, cy, rx, ry):
    return affinity.translate(affinity.scale(Point(0, 0).buffer(1, quad_segs=96), rx, ry, origin=(0, 0)), cx, cy)

def ring(cx, cy, rx, ry, ws, wt):
    return ell(cx, cy, rx, ry).difference(ell(cx, cy, rx - ws, ry - wt))

def band(y0, y1):
    return box(-500, y0, 1500, y1)

def stroke(p0, p1, wd):
    return LineString([p0, p1]).buffer(wd / 2, cap_style='flat', join_style='mitre')

def extend(p0, p1, k=0.6):
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    return (x0 - dx * k, y0 - dy * k), (x1 + dx * k, y1 + dy * k)

def bez(p0, p1, p2, p3, n=48):
    out = []
    for i in range(n + 1):
        t = i / n
        a, b, c, d = (1-t)**3, 3*(1-t)**2*t, 3*(1-t)*t**2, t**3
        out.append((a*p0[0]+b*p1[0]+c*p2[0]+d*p3[0], a*p0[1]+b*p1[1]+c*p2[1]+d*p3[1]))
    return out

class P:
    """weight / proportion parameters"""
    def __init__(self, w, wh=None, o=1.2, bw=1.06, asc=12.0, cap=16.0, side=None):
        self.w, self.wh, self.o, self.bw = w, (wh or w * 0.88), o, bw
        self.asc, self.cap = asc, cap
        self.side = side or {'stem': 0.55 * w, 'round': 0.42 * w, 'open': 0.3 * w, 'diag': 0.18 * w}

# ---- glyph builders: return (geometry, left_class, right_class) ----

def g_o_parts(p):
    W = X * p.bw + (p.w - 10) * 0.6
    cx, cy, rx, ry = W / 2, XL + X / 2, W / 2, X / 2 + p.o
    return W, cx, cy, rx, ry

def g_e(p, term=0.72, bar=0.44):
    W, cx, cy, rx, ry = g_o_parts(p)
    r = ring(cx, cy, rx, ry, p.w * 1.04, p.wh)
    yb = XL + X * bar
    b = box(p.w * 0.5, yb - p.wh / 2, W - p.w * 0.5, yb + p.wh / 2)
    g = unary_union([r, b]).difference(box(cx, yb + p.wh / 2, W + 5, XL + X * term))
    return g, 'round', 'open'

def g_c(p, t1=0.35, t2=0.68):
    W, cx, cy, rx, ry = g_o_parts(p)
    g = ring(cx, cy, rx, ry, p.w * 1.04, p.wh).difference(box(cx, XL + X * t1, W + 5, XL + X * t2))
    return g, 'round', 'open'

def g_i(p, dot=True, gap=None):
    gap = gap if gap is not None else p.w * 0.8
    parts = [box(0, XL, p.w, BASE)]
    if dot:
        parts.append(box(0, XL - gap - p.w, p.w, XL - gap))
    return unary_union(parts), 'stem', 'stem'

def g_l(p):
    return box(0, p.asc, p.w, BASE), 'stem', 'stem'

def arch(p, x0, x1, ry=None):
    """upper half of an n-arch spanning outer x0..x1, springing from x-line"""
    rx = (x1 - x0) / 2
    ry = ry or min(rx * 0.98, X * 0.5)
    cx, cy = x0 + rx, XL - p.o * 0.5 + ry
    r = ring(cx, cy, rx, ry, p.w, p.wh).intersection(box(x0 - 1, XL - 10, x1 + 1, cy))
    return r, cx, cy

def g_r(p, cut=0.66):
    NW = X * 0.94 + (p.w - 10) * 0.8
    a, cx, cy = arch(p, 0, NW)
    a = a.intersection(box(-1, 0, NW * cut, BASE))
    return unary_union([box(0, XL, p.w, BASE), a]), 'stem', 'open'

def g_n_like(p, widths):
    """stems + arches; widths = list of arch outer widths, sharing stems"""
    parts, x = [box(0, XL, p.w, BASE)], 0.0
    for aw in widths:
        a, cx, cy = arch(p, x, x + aw)
        parts += [a, box(x + aw - p.w, cy, x + aw, BASE)]
        x += aw - p.w
    return unary_union(parts)

def g_m(p):
    aw = X * 0.8 + (p.w - 10) * 0.6
    return g_n_like(p, [aw, aw]), 'stem', 'stem'

def g_k(p, j=0.62, arm_x=None, leg_x=None, branch=0.42):
    w = p.w
    wd = w * 1.0
    KW = X * 0.86 + (w - 10) * 0.7
    yj = XL + X * j
    p0 = (w * 0.9, yj)
    p1 = (KW - wd * 0.62, XL)
    bx = p0[0] + (p1[0] - p0[0]) * branch
    by = p0[1] + (p1[1] - p0[1]) * branch
    q1 = (KW - wd * 0.62, BASE)
    arm = stroke(extend(p0, p1, 0.4)[0], extend(p0, p1, 0.4)[1], wd)
    leg = stroke((bx, by), extend((bx, by), q1, 0.4)[1], wd * 1.04)
    diag = unary_union([arm, leg]).intersection(band(XL, BASE)).intersection(box(w * 0.5, 0, 1000, 1000))
    return unary_union([box(0, p.asc, w, BASE), diag]), 'stem', 'diag'

def g_f(p, hook=None, bar_l=None, bar_r=None, cut=0.78):
    w = p.w
    bar_l = bar_l if bar_l is not None else X * 0.2
    bar_r = bar_r if bar_r is not None else X * 0.28
    rh = hook or (X * 0.36 + (w - 10) * 0.5)
    xs = bar_l
    cy = p.asc + rh
    h = ring(xs + rh, cy, rh, rh, w, p.wh).intersection(box(xs - 1, p.asc - 5, xs + rh * 2 * cut, cy))
    parts = [box(xs, cy - 0.01, xs + w, BASE), h, box(0, XL, xs + w + bar_r, XL + p.wh)]
    return unary_union(parts), 'open', 'open'

def g_s(p, wfac=0.84, split=0.47, t_up=0.40, t_dn=0.60, shrink=2.0):
    """two stacked rings sharing a horizontal spine; terminals cut flat."""
    w, wh = p.w, p.wh * 0.98
    SW = X * wfac + (w - 10) * 0.7
    top, bot = XL - p.o, BASE + p.o
    mid = XL + X * split
    cx = SW / 2
    rxl = SW / 2
    rxu = rxl - shrink
    # upper ring: outer from top to mid + wh/2
    cyu, ryu = (top + mid + wh / 2) / 2, (mid + wh / 2 - top) / 2
    cyl, ryl = (mid - wh / 2 + bot) / 2, (bot - (mid - wh / 2)) / 2
    ru = ring(cx, cyu, rxu, ryu, w * 1.02, wh)
    rl = ring(cx, cyl, rxl, ryl, w * 1.02, wh)
    up = unary_union([ru.intersection(box(-5, 0, cx, BASE)),                      # left half (top-left + down to spine)
                      ru.intersection(box(cx, 0, SW + 5, XL + X * t_up * 0.62))])  # top-right, cut flat
    lo = unary_union([rl.intersection(box(cx, 0, SW + 5, 200)),                   # right half
                      rl.intersection(box(-5, XL + X * (1 - (1 - t_dn) * 0.62), cx, 200))])
    return unary_union([up, lo]), 'round', 'round'

def g_E(p, ratio=0.56):
    w, wh, top = p.w, p.wh, p.cap
    EW = (BASE - top) * ratio + (w - 10) * 0.5
    mid = (top + BASE) / 2 + wh * 0.05
    return unary_union([box(0, top, w, BASE), box(0, top, EW, top + wh),
                        box(0, mid - wh / 2, EW * 0.9, mid + wh / 2), box(0, BASE - wh, EW, BASE)]), 'stem', 'open'

def g_F(p, ratio=0.54):
    w, wh, top = p.w, p.wh, p.cap
    EW = (BASE - top) * ratio + (w - 10) * 0.5
    mid = (top + BASE) / 2 + wh * 0.6
    return unary_union([box(0, top, w, BASE), box(0, top, EW, top + wh),
                        box(0, mid - wh / 2, EW * 0.88, mid + wh / 2)]), 'stem', 'open'

def g_dot(p):
    return box(0, BASE - p.w, p.w, BASE), 'stem', 'stem'

GLYPHS = {'e': g_e, 'c': g_c, 'i': g_i, 'l': g_l, 'r': g_r, 'm': g_m, 'k': g_k,
          'f': g_f, 's': g_s, 'E': g_E, 'F': g_F, '.': g_dot}

def setword(text, p, track=0.0, kern=None, space=None, overrides=None):
    """returns list of placed geometries and total ink width"""
    kern = kern or {}
    overrides = overrides or {}
    space = space if space is not None else X * 0.42
    placed, x, prev_r, prev_ch = [], 0.0, None, None
    for idx, ch in enumerate(text):
        if ch == ' ':
            x += space; continue
        fn = overrides.get(idx) or GLYPHS[ch]
        g, lc, rc = fn(p)
        minx, _, maxx, _ = g.bounds
        g = affinity.translate(g, -minx, 0)
        wid = maxx - minx
        if prev_r is not None:
            x += p.side[prev_r] + p.side[lc] + track + kern.get(prev_ch + ch, 0)
        placed.append(affinity.translate(g, x, 0))
        x += wid
        prev_r, prev_ch = rc, ch
    return placed, x

def num(v, nd=2):
    t = f"{v:.{nd}f}".rstrip('0').rstrip('.')
    return '0' if t in ('', '-0') else t

def to_path(geom, dx=0.0, dy=0.0, nd=2):
    geom = geom.simplify(0.015, preserve_topology=True)
    polys = [geom] if isinstance(geom, Polygon) else list(getattr(geom, 'geoms', []))
    out = []
    def ring_d(coords):
        pts = list(coords)[:-1]
        s = f"M{num(pts[0][0]+dx, nd)} {num(pts[0][1]+dy, nd)}"
        s += 'L' + ' '.join(f"{num(x+dx, nd)} {num(y+dy, nd)}" for x, y in pts[1:])
        return s + 'Z'
    for pg in polys:
        if pg.is_empty or not isinstance(pg, Polygon): continue
        out.append(ring_d(pg.exterior.coords))
        for it in pg.interiors:
            out.append(ring_d(it.coords))
    return ''.join(out)

def bounds(geoms):
    u = unary_union(geoms)
    return u.bounds, u

# ---- ligatures / monogram pieces ----
def g_fi(p, join_bar=False, gap=None):
    """f whose hook runs on to become the tittle of the i."""
    w = p.w
    bar_l, bar_r = X * 0.2, X * 0.22
    rh = X * 0.36 + (w - 10) * 0.5
    xs = bar_l
    cy = p.asc + rh
    xi = xs + w + bar_r + (gap if gap is not None else p.side['stem'] * 2 - X * 0.06)
    h = ring(xs + rh, cy, rh, rh, w, p.wh).intersection(box(xs - 1, p.asc - 5, xs + rh, cy))
    run = box(xs + rh - 0.01, p.asc - p.o * 0.0, xi + w, p.asc + p.wh)
    parts = [box(xs, cy - 0.01, xs + w, BASE), h, run, box(xi, XL, xi + w, BASE)]
    bar_end = xi + 0.01 if join_bar else xs + w + bar_r
    parts.append(box(0, XL, bar_end, XL + p.wh))
    return unary_union(parts), 'open', 'stem'

def g_ef(p, gap=None, bar=0.44, over=0.3):
    """monogram: the bar of the e runs through the f stem and becomes its crossbar."""
    w = p.w
    W, cx, cy, rx, ry = g_o_parts(p)
    yb = XL + X * bar
    e = ring(cx, cy, rx, ry, w * 1.04, p.wh)
    e = unary_union([e, box(w * 0.5, yb - p.wh / 2, W - w * 0.5, yb + p.wh / 2)])
    e = e.difference(box(cx, yb + p.wh / 2, W + 5, XL + X * 0.72))
    xs = W + (gap if gap is not None else p.side['round'] + p.side['stem'] + X * 0.12)
    rh = X * 0.36 + (w - 10) * 0.5
    fcy = p.asc + rh
    h = ring(xs + rh, fcy, rh, rh, w, p.wh).intersection(box(xs - 1, p.asc - 5, xs + rh * 2 * 0.78, fcy))
    f = unary_union([box(xs, fcy - 0.01, xs + w, BASE), h,
                     box(W - w, yb - p.wh / 2, xs + w + X * over, yb + p.wh / 2)])
    return unary_union([e, f]), 'round', 'open'

GLYPHS.update({'φ': g_fi, 'ε': g_ef})

def g_ef_top(p, gap=None, over=0.22):
    """monogram: the f crossbar starts on top of the e, joined at the x-line."""
    w = p.w
    e, _, _ = g_e(p)
    W, cx, cy, rx, ry = g_o_parts(p)
    xs = W + (gap if gap is not None else p.side['round'] + X * 0.02)
    rh = X * 0.36 + (w - 10) * 0.5
    fcy = p.asc + rh
    h = ring(xs + rh, fcy, rh, rh, w, p.wh).intersection(box(xs - 1, p.asc - 5, xs + rh * 2 * 0.78, fcy))
    top = XL - p.o
    bar = box(cx, top, xs + w + X * over, top + p.wh)
    return unary_union([e, box(xs, fcy - 0.01, xs + w, BASE), h, bar]), 'round', 'open'

def g_Fi(p, gap=None):
    """capital F whose top arm runs on to dot the i."""
    w, wh, top = p.w, p.wh, p.cap
    EW = (BASE - top) * 0.54 + (w - 10) * 0.5
    mid = (top + BASE) / 2 + wh * 0.6
    xi = EW + (gap if gap is not None else p.side['open'] + p.side['stem'])
    return unary_union([box(0, top, w, BASE), box(0, top, xi + w, top + wh),
                        box(0, mid - wh / 2, EW * 0.88, mid + wh / 2), box(xi, XL, xi + w, BASE)]), 'stem', 'stem'

GLYPHS.update({'ж': g_ef_top, 'Φ': g_Fi})
