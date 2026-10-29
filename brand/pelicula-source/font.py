"""Erick Filmes typeface — full character set built on the wordmark's system.

SVG coordinates: x-line 40, baseline 100, ascender 12, cap top 16, descender 126.
"""
import math
from ef4 import *
from ef3 import g_f_h
from shapely.geometry import box, Polygon, LineString, Point
from shapely.ops import unary_union
from shapely import affinity

CAP = 16.0
DESC = 126.0

def P_font(w=16.0):
    return P3(w)

def clip_band(g, y0, y1):
    return g.intersection(box(-500, y0, 1500, y1))

def diag(p0, p1, wd, ext=0.5):
    a, b = extend(p0, p1, ext)
    return stroke(a, b, wd)

def bowl_ring(cx, cy, rx, ry, p, k=1.04):
    return ring(cx, cy, rx, ry, p.w * k, p.wh)

# ---------------------------------------------------------------- lowercase
def o_metrics(p):
    W, cx, cy, rx, ry = g_o_parts(p)
    return W, cx, cy, rx, ry

def g_o(p):
    W, cx, cy, rx, ry = o_metrics(p)
    return bowl_ring(cx, cy, rx, ry, p), 'round', 'round'

def bowl_with_stem(p, side, top, bottom):
    W, cx, cy, rx, ry = o_metrics(p)
    b = bowl_ring(cx, cy, rx, ry, p)
    if side == 'right':
        st = box(W - p.w, top, W, bottom)
    else:
        st = box(0, top, p.w, bottom)
    return unary_union([b, st]), W

def g_a(p):
    g, W = bowl_with_stem(p, 'right', XL - p.o * 0, BASE)
    return g, 'round', 'stem'

def g_d(p):
    g, W = bowl_with_stem(p, 'right', p.asc, BASE)
    return g, 'round', 'stem'

def g_b(p):
    g, W = bowl_with_stem(p, 'left', p.asc, BASE)
    return g, 'stem', 'round'

def g_p(p):
    g, W = bowl_with_stem(p, 'left', XL, DESC)
    return g, 'stem', 'round'

def g_q(p):
    g, W = bowl_with_stem(p, 'right', XL, DESC)
    return g, 'round', 'stem'

def hook_down(p, x_right, rx, ry, top, reach=0.55, bottom=DESC):
    """a stem whose right edge is x_right, falling from `top` into a hook that turns left"""
    cx = x_right - rx
    cy = bottom + p.o - ry
    r = ring(cx, cy, rx, ry, p.w, p.wh)
    arc = r.intersection(box(cx - rx * reach, cy, x_right + 2, bottom + 5))
    stem = box(x_right - p.w, top, x_right, cy + 0.01)
    return unary_union([arc, stem])

def g_g(p):
    W, cx, cy, rx, ry = o_metrics(p)
    b = bowl_ring(cx, cy, rx, ry, p)
    h = hook_down(p, W, W / 2, 22.0, XL, reach=0.78)
    return unary_union([b, h]), 'round', 'stem'

def g_j(p):
    h = hook_down(p, p.w, 17.0, 20.0, XL, reach=0.6)
    dot = box(0, XL - p.w * 0.8 - p.w, p.w, XL - p.w * 0.8)
    return unary_union([h, dot]), 'open', 'stem'

def g_n(p):
    NW = X * 0.94 + (p.w - 10) * 0.8
    return g_n_like(p, [NW]), 'stem', 'stem'

def g_h(p):
    NW = X * 0.94 + (p.w - 10) * 0.8
    return unary_union([g_n_like(p, [NW]), box(0, p.asc, p.w, BASE)]), 'stem', 'stem'

def g_u(p):
    n, _, _ = g_n(p)
    x0, y0, x1, y1 = n.bounds
    u = affinity.rotate(n, 180, origin=((x0 + x1) / 2, (XL + BASE) / 2))
    # the rotation moves the overshoot to the bottom; keep the x-line flush
    return u, 'stem', 'stem'

def g_t(p):
    w = p.w
    bl, br = X * 0.16, X * 0.26
    top = 22.0
    return unary_union([box(bl, top, bl + w, BASE), box(0, XL, bl + w + br, XL + p.wh)]), 'open', 'open'

def vee(p, W, top, bottom, wd=None):
    wd = wd or p.w * 1.04
    a = diag((wd * 0.55, top), (W / 2, bottom), wd)
    b = diag((W - wd * 0.55, top), (W / 2, bottom), wd)
    return clip_band(unary_union([a, b]), top, bottom)

def g_v(p):
    W = X * 0.96 + (p.w - 10) * 0.6
    return vee(p, W, XL, BASE), 'diag', 'diag'

def g_w(p):
    W = X * 1.46 + (p.w - 10) * 0.9
    wd = p.w * 0.98
    pts = [(wd * 0.55, XL), (W * 0.27, BASE), (W * 0.5, XL + 2), (W * 0.73, BASE), (W - wd * 0.55, XL)]
    parts = [diag(pts[i], pts[i + 1], wd) for i in range(4)]
    return clip_band(unary_union(parts), XL, BASE), 'diag', 'diag'

