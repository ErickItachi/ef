"""Build the Película typeface (Erick Filmes) as TTF, OTF and WOFF2 from the shapely glyph drawings.

usage: python3 build_font.py <glyphs dir> <out dir>
"""
import sys, os
sys.path.insert(0, sys.argv[1])
from font import *
from shapely.geometry import Polygon, MultiPolygon
from shapely.geometry.polygon import orient
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.ttLib import TTFont

OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
p = P_font(16)
S = 8.0                     # design unit -> font unit (em 1000)
FAMILY = 'Pelicula'
SPACE = X * 0.33 * (0.85 + 0.15 * p.w / 16)

NAMES = {' ': 'space', '.': 'period', ',': 'comma', ':': 'colon', ';': 'semicolon', '!': 'exclam', '?': 'question',
         '-': 'hyphen', "'": 'quotesingle', '/': 'slash', '(': 'parenleft', ')': 'parenright', '·': 'periodcentered',
         'ı': 'dotlessi', 'φ': 'f_i'}
DIGITS = 'zero one two three four five six seven eight nine'.split()


def gname(ch):
    if ch in NAMES:
        return NAMES[ch]
    if ch.isdigit():
        return DIGITS[int(ch)]
    if ch.isascii() and ch.isalpha():
        return ch
    return 'uni%04X' % ord(ch)


def contours(geom, dx):
    """font-space contours: list of point lists, outer counter-clockwise (CFF convention)."""
    polys = [geom] if isinstance(geom, Polygon) else [g for g in getattr(geom, 'geoms', []) if isinstance(g, Polygon)]
    out = []
    for pg in polys:
        pg = orient(pg.simplify(0.02, preserve_topology=True), 1.0)
        if pg.area < 0.05:
            continue
        for ring, outer in [(pg.exterior, True)] + [(r, False) for r in pg.interiors]:
            pts = []
            for x, y in list(ring.coords)[:-1]:
                q = (round((x + dx) * S), round((BASE - y) * S))
                if not pts or q != pts[-1]:
                    pts.append(q)
            if len(pts) > 1 and pts[0] == pts[-1]:
                pts.pop()
            if len(pts) < 3:
                continue
            area = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
            ccw = area > 0
            if ccw != outer:
                pts.reverse()
            out.append(pts)
    return out


chars = sorted(set(list(BASEMAP) + list(COMPOSE) + list(COMPOSE_UC)))
glyph_order = ['.notdef', 'space'] + [gname(c) for c in chars]
metrics, outlines, cmap = {}, {}, {}
for ch in chars:
    g, lc, rc = glyph(ch, p)
    base = (COMPOSE.get(ch) or COMPOSE_UC.get(ch) or (None,))[0]
    x0, _, x1, _ = (glyph(base, p)[0] if base else g).bounds    # accents never widen the letter
    lsb = p.side[lc]
    adv = lsb + (x1 - x0) + p.side[rc]
    outlines[gname(ch)] = contours(g, lsb - x0)
    metrics[gname(ch)] = (round(adv * S), round(lsb * S))
    if ch != 'φ':
        cmap[ord(ch)] = gname(ch)
outlines['space'] = []
metrics['space'] = (round(SPACE * S), 0)
cmap[0x20] = 'space'
cmap[0xA0] = 'space'
# .notdef: a plain box
nd = [[(50, 0), (450, 0), (450, 700), (50, 700)], [(100, 50), (100, 650), (400, 650), (400, 50)]]
outlines['.notdef'] = nd
metrics['.notdef'] = (500, 50)

ASC, DESC_ = 900, -250
VERSION = 'Version 1.000'


def features():
    kern = []
    for pair, v in KERN_FONT.items():
        a, b = pair[0], pair[1]
        if ord(a) in cmap and ord(b) in cmap:
            kern.append(f'    pos {gname(a)} {gname(b)} {round(v * S)};')
    return ('languagesystem DFLT dflt;\nlanguagesystem latn dflt;\n'
            'feature liga {\n    sub f i by f_i;\n} liga;\n'
            '@digits = [' + ' '.join(DIGITS) + '];\n'
            'feature kern {\n' + '\n'.join(kern) + f'\n    pos @digits @digits {round(FIG_EXTRA * S)};\n}} kern;\n')


def build(flavor):
    fb = FontBuilder(1000, isTTF=(flavor == 'ttf'))
    fb.setupGlyphOrder(glyph_order)
    fb.setupCharacterMap(cmap)
    if flavor == 'ttf':
        glyphs = {}
        for n in glyph_order:
            pen = TTGlyphPen(None)
            for c in outlines[n]:
                c2 = list(reversed(c))          # TrueType: outer contours clockwise
                pen.moveTo(c2[0])
                for q in c2[1:]:
                    pen.lineTo(q)
                pen.closePath()
            glyphs[n] = pen.glyph()
        fb.setupGlyf(glyphs)
    else:
        cs = {}
        for n in glyph_order:
            pen = T2CharStringPen(metrics[n][0], None)
            for c in outlines[n]:
                pen.moveTo(c[0])
                for q in c[1:]:
                    pen.lineTo(q)
                pen.closePath()
            cs[n] = pen.getCharString()
        fb.setupCFF(FAMILY + '-Bold', {'FullName': 'Pelicula Bold'}, cs, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASC, descent=DESC_)
    fb.setupNameTable({'familyName': FAMILY, 'styleName': 'Bold', 'uniqueFontIdentifier': 'ErickFilmes:Pelicula-Bold:2026',
                       'fullName': 'Pelicula Bold', 'psName': 'Pelicula-Bold', 'version': VERSION,
                       'copyright': '© 2026 Erick Filmes', 'designer': 'Erick Filmes'})
    fb.setupOS2(sTypoAscender=ASC, sTypoDescender=DESC_, sTypoLineGap=0, usWinAscent=ASC, usWinDescent=-DESC_,
                sxHeight=round((BASE - XL) * S), sCapHeight=round((BASE - CAP) * S), usWeightClass=700, fsSelection=0x20,
                achVendID='ERFM')
    fb.setupPost()
    fb.font['head'].macStyle = 1
    if flavor == 'ttf':
        fb.setupDummyDSIG() if hasattr(fb, 'setupDummyDSIG') else None
    addOpenTypeFeaturesFromString(fb.font, features())
    ext = 'ttf' if flavor == 'ttf' else 'otf'
    path = os.path.join(OUT, f'Pelicula-Bold.{ext}')
    fb.save(path)
    return path


ttf = build('ttf')
otf = build('otf')
f = TTFont(ttf)
f.flavor = 'woff2'
f.save(os.path.join(OUT, 'Pelicula-Bold.woff2'))
print('glyphs', len(glyph_order), 'cmap', len(cmap))
for n in os.listdir(OUT):
    print(n, os.path.getsize(os.path.join(OUT, n)))
