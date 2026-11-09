"""Extract every annotated colony for the homepage hero.

Reads   instances/images/*.tif  +  instances/labels/<same name>.txt  (YOLO-seg)
Writes  assets/instances/sheet_<n>.webp   sprite sheets of feathered cut-outs
        js/instances.js                   window.INSTANCES = { bg, sheets, items }

Each colony is cropped around its polygon, scaled down, colour-matched to a
common microscope background, and given a soft alpha mask (polygon dilated to
keep the phase-contrast halo, then blurred) so many cut-outs can be composited
into one field on the page.

File naming: <species><timepoint><medium>_<nn>
  species   e = E. coli, s = Salmonella
  timepoint 2, 25 (=2.5), 3, 35 (=3.5), 4   (hours)
  medium    o = onion, p = plain

Run from the repo root:  python tools/build_instances.py
"""
import json
import re
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "instances" / "images"
LBL_DIR = ROOT / "instances" / "labels"
OUT_DIR = ROOT / "assets" / "instances"
OUT_JS = ROOT / "js" / "instances.js"

SCALE = 0.6         # source px -> sprite px (crisp at 2x DPR for the hero's display size)
MAX_SPRITE = 300    # cap on a sprite's longer side (huge clusters get shrunk more)
PAD = 22            # source px of context kept around each polygon
HALO = 12           # source px the mask is grown by (keeps the bright halo)
FEATHER = 6         # source px of blur on the mask edge
SHEET = 2048
WEBP_Q = 80

NAME_RE = re.compile(r"^([es])(2|25|3|35|4)([op])_(\d+)$")
SPECIES = {"e": "E. coli", "s": "Salmonella"}
MEDIUM = {"o": "onion", "p": "plain"}
CLASSES = {0: "ecoli", 1: "salm"}


def rdp(pts, eps):
    """Ramer-Douglas-Peucker polyline simplification."""
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = (dx * dx + dy * dy) ** 0.5 or 1e-9
    dmax, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / norm
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[: idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]


def simplify_closed(pts, eps):
    if len(pts) < 8:
        return pts
    x0, y0 = pts[0]
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - x0) ** 2 + (pts[i][1] - y0) ** 2)
    return rdp(pts[: far + 1], eps)[:-1] + rdp(pts[far:] + [pts[0]], eps)[:-1]


def read_polys(path, w, h):
    out = []
    for line in path.read_text().split("\n"):
        parts = line.split()
        if len(parts) < 7:
            continue
        v = list(map(float, parts[1:]))
        out.append((int(parts[0]), [(v[i] * w, v[i + 1] * h) for i in range(0, len(v) - 1, 2)]))
    return out