def g_x(p):
    W = X * 0.92 + (p.w - 10) * 0.6
    wd = p.w * 1.04
    a = diag((wd * 0.5, XL), (W - wd * 0.5, BASE), wd)
    b = diag((W - wd * 0.5, XL), (wd * 0.5, BASE), wd)
    return clip_band(unary_union([a, b]), XL, BASE), 'diag', 'diag'

def g_y(p):
    W = X * 0.96 + (p.w - 10) * 0.6
    wd = p.w * 1.04
    right = diag((W - wd * 0.55, XL), (W * 0.3, DESC), wd)
    # left arm meets the right stroke at the baseline
    t = (BASE - XL) / (DESC - XL)
    mx = (W - wd * 0.55) + (W * 0.3 - (W - wd * 0.55)) * t
    left = diag((wd * 0.55, XL), (mx, BASE), wd)
    g = unary_union([clip_band(right, XL, DESC), clip_band(left, XL, BASE)])
    return g, 'diag', 'diag'

def g_z(p):
    W = X * 0.84 + (p.w - 10) * 0.5
    wh = p.wh
    d = diag((W - p.w * 0.7, XL + wh), (p.w * 0.7, BASE - wh), p.w * 1.08)
    g = unary_union([box(0, XL, W, XL + wh), box(0, BASE - wh, W, BASE), clip_band(d, XL, BASE)])
    return g.intersection(box(0, 0, W, 200)), 'open', 'open'

def g_f2(p, run=0.45):
    """standalone f drawn from the logo's fi: quarter-round hook, then a short flat run"""
    w = p.w
    bar_l, bar_r = X * 0.2, X * 0.22
    rh = X * 0.36 + (w - 10) * 0.5
    xs = bar_l
    cy = p.asc + rh
    h = ring(xs + rh, cy, rh, rh, w, p.wh).intersection(box(xs - 1, p.asc - 5, xs + rh, cy))
    top = box(xs + rh - 0.01, p.asc, xs + rh + rh * run, p.asc + p.wh)
    parts = [box(xs, cy - 0.01, xs + w, BASE), h, top, box(0, XL, xs + w + bar_r, XL + p.wh)]
    return unary_union(parts), 'open', 'diag'

def g_dotless_i(p):
    return box(0, XL, p.w, BASE), 'stem', 'stem'

# ---------------------------------------------------------------- capitals
def cw(p):
    return p.w * 1.08, p.wh * 1.05      # caps a touch heavier

def g_A(p):
    W = 84 * 0.86 + (p.w - 10) * 0.6
    ws, wh = cw(p)
    a = diag((W / 2, CAP), (ws * 0.5, BASE), ws)
    b = diag((W / 2, CAP), (W - ws * 0.5, BASE), ws)
    legs = clip_band(unary_union([a, b]), CAP, BASE)
    yb = CAP + 84 * 0.64
    bar = box(0, yb - wh / 2, W, yb + wh / 2).intersection(legs.convex_hull)
    return unary_union([legs, bar]), 'diag', 'diag'

def dbowl(x0, top, bottom, W, ws, wh):
    """D-shaped ring segment: flat left (x0), round right, spanning top..bottom"""
    H = bottom - top
    r = H / 2
    cy = (top + bottom) / 2
    outer = unary_union([box(x0, top, x0 + W - r, bottom), ell(x0 + W - r, cy, r, r)])
    inner = unary_union([box(x0 - 1, top + wh, x0 + W - r, bottom - wh), ell(x0 + W - r, cy, r - ws, r - wh)])
    return outer.difference(inner).intersection(box(x0, top, x0 + W + 1, bottom))

def g_B(p):
    ws, wh = cw(p)
    mid = CAP + 84 * 0.47
    top = dbowl(0, CAP, mid + wh / 2, 54, ws, wh)
    bot = dbowl(0, mid - wh / 2, BASE, 60, ws, wh)
    return unary_union([box(0, CAP, ws, BASE), top, bot]), 'stem', 'round'

def g_D(p):
    ws, wh = cw(p)
    return unary_union([box(0, CAP, ws, BASE), dbowl(0, CAP, BASE, 74, ws, wh)]), 'stem', 'round'

def g_P(p):
    ws, wh = cw(p)
    mid = CAP + 84 * 0.55
    return unary_union([box(0, CAP, ws, BASE), dbowl(0, CAP, mid, 58, ws, wh)]), 'stem', 'round'

def g_R(p):
    ws, wh = cw(p)
    mid = CAP + 84 * 0.55
    bowl = dbowl(0, CAP, mid, 58, ws, wh)
    leg = clip_band(diag((30, mid - wh / 2), (60 - ws * 0.5, BASE), ws * 1.02), mid - wh, BASE)
    return unary_union([box(0, CAP, ws, BASE), bowl, leg]), 'stem', 'diag'

