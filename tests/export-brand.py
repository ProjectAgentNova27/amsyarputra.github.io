"""Regenerate outlined artwork from the portal's licensed Inter font at weight 700."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

root = Path(__file__).resolve().parent.parent
font = instantiateVariableFont(TTFont(root / 'assets/fonts/InterVariable.woff2'), {'wght': 700})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
names = [cmap[ord(c)] for c in 'ap.']
width = sum(glyphs[n].width for n in names)
scale = 416 / width
variants = {'on-dark': ('#f3f5f7', '#83daef'), 'on-light': ('#17202a', '#076b83'), 'mono': ('#17202a', '#17202a')}
target = root / 'assets/brand'
target.mkdir(exist_ok=True)
for variant, colors in variants.items():
    paths = []
    x = 48
    for i, name in enumerate(names):
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 310)))
        paths.append(f'<path fill="{colors[1 if i == 2 else 0]}" d="{pen.getCommands()}"/>')
        x += glyphs[name].width * scale
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="AP. wordmark"><title>AP. wordmark</title>' + ''.join(paths) + '</svg>\n'
    (target / f'ap-{variant}.svg').write_text(svg)