def border_median(im, mask):
    """Median colour of the crop where the (unblurred) mask is empty."""
    inv = ImageChops.invert(mask)
    return ImageStat.Stat(im, inv).median


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*"):
        old.unlink()

    raw = []      # (sprite RGBA, meta)
    bgs = []
    for tif in sorted(IMG_DIR.glob("*.tif")):
        name = tif.stem
        m = NAME_RE.match(name)
        lbl = LBL_DIR / (name + ".txt")
        if not m or not lbl.exists():
            print("skip:", name)
            continue
        sp, tp, med, _ = m.groups()
        with Image.open(tif) as im:
            im = im.convert("RGB")
        W, H = im.size
        bgs.append(ImageStat.Stat(im.resize((W // 8, H // 8))).median)
        for cls, pts in read_polys(lbl, W, H):
            xs = [p[0] for p in pts]
            ys = [p[1] for p in pts]
            if min(xs) < 4 or min(ys) < 4 or max(xs) > W - 4 or max(ys) > H - 4:
                continue  # cut off by the frame edge: partial colony
            x0, y0 = max(0, int(min(xs) - PAD)), max(0, int(min(ys) - PAD))
            x1, y1 = min(W, int(max(xs) + PAD)), min(H, int(max(ys) + PAD))
            crop = im.crop((x0, y0, x1, y1))
            cw, ch = crop.size
            mask = Image.new("L", (cw, ch), 0)
            ImageDraw.Draw(mask).polygon([(x - x0, y - y0) for x, y in pts], fill=255)
            grown = mask.filter(ImageFilter.MaxFilter(HALO * 2 + 1))
            raw.append({
                "crop": crop, "mask": mask, "grown": grown,
                "pts": [(x - x0, y - y0) for x, y in pts],
                "cls": CLASSES.get(cls, str(cls)),
                "src": name, "species": SPECIES[sp],
                "time": float(tp) / 10 if len(tp) == 2 else float(tp),
                "medium": MEDIUM[med],
            })
        print(f"{name}: {sum(1 for r in raw if r['src'] == name)} colonies")

    # common background = median of every field's median
    bg = [sorted(c[i] for c in bgs)[len(bgs) // 2] for i in range(3)]

    sprites = []
    for r in raw:
        crop, cw, ch = r["crop"], *r["crop"].size
        # shift this crop's local background onto the common one
        local = border_median(crop, r["grown"])
        off = [bg[i] - local[i] for i in range(3)]
        bands = [b.point(lambda v, o=off[i]: max(0, min(255, int(v + o)))) for i, b in enumerate(crop.split())]
        crop = Image.merge("RGB", bands)
        alpha = r["grown"].filter(ImageFilter.GaussianBlur(FEATHER))
        s = min(SCALE, MAX_SPRITE / max(cw, ch))
        sw, sh = max(4, round(cw * s)), max(4, round(ch * s))
        rgba = crop.convert("RGBA")
        rgba.putalpha(alpha)
        rgba = rgba.resize((sw, sh), Image.LANCZOS)
        pts = simplify_closed(r["pts"], 0.7 / s)  # ~0.7 sprite px tolerance
        poly = [round(v, 3) for x, y in pts for v in (x / cw, y / ch)]
        sprites.append((rgba, {
            "c": r["cls"], "species": r["species"],
            "time": r["time"], "medium": r["medium"], "s": round(s / SCALE, 3), "p": poly,
        }))

    # shelf-pack into sheets, tallest first
    sprites.sort(key=lambda t: -t[0].size[1])
    sheets, items = [], []
    sheet = None
    x = y = shelf = 0
    G = 2  # gutter
    for rgba, meta in sprites:
        w, h = rgba.size
        if sheet is None or x + w > SHEET:
            x, y, shelf = 0, y + shelf + G, 0
        if sheet is None or y + h > SHEET:
            sheet = Image.new("RGBA", (SHEET, SHEET), (0, 0, 0, 0))
            sheets.append(sheet)
            x = y = shelf = 0
        sheet.paste(rgba, (x, y))
        meta.update({"k": len(sheets) - 1, "x": x, "y": y, "w": w, "h": h})
        items.append(meta)
        x += w + G
        shelf = max(shelf, h)

    names = []
    for i, sh in enumerate(sheets):
        bbox = sh.getbbox() or (0, 0, 1, 1)
        sh = sh.crop((0, 0, SHEET, bbox[3]))
        fn = f"sheet_{i}.webp"
        sh.save(OUT_DIR / fn, "WEBP", quality=WEBP_Q, method=6)
        names.append("assets/instances/" + fn)

    data = {"bg": [int(v) for v in bg], "scale": SCALE, "sheets": names, "items": items}
    js = ("// Generated by tools/build_instances.py, do not edit by hand.\n"
          "// Real colony cut-outs + YOLO-seg polygons (class: ecoli | salm).\n"
          "window.INSTANCES = " + json.dumps(data, separators=(",", ":")) + ";\n")
    OUT_JS.write_text(js)
    size = sum((OUT_DIR / Path(n).name).stat().st_size for n in names)
    print(f"\n{len(items)} colonies, {len(names)} sheets ({size // 1024} KB), "
          f"index {len(js) // 1024} KB, bg {data['bg']}")


if __name__ == "__main__":
    main()