def round_cap(p, W=None):
    ws, wh = cw(p)
    W = W or 84 * 1.0
    cx, cy = W / 2, (CAP + BASE) / 2
    return ring(cx, cy, W / 2, 42 + p.o, ws * 1.04, wh), W, cx, cy

def g_O(p):
    g, W, cx, cy = round_cap(p)
    return g, 'round', 'round'

def g_C(p):
    g, W, cx, cy = round_cap(p, 80)
    return g.difference(box(cx, CAP + 84 * 0.33, W + 5, CAP + 84 * 0.67)), 'round', 'open'

def g_G(p):
    ws, wh = cw(p)
    g, W, cx, cy = round_cap(p, 82)
    g = g.difference(box(cx, CAP + 84 * 0.30, W + 5, cy - wh / 2 + 4))
    bar = box(cx + 4, cy - wh / 2 + 4, W, cy + wh / 2 + 4)
    keep = ell(cx, cy, W / 2, 42 + p.o)
    return unary_union([g, bar.intersection(keep)]), 'round', 'open'

def g_Q(p):
    ws, wh = cw(p)
    g, W, cx, cy = round_cap(p)
    tail = clip_band(diag((cx + 10, cy + 16), (W + 4, BASE + 7), ws * 0.98), cy + 10, BASE + 7)
    tail = tail.difference(ell(cx, cy, W / 2 - ws * 1.04, 42 + p.o - wh))
    return unary_union([g, tail]), 'round', 'round'

def g_H(p):
    ws, wh = cw(p)
    W = 70
    mid = (CAP + BASE) / 2
    return unary_union([box(0, CAP, ws, BASE), box(W - ws, CAP, W, BASE), box(0, mid - wh / 2, W, mid + wh / 2)]), 'stem', 'stem'

def g_I(p):
    ws, _ = cw(p)
    return box(0, CAP, ws, BASE), 'stem', 'stem'

def g_J(p):
    ws, wh = cw(p)
    x_r = 46
    rx, ry = 23, 24
    cx, cy = x_r - rx, BASE + p.o - ry
    r = ring(cx, cy, rx, ry, ws, wh)
    arc = r.intersection(box(-5, cy, x_r + 2, BASE + 5))
    stem = box(x_r - ws, CAP, x_r, cy + 0.01)
    return unary_union([arc, stem]), 'open', 'stem'

def g_K(p):
    ws, wh = cw(p)
    W = 66
    yj = CAP + 84 * 0.6
    arm = diag((ws * 0.9, yj), (W - ws * 0.6, CAP), ws)
    bx, by = ws * 0.9 + (W - ws * 0.6 - ws * 0.9) * 0.4, yj + (CAP - yj) * 0.4
    leg = stroke((bx, by), extend((bx, by), (W - ws * 0.55, BASE), 0.4)[1], ws * 1.04)
    d = clip_band(unary_union([arm, leg]), CAP, BASE).intersection(box(ws * 0.5, 0, 500, 500))
    return unary_union([box(0, CAP, ws, BASE), d]), 'stem', 'diag'

def g_L(p):
    ws, wh = cw(p)
    return unary_union([box(0, CAP, ws, BASE), box(0, BASE - wh, 50, BASE)]), 'stem', 'open'

def g_M(p):
    ws, wh = cw(p)
    W = 96
    a = diag((ws * 0.5, CAP), (W / 2, BASE), ws * 0.92)
    b = diag((W - ws * 0.5, CAP), (W / 2, BASE), ws * 0.92)
    d = clip_band(unary_union([a, b]), CAP, BASE).intersection(box(0, 0, W, 500))
    return unary_union([box(0, CAP, ws, BASE), box(W - ws, CAP, W, BASE), d]), 'stem', 'stem'

def g_N(p):
    ws, wh = cw(p)
    W = 74
    d = clip_band(diag((ws * 0.5, CAP), (W - ws * 0.5, BASE), ws * 1.0), CAP, BASE).intersection(box(0, 0, W, 500))
    return unary_union([box(0, CAP, ws, BASE), box(W - ws, CAP, W, BASE), d]), 'stem', 'stem'

def s_shape(top_line, base_line, SW, w, wh, split=0.47, t_up=0.40, t_dn=0.60, shrink=2.0, o=1.2):
    """the wordmark s construction on any band: two stacked rings, flat-cut terminals"""
    H = base_line - top_line
    top, bot = top_line - o, base_line + o
    mid = top_line + H * split
    cx = SW / 2
    rxl, rxu = SW / 2, SW / 2 - shrink
    cyu, ryu = (top + mid + wh / 2) / 2, (mid + wh / 2 - top) / 2
    cyl, ryl = (mid - wh / 2 + bot) / 2, (bot - (mid - wh / 2)) / 2
    ru = ring(cx, cyu, rxu, ryu, w * 1.02, wh)
    rl = ring(cx, cyl, rxl, ryl, w * 1.02, wh)
    up = unary_union([ru.intersection(box(-5, top - 5, cx, base_line)), ru.intersection(box(cx, top - 5, SW + 5, top_line + H * t_up * 0.62))])
    lo = unary_union([rl.intersection(box(cx, top - 5, SW + 5, bot + 5)), rl.intersection(box(-5, top_line + H * (1 - (1 - t_dn) * 0.62), cx, bot + 5))])
    return unary_union([up, lo])

