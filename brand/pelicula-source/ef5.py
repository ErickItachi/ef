"""Round 4: camera-related symbols built from the wordmark's e."""
from ef4 import *

W16 = 16.0

def e_geom(w=W16, scale=1.0):
    p = P3(w)
    g, _, _ = g_e(p)
    g = affinity.translate(g, -g.bounds[0], -g.bounds[1])
    if scale != 1.0:
        g = affinity.scale(g, scale, scale, origin=(0, 0))
    return g

def center_on(g, cx, cy):
    x0, y0, x1, y1 = g.bounds
    return affinity.translate(g, cx - (x0 + x1) / 2, cy - (y0 + y1) / 2)

def rrect(x0, y0, x1, y1, r):
    return box(x0 + r, y0 + r, x1 - r, y1 - r).buffer(r, quad_segs=24, join_style='round')

def sym_visor(w=W16, size=240.0, arm=58.0):
    """focus brackets around the e."""
    t = w * 0.9
    s = size
    corners = []
    for sx, sy in ((0, 0), (1, 0), (0, 1), (1, 1)):
        x = 0 if sx == 0 else s - arm
        y = 0 if sy == 0 else s - t
        h = box(x, y, x + arm, y + t)
        x = 0 if sx == 0 else s - t
        y = 0 if sy == 0 else s - arm
        v = box(x, y, x + t, y + arm)
        corners += [h, v]
    p = P3(w)
    placed, _ = setword('e.', p, 0.0, KERN3)
    ed = center_on(unary_union(placed), s / 2, s / 2 + 2)
    return unary_union(corners + [ed])

def sym_camera(w=W16):
    """camera body whose lens is the e (knocked out); square dot as the viewfinder."""
    W, H = 236.0, 160.0
    body = rrect(0, 26, W, 26 + H, 18)
    bump = rrect(26, 0, 92, 40, 8)
    e = center_on(e_geom(w, 1.55), W * 0.5, 26 + H / 2 + 2)
    lens_ring = Point(W * 0.5, 26 + H / 2 + 2).buffer(66, quad_segs=48)
    shape = unary_union([body, bump]).difference(lens_ring)
    shape = unary_union([shape, e])
    sq = w * 1.0
    win = box(W - 30 - sq, 26 + 22, W - 30, 26 + 22 + sq)
    return shape.difference(win)

def sym_claquete(w=W16, angle=-22.0):
    """the e opens along its bar like a clapperboard."""
    p = P3(w)
    e, _, _ = g_e(p)
    yb = XL + X * 0.44
    cut = yb - p.wh / 2
    top = e.intersection(box(-50, -50, 200, cut))
    bottom = e.intersection(box(-50, cut, 200, 300))
    hinge = (bottom.bounds[0] + 0.0, cut)
    top = affinity.translate(top, 0, -3.0)
    top = affinity.rotate(top, angle, origin=(hinge[0], hinge[1]))
    return unary_union([top, bottom])

def sym_fotograma(w=W16):
    """a film frame: perforated strip with the e knocked out."""
    W, H = 250.0, 200.0
    frame = rrect(0, 0, W, H, 10)
    holes = []
    n, hs = 6, 15.0
    gap = (W - 2 * 22 - n * hs) / (n - 1)
    for i in range(n):
        x = 22 + i * (hs + gap)
        holes.append(box(x, 14, x + hs, 14 + hs))
        holes.append(box(x, H - 14 - hs, x + hs, H - 14))
    win = rrect(18, 44, W - 18, H - 44, 6)
    e = center_on(e_geom(w, 1.25), W / 2, H / 2 + 1)
    return unary_union([frame.difference(unary_union(holes)).difference(win), e])

def sym_lente(w=W16):
    """lens front: solid disc, barrel ring, the e knocked out at the centre."""
    R = 110.0
    disc = Point(R, R).buffer(R, quad_segs=64)
    ring = Point(R, R).buffer(R - 14, quad_segs=64).difference(Point(R, R).buffer(R - 22, quad_segs=64))
    e = center_on(e_geom(w, 1.6), R, R + 2)
    return disc.difference(ring).difference(e)

def sym_visor2(w=W16, size=240.0, arm=56.0, escale=1.35):
    t = w * 0.9
    s = size
    parts = []
    for sx in (0, 1):
        for sy in (0, 1):
            x = 0 if sx == 0 else s - arm
            y = 0 if sy == 0 else s - t
            parts.append(box(x, y, x + arm, y + t))
            x = 0 if sx == 0 else s - t
            y = 0 if sy == 0 else s - arm
            parts.append(box(x, y, x + t, y + arm))
    p = P3(w)
    placed, _ = setword('e.', p, 0.0, KERN3)
    ed = affinity.scale(unary_union(placed), escale, escale, origin=(0, 0))
    ed = center_on(ed, s / 2, s / 2 + 2)
    return unary_union(parts + [ed])

def sym_olho(R=100.0, eye=0.36, slot=0.17, bar=0.5):
    """ultra-bold e: a solid disc with a half-moon eye and a slot opening right."""
    disc = Point(R, R).buffer(R, quad_segs=96)
    yb = R * 2 * bar                     # bar centre line
    er = R * eye                          # eye radius
    eye_shape = Point(R, yb).buffer(er, quad_segs=64).intersection(box(0, 0, 2 * R, yb - R * 0.07))
    slot_h = R * 2 * slot
    slot_shape = box(R, yb + R * 0.07, 2 * R + 5, yb + R * 0.07 + slot_h)
    return disc.difference(eye_shape).difference(slot_shape)

def sym_claquete2(w=W16):
    """clapperboard: board with the e knocked out, striped stick opening on top."""
    W, H = 230.0, 160.0
    board = rrect(0, 60, W, 60 + H, 14).difference(center_on(e_geom(w, 1.45), W / 2, 60 + H / 2 + 2))
    stick = rrect(0, 18, W, 52, 6)
    slots = []
    for i in range(4):
        x = 34 + i * 50
        slots.append(Polygon([(x, 18), (x + 14, 18), (x + 2, 52), (x - 12, 52)]))
    stick = stick.difference(unary_union(slots))
    stick = affinity.rotate(stick, -12, origin=(0, 52))
    return unary_union([board, stick])