def g_S(p):
    ws, wh = cw(p)
    return s_shape(CAP, BASE, 68, ws, wh * 0.98, shrink=2.6, o=p.o), 'round', 'round'

def g_T(p):
    ws, wh = cw(p)
    W = 68
    return unary_union([box(0, CAP, W, CAP + wh), box(W / 2 - ws / 2, CAP, W / 2 + ws / 2, BASE)]), 'open', 'open'

def g_U(p):
    ws, wh = cw(p)
    W = 72
    r = W / 2
    cy = BASE + p.o - r
    outer = unary_union([box(0, CAP, W, cy), ell(r, cy, r, r)])
    inner = unary_union([box(ws, CAP - 1, W - ws, cy), ell(r, cy, r - ws, r - wh)])
    return outer.difference(inner).intersection(box(0, CAP, W, 200)), 'stem', 'stem'

def g_V(p):
    ws, wh = cw(p)
    return vee(p, 80, CAP, BASE, ws), 'diag', 'diag'

def g_W(p):
    ws, wh = cw(p)
    W = 118
    pts = [(ws * 0.55, CAP), (W * 0.27, BASE), (W * 0.5, CAP + 4), (W * 0.73, BASE), (W - ws * 0.55, CAP)]
    parts = [diag(pts[i], pts[i + 1], ws * 0.96) for i in range(4)]
    return clip_band(unary_union(parts), CAP, BASE), 'diag', 'diag'

def g_X(p):
    ws, wh = cw(p)
    W = 76
    a = diag((ws * 0.5, CAP), (W - ws * 0.5, BASE), ws)
    b = diag((W - ws * 0.5, CAP), (ws * 0.5, BASE), ws)
    return clip_band(unary_union([a, b]), CAP, BASE), 'diag', 'diag'

def g_Y(p):
    """Y as one silhouette: outer arm edges run into the stem, the inner V is cut out"""
    ws, wh = cw(p)
    W = 80
    cx = W / 2
    h = ws / 2
    ym = CAP + 84 * 0.5
    ax = ws * 0.5
    for _ in range(4):                     # put the arm's outer corner exactly on x = 0 at the cap line
        dx, dy = cx - ax, ym - CAP
        L = math.hypot(dx, dy)
        dx, dy = dx / L, dy / L
        ax = h / dy
    A = (ax, CAP)
    nx, ny = -dy, dx                       # left arm: outward (lower-left) normal

    def at_y(off, y):                      # point on the left arm's edge line (offset off) at height y
        t = (y - (A[1] + ny * off)) / dy
        return (A[0] + nx * off + t * dx, y)

    def at_x(off, x):
        t = (x - (A[0] + nx * off)) / dx
        return (x, A[1] + ny * off + t * dy)

    lo_top = at_y(h, CAP - 20)             # outer edge, above the cap line (trimmed later)
    pl = at_x(h, cx - h)                   # outer edge meets the stem
    li_top = at_y(-h, CAP - 20)            # inner edge
    notch = at_x(-h, cx)                   # inner edges meet on the axis
    mirror = lambda q: (W - q[0], q[1])
    mask = Polygon([lo_top, pl, (cx - h, BASE), (cx + h, BASE), mirror(pl), mirror(lo_top)])
    gap = Polygon([li_top, notch, mirror(li_top)])
    return mask.difference(gap).intersection(box(0, CAP, W, BASE)), 'diag', 'diag'

def g_Z(p):
    ws, wh = cw(p)
    W = 70
    d = diag((W - ws * 0.7, CAP + wh), (ws * 0.7, BASE - wh), ws * 1.1)
    g = unary_union([box(0, CAP, W, CAP + wh), box(0, BASE - wh, W, BASE), clip_band(d, CAP, BASE)])
    return g.intersection(box(0, 0, W, 200)), 'open', 'open'

def g_E(p):
    ws, wh = cw(p)
    W = 56
    mid = (CAP + BASE) / 2
    return unary_union([box(0, CAP, ws, BASE), box(0, CAP, W, CAP + wh),
                        box(0, mid - wh / 2, W * 0.9, mid + wh / 2), box(0, BASE - wh, W, BASE)]), 'stem', 'open'

def g_F(p):
    ws, wh = cw(p)
    W = 54
    mid = (CAP + BASE) / 2 + 1
    return unary_union([box(0, CAP, ws, BASE), box(0, CAP, W, CAP + wh),
                        box(0, mid - wh / 2, W * 0.9, mid + wh / 2)]), 'stem', 'open'

# ---------------------------------------------------------------- figures
NT = CAP   # lining figures on the cap height

def g_0(p):
    ws, wh = cw(p)
    W = 62
    return ring(W / 2, (NT + BASE) / 2, W / 2, 42 + p.o, ws, wh), 'round', 'round'

def ell_tangent(P, cx, cy, rx, ry, pick):
    """tangent point on the ellipse seen from P; pick chooses between the two (key on (x, y))."""
    qx, qy = (P[0] - cx) / rx, (P[1] - cy) / ry
    d = math.hypot(qx, qy)
    base, a = math.atan2(qy, qx), math.acos(1 / d)
    pts = [(cx + rx * math.cos(t), cy + ry * math.sin(t)) for t in (base + a, base - a)]
    return pick(pts)

def halfplane(a, b, keep, R=1000.0):
    """big polygon on the side of line ab that contains keep"""
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy); dx, dy = dx / L, dy / L
    nx, ny = -dy, dx
    if (keep[0] - a[0]) * nx + (keep[1] - a[1]) * ny < 0:
        nx, ny = -nx, -ny
    p0, p1 = (a[0] - dx * R, a[1] - dy * R), (a[0] + dx * R, a[1] + dy * R)
    return Polygon([p0, p1, (p1[0] + nx * R, p1[1] + ny * R), (p0[0] + nx * R, p0[1] + ny * R)])

def line_dist(p, a, b):
    return abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / math.hypot(b[0] - a[0], b[1] - a[1])

def g_1(p):
    ws, wh = cw(p)
    sx = 22.0
    top_r = (sx + ws, NT)                 # the slanted top runs from the flag tip to the stem's top-right corner
    d = 24.0                              # drop of the flag tip
    th = math.atan2(d, sx + ws)
    v = wh / math.cos(th)                 # vertical thickness of the flag
    y_at = lambda x: NT + d * (1 - x / (sx + ws))
    shape = Polygon([(0, NT + d), top_r, (sx + ws, BASE), (sx, BASE), (sx, y_at(sx) + v), (0, NT + d + v)])
    return shape, 'open', 'stem'

def g_2(p):
    ws, wh = cw(p)
    W = 62
    rx, ry = W / 2, 29.0
    cx, cy = W / 2, NT + ry - p.o
    ix, iy = rx - ws, ry - wh
    B = BASE - wh
    right = lambda pts: max(pts, key=lambda q: q[0])
    Ti = ell_tangent((0.0, B), cx, cy, ix, iy, right)       # upper edge of the diagonal leaves the counter
    def outer(xo):
        To = ell_tangent((xo, B), cx, cy, rx, ry, right)
        return To, line_dist((xo, B), (0.0, B), Ti)
    lo, hi = 1.0, W
    for _ in range(60):                                      # diagonal as thick as the stems
        mid = (lo + hi) / 2
        if outer(mid)[1] < ws * 1.04: lo = mid
        else: hi = mid
    xo = (lo + hi) / 2
    To, _ = outer(xo)
    ringg = ring(cx, cy, rx, ry, ws, wh)
    # keep the bowl from the left terminal (cut level with the centre) over the top to the tangent chord
    keep_top = box(-5, 0, W + 5, cy - 1)
    keep_right = box(cx, cy - 1, W + 5, BASE).intersection(halfplane(Ti, To, (W, cy)))
    bowl = ringg.intersection(unary_union([keep_top, keep_right]))
    diagp = Polygon([Ti, (0.0, B), (xo, B), To])
    return unary_union([bowl, diagp, box(0, B, W, BASE)]).buffer(0), 'open', 'open'

def two_bowls_open_left(W, ws, wh, top_line, base_line, split=0.47, o=1.2, mid_from=0.3, cut=0.36, cut_up=None):
    H = base_line - top_line
    top, bot = top_line - o, base_line + o
    mid = top_line + H * split
    cx = W / 2
    ru = ring(cx, (top + mid + wh / 2) / 2, W * 0.46, (mid + wh / 2 - top) / 2, ws, wh)
    rl = ring(cx, (mid - wh / 2 + bot) / 2, W * 0.5, (bot - (mid - wh / 2)) / 2, ws, wh)
    cut_up = cut if cut_up is None else cut_up
    up = unary_union([ru.intersection(box(cx, top - 5, W + 5, mid + wh)), ru.intersection(box(-5, top - 5, cx, top + (mid - top) * cut_up))])
    lo = unary_union([rl.intersection(box(cx, mid - wh, W + 5, bot + 5)), rl.intersection(box(-5, bot - (bot - mid) * cut, cx, bot + 5))])
    bar = box(W * mid_from, mid - wh / 2, cx + 1, mid + wh / 2)
    return unary_union([up, lo, bar]), mid

def g_3(p):
    ws, wh = cw(p)
    g, _ = two_bowls_open_left(60, ws, wh, NT, BASE, o=p.o, cut=0.5, cut_up=0.56)
    return g, 'open', 'round'

def g_4(p):
    ws, wh = cw(p)
    W = 68
    sx = W * 0.68
    yb = NT + 84 * 0.7
    bt = yb - wh / 2                       # top of the bar
    stem = box(sx, NT, sx + ws, BASE)
    bar = box(0, bt, W, yb + wh / 2)
    th = math.atan2(bt - NT, sx)           # angle of the diagonal
    v = ws / math.cos(th)                  # same weight as the stem, measured square to the stroke
    # inner edge: parallel to the outer edge (sx, NT)->(0, bt), shifted down by v
    k = (bt - NT) / sx                     # slope (y grows to the left)
    y_inner_at = lambda x: NT + (sx - x) * k + v
    x_hit = sx - (bt - NT - v) / k          # where the inner edge meets the bar top
    diagp = Polygon([(sx, NT), (0, bt), (x_hit, bt), (sx, y_inner_at(sx))])
    return unary_union([stem, bar, diagp]), 'diag', 'open'

def g_5(p):
    ws, wh = cw(p)
    W = 62
    x0 = 5
    mid = NT + 84 * 0.40
    bot = BASE + p.o
    cx = W / 2
    rl = ring(cx, (mid + bot) / 2, W / 2, (bot - mid) / 2, ws, wh)
    bowl = unary_union([rl.intersection(box(cx, mid - 5, W + 5, bot + 5)),
                        rl.intersection(box(-5, bot - (bot - mid) * 0.5, cx, bot + 5))])
    join = box(x0, mid, cx + 1, mid + wh)
    stem = box(x0, NT, x0 + ws, mid + wh)
    top = box(x0, NT, W - 3, NT + wh)
    return unary_union([top, stem, join, bowl]), 'open', 'round'

def g_6(p):
    ws, wh = cw(p)
    W = 62
    r = 30
    cx, cy = W / 2, BASE + p.o - r
    rx, ry = W / 2, r
    ix, iy = rx - ws, ry - wh
    left = lambda pts: min(pts, key=lambda q: q[0])
    xr = W * 0.70                                            # top right corner of the rising stroke
    Ti = ell_tangent((xr, NT), cx, cy, ix, iy, left)
    def outer(xl):
        To = ell_tangent((xl, NT), cx, cy, rx, ry, left)
        return To, line_dist((xl, NT), (xr, NT), Ti)
    lo, hi = xr - 60, xr - 1
    for _ in range(60):
        mid = (lo + hi) / 2
        if outer(mid)[1] > ws * 1.02: lo = mid
        else: hi = mid
    xl = (lo + hi) / 2
    To, _ = outer(xl)
    rise = Polygon([(xl, NT), (xr, NT), Ti, To])
    return unary_union([ring(cx, cy, rx, ry, ws, wh), rise]).buffer(0), 'round', 'round'

def g_9(p):
    g, _, _ = g_6(p)
    x0, y0, x1, y1 = g.bounds
    return affinity.rotate(g, 180, origin=((x0 + x1) / 2, (NT + BASE) / 2)), 'round', 'round'

def g_7(p):
    ws, wh = cw(p)
    W = 60
    d = clip_band(diag((W - ws * 0.6, NT + wh), (W * 0.28, BASE), ws * 1.06), NT, BASE)
    return unary_union([box(0, NT, W, NT + wh), d]).intersection(box(0, 0, W, 200)), 'open', 'diag'

def g_8(p):
    ws, wh = cw(p)
    W = 62
    mid = NT + 84 * 0.46
    up = ring(W / 2, (NT - p.o + mid + wh / 2) / 2, W * 0.44, (mid + wh / 2 - NT + p.o) / 2, ws, wh)
    lo = ring(W / 2, (mid - wh / 2 + BASE + p.o) / 2, W / 2, (BASE + p.o - mid + wh / 2) / 2, ws, wh)
    return unary_union([up, lo]), 'round', 'round'

# ---------------------------------------------------------------- punctuation
def dot_at(p, x, y_bottom):
    return box(x, y_bottom - p.w, x + p.w, y_bottom)

def g_period(p):
    return dot_at(p, 0, BASE), 'stem', 'stem'

def g_middot(p):
    return dot_at(p, 0, (XL + BASE) / 2 + p.w / 2), 'stem', 'stem'

def g_comma(p):
    w = p.w
    tail = Polygon([(0, BASE - w), (w, BASE - w), (w, BASE + 2), (w * 0.2, BASE + w * 1.1), (-w * 0.25, BASE + w * 1.1), (0, BASE)])
    return unary_union([dot_at(p, 0, BASE), tail]), 'stem', 'stem'

def g_colon(p):
    return unary_union([dot_at(p, 0, BASE), dot_at(p, 0, XL + p.w)]), 'stem', 'stem'

def g_semicolon(p):
    c, _, _ = g_comma(p)
    return unary_union([c, dot_at(p, 0, XL + p.w)]), 'stem', 'stem'

def g_excl(p):
    ws, _ = cw(p)
    return unary_union([box(0, CAP, ws, BASE - ws - 12), dot_at(P3(ws), 0, BASE)]), 'stem', 'stem'

def g_quest(p):
    ws, wh = cw(p)
    W = 54
    ry = 25
    cx, cy = W / 2, CAP - p.o + ry
    r = ring(cx, cy, W / 2, ry, ws, wh)
    arc = unary_union([r.intersection(box(-5, CAP - 5, W + 5, cy)), r.intersection(box(cx, cy, W + 5, cy + ry + 2))])
    stem = box(cx - ws / 2, cy + ry - wh, cx + ws / 2, BASE - ws - 12)
    return unary_union([arc, stem, dot_at(P3(ws), cx - ws / 2, BASE)]), 'open', 'open'

def g_hyphen(p):
    return box(0, 66 - p.wh / 2, 28, 66 + p.wh / 2), 'open', 'open'

def g_apos(p):
    w = p.w
    return Polygon([(0, CAP), (w, CAP), (w * 0.8, CAP + 26), (w * 0.2, CAP + 26)]), 'stem', 'stem'

def g_slash(p):
    ws, _ = cw(p)
    return clip_band(diag((44, CAP - 4), (0, BASE + 8), ws * 0.9), CAP - 4, BASE + 8), 'diag', 'diag'

def paren(p, side):
    ws, wh = cw(p)
    r = ring(40, (CAP + BASE) / 2 + 6, 40, 58, ws, wh * 0.6)
    g = r.intersection(box(0, CAP - 8, 24, DESC - 6))
    g = affinity.translate(g, -g.bounds[0], 0)
    if side == ')':
        x0, _, x1, _ = g.bounds
        g = affinity.scale(g, -1, 1, origin=((x0 + x1) / 2, 0))
        return g, 'open', 'round'
    return g, 'round', 'open'

# ---------------------------------------------------------------- accents
def acc_acute(p, cx):
    w = p.w * 0.9
    return Polygon([(cx - 4, 33), (cx + 6, 15), (cx + 6 + w, 15), (cx - 4 + w * 0.7, 33)])

def acc_grave(p, cx):
    g = acc_acute(p, cx)
    return affinity.scale(g, -1, 1, origin=(cx + 4, 24))

def acc_circ(p, cx):
    a = clip_band(diag((cx - 13, 34), (cx, 16), p.w * 0.8, 0.3), 16, 34)
    b = clip_band(diag((cx + 13, 34), (cx, 16), p.w * 0.8, 0.3), 16, 34)
    return unary_union([a, b])

def acc_tilde(p, cx):
    pts = []
    for i in range(61):
        t = i / 60
        pts.append((cx - 17 + 34 * t, 24.5 - 5.5 * math.sin(2 * math.pi * t)))
    return LineString(pts).buffer(p.wh * 0.33, cap_style='flat', quad_segs=12)

def acc_diaer(p, cx):
    s = p.w * 0.9
    return unary_union([box(cx - 4 - s, 18, cx - 4, 18 + s), box(cx + 4, 18, cx + 4 + s, 18 + s)])

def acc_cedilla(p, cx):
    """one slanted stroke hanging from the bowl, cut flat like the comma's tail"""
    t = p.w * 0.62                       # weight, measured square to the stroke
    top, bot = BASE - 4, BASE + 20
    dx = (bot - top) * 0.5               # lean to the left, as in the comma
    wx = t / math.cos(math.atan2(dx, bot - top))
    x0 = cx - wx / 2 + dx * 0.25
    return Polygon([(x0, top), (x0 + wx, top), (x0 + wx - dx, bot), (x0 - dx, bot)])

ACC = {'´': acc_acute, '`': acc_grave, '^': acc_circ, '~': acc_tilde, '¨': acc_diaer, '¸': acc_cedilla}
COMPOSE = {
    'á': ('a', '´'), 'à': ('a', '`'), 'â': ('a', '^'), 'ã': ('a', '~'), 'ä': ('a', '¨'),
    'é': ('e', '´'), 'ê': ('e', '^'), 'è': ('e', '`'),
    'í': ('ı', '´'), 'ì': ('ı', '`'), 'î': ('ı', '^'),
    'ó': ('o', '´'), 'ô': ('o', '^'), 'õ': ('o', '~'), 'ò': ('o', '`'), 'ö': ('o', '¨'),
    'ú': ('u', '´'), 'ü': ('u', '¨'), 'ù': ('u', '`'),
    'ç': ('c', '¸'),
}

BASEMAP = {
    'a': g_a, 'b': g_b, 'c': g_c, 'd': g_d, 'e': g_e, 'f': g_f2, 'g': g_g, 'h': g_h, 'i': g_i, 'j': g_j,
    'k': g_k, 'l': g_l, 'm': g_m, 'n': g_n, 'o': g_o, 'p': g_p, 'q': g_q, 'r': g_r, 's': g_s, 't': g_t,
    'u': g_u, 'v': g_v, 'w': g_w, 'x': g_x, 'y': g_y, 'z': g_z, 'ı': g_dotless_i,
    'A': g_A, 'B': g_B, 'C': g_C, 'D': g_D, 'E': g_E, 'F': g_F, 'G': g_G, 'H': g_H, 'I': g_I, 'J': g_J,
    'K': g_K, 'L': g_L, 'M': g_M, 'N': g_N, 'O': g_O, 'P': g_P, 'Q': g_Q, 'R': g_R, 'S': g_S, 'T': g_T,
    'U': g_U, 'V': g_V, 'W': g_W, 'X': g_X, 'Y': g_Y, 'Z': g_Z,
    '0': g_0, '1': g_1, '2': g_2, '3': g_3, '4': g_4, '5': g_5, '6': g_6, '7': g_7, '8': g_8, '9': g_9,
    '.': g_period, '·': g_middot, ',': g_comma, ':': g_colon, ';': g_semicolon, '!': g_excl, '?': g_quest,
    '-': g_hyphen, "'": g_apos, '/': g_slash, '(': lambda p: paren(p, '('), ')': lambda p: paren(p, ')'),
    'φ': g_fi3,
}

COMPOSE_UC = {
    'Á': ('A', '´'), 'À': ('A', '`'), 'Â': ('A', '^'), 'Ã': ('A', '~'),
    'É': ('E', '´'), 'Ê': ('E', '^'), 'Í': ('I', '´'),
    'Ó': ('O', '´'), 'Ô': ('O', '^'), 'Õ': ('O', '~'), 'Ú': ('U', '´'), 'Ç': ('C', '¸'),
}

_cache = {}
def glyph(ch, p):
    key = (ch, p.w)
    if key in _cache:
        return _cache[key]
    if ch in COMPOSE_UC:
        b, a = COMPOSE_UC[ch]
        g, lc, rc = glyph(b, p)
        x0, _, x1, _ = g.bounds
        cx = (x0 + x1) / 2 + (2 if b == 'E' else 0)
        acc = ACC[a](p, cx)
        if a != '¸':
            ay0, ay1 = acc.bounds[1], acc.bounds[3]
            acc = affinity.scale(acc, 1, 0.8, origin=(cx, ay1))
            acc = affinity.translate(acc, 0, (CAP - 5) - ay1)     # sit just above the cap line
        res = (unary_union([g, acc]), lc, rc)
        _cache[key] = res
        return res
    if ch in COMPOSE:
        b, a = COMPOSE[ch]
        g, lc, rc = glyph(b, p)
        x0, _, x1, _ = g.bounds
        cx = (x0 + x1) / 2 + (2 if b in 'aqd' else 0) - (p.w * 0.5 if b == 'ı' else 0) + (p.w * 0.5 if b == 'ı' else 0)
        res = (unary_union([g, ACC[a](p, cx)]), lc, rc)
    else:
        res = BASEMAP[ch](p)
    _cache[key] = res
    return res

KERN_FONT = {'es': 1.0, 'e.': -0.5, 'fa': -2, 'fe': -2, 'fo': -2, 'fc': -2, 'r.': -4, 'r,': -4, 'Te': -6, 'To': -6, 'Ta': -6, 'Ty': -4, 'Vo': -4, 'Va': -4, 'Yo': -4,
             'LT': -6, 'AV': -6, 'VA': -6, 'AT': -5, 'TA': -5, 'f.': -2, 'k.': -1}

FIG_EXTRA = 4.5

def set_line(text, p, track=0.0, space=None, kern=None, liga=True):
    kern = KERN_FONT if kern is None else kern
    if liga:
        text = text.replace('fi', 'φ')
    space = space if space is not None else X * 0.33 * (0.85 + 0.15 * p.w / 16)
    placed, x, prev_r, prev_ch = [], 0.0, None, None
    for ch in text:
        if ch == ' ':
            x += space            # like the logo: sidebearings still apply around the space
            prev_ch = ' '
            continue
        g, lc, rc = glyph(ch, p)
        minx, _, maxx, _ = g.bounds
        g = affinity.translate(g, -minx, 0)
        if prev_r is not None:
            x += p.side[prev_r] + p.side[lc] + track + kern.get((prev_ch or '') + ch, 0)
            if ch.isdigit() and (prev_ch or '').isdigit():
                x += FIG_EXTRA            # figures sit on the cap height and need more air than letters
        placed.append(affinity.translate(g, x, 0))
        x += maxx - minx
        prev_r, prev_ch = rc, ch
    return unary_union(placed), x

def set_lines(lines, p, leading=118.0, align='left', **kw):
    out, widths = [], []
    geoms = [set_line(t, p, **kw) for t in lines]
    W = max(w for _, w in geoms)
    for i, (g, w) in enumerate(geoms):
        dx = 0 if align == 'left' else (W - w) / 2 if align == 'center' else (W - w)
        out.append(affinity.translate(g, dx, i * leading))
    return unary_union(out)
