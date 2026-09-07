#!/usr/bin/env python3
"""Paint a path-aligned battlefield and two missing tower sprites."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path("/workspace/public/game")
W, H = 1280, 720
CELL = 80
WAYPOINTS = [
    (0.5 * CELL, 1.5 * CELL),
    (11.5 * CELL, 1.5 * CELL),
    (11.5 * CELL, 4.5 * CELL),
    (3.5 * CELL, 4.5 * CELL),
    (3.5 * CELL, 7.5 * CELL),
    (15.5 * CELL, 7.5 * CELL),
]


def hash2(x: int, y: int, seed: int = 17) -> float:
    n = (x * 374761393 + y * 668265263 + seed * 1274126177) & 0xFFFFFFFF
    n = (n ^ (n >> 13)) * 1274126177
    return ((n ^ (n >> 16)) & 0xFFFFFFFF) / 4294967295.0


def value_noise(w: int, h: int, scale: float, seed: int) -> np.ndarray:
    gw = int(w / scale) + 3
    gh = int(h / scale) + 3
    grid = np.zeros((gh, gw), dtype=np.float32)
    for y in range(gh):
        for x in range(gw):
            grid[y, x] = hash2(x, y, seed)
    ys = np.linspace(0, gh - 2, h)
    xs = np.linspace(0, gw - 2, w)
    y0 = np.floor(ys).astype(int)
    x0 = np.floor(xs).astype(int)
    fy = (ys - y0)[:, None]
    fx = (x0 * 0 + (xs - x0))[None, :]
    # smoothstep
    fy = fy * fy * (3 - 2 * fy)
    fx = fx * fx * (3 - 2 * fx)
    y1 = y0 + 1
    x1 = x0 + 1
    n00 = grid[y0[:, None], x0[None, :]]
    n10 = grid[y0[:, None], x1[None, :]]
    n01 = grid[y1[:, None], x0[None, :]]
    n11 = grid[y1[:, None], x1[None, :]]
    return n00 * (1 - fx) * (1 - fy) + n10 * fx * (1 - fy) + n01 * (1 - fx) * fy + n11 * fx * fy


def fbm(w: int, h: int, seed: int) -> np.ndarray:
    n = value_noise(w, h, 96, seed) * 0.5
    n += value_noise(w, h, 48, seed + 3) * 0.28
    n += value_noise(w, h, 22, seed + 7) * 0.14
    n += value_noise(w, h, 10, seed + 11) * 0.08
    return n


def resample_path(pts: list[tuple[float, float]], spacing: float = 2.0) -> np.ndarray:
    out = [pts[0]]
    for i in range(1, len(pts)):
        x0, y0 = pts[i - 1]
        x1, y1 = pts[i]
        d = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5
        steps = max(1, int(d / spacing))
        for s in range(1, steps + 1):
            t = s / steps
            out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
    return np.array(out, dtype=np.float32)


def stamp_disk(alpha: np.ndarray, cx: float, cy: float, radius: float, strength: float = 1.0) -> None:
    h, w = alpha.shape
    x0 = max(0, int(cx - radius - 1))
    x1 = min(w, int(cx + radius + 2))
    y0 = max(0, int(cy - radius - 1))
    y1 = min(h, int(cy + radius + 2))
    if x1 <= x0 or y1 <= y0:
        return
    yy, xx = np.ogrid[y0:y1, x0:x1]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    a = np.clip((radius - dist) / max(1.4, radius * 0.22), 0, 1) * strength
    patch = alpha[y0:y1, x0:x1]
    np.maximum(patch, a, out=patch)


def paint_map() -> Image.Image:
    n = fbm(W, H, 19)
    n2 = fbm(W, H, 41)
    grass_a = np.array([62, 74, 52], dtype=np.float32)
    grass_b = np.array([44, 54, 42], dtype=np.float32)
    moss = np.array([36, 48, 40], dtype=np.float32)
    stone = np.array([78, 80, 76], dtype=np.float32)
    t = n[:, :, None]
    rgb = grass_a * (1 - t) + grass_b * t
    rgb = rgb * (0.88 + 0.22 * n2[:, :, None])
    # moss patches
    moss_m = (n > 0.62) & (n2 < 0.45)
    rgb[moss_m] = rgb[moss_m] * 0.45 + moss * 0.55
    # cool stone speckle
    speckle = (n2 > 0.78) & (n < 0.4)
    rgb[speckle] = rgb[speckle] * 0.55 + stone * 0.45

    path = resample_path(WAYPOINTS, 2.0)
    road = np.zeros((H, W), dtype=np.float32)
    edge = np.zeros((H, W), dtype=np.float32)
    for x, y in path:
        stamp_disk(road, x, y, 30.0, 1.0)
        stamp_disk(edge, x, y, 36.0, 0.7)
    dirt = np.array([92, 70, 48], dtype=np.float32)
    dirt_d = np.array([64, 48, 34], dtype=np.float32)
    rut = np.array([110, 88, 62], dtype=np.float32)
    e = edge[:, :, None]
    rgb = rgb * (1 - e * 0.55) + dirt_d * (e * 0.55)
    r = road[:, :, None]
    variation = 0.85 + 0.25 * n[:, :, None]
    dirt_col = (dirt * variation + rut * (1 - variation) * 0.35)
    rgb = rgb * (1 - r) + dirt_col * r

    # ruts: two offset thinner lines
    ruts = np.zeros((H, W), dtype=np.float32)
    for i, (x, y) in enumerate(path[2:-2]):
        prev = path[i]
        dx, dy = x - prev[0], y - prev[1]
        l = (dx * dx + dy * dy) ** 0.5 + 1e-6
        nx, ny = -dy / l, dx / l
        stamp_disk(ruts, x + nx * 6, y + ny * 6, 3.2, 0.85)
        stamp_disk(ruts, x - nx * 6, y - ny * 6, 3.2, 0.85)
    rgb = rgb * (1 - ruts[:, :, None] * 0.35) + dirt_d * (ruts[:, :, None] * 0.35)

    # plaza
    px, py = WAYPOINTS[-1]
    plaza = np.zeros((H, W), dtype=np.float32)
    stamp_disk(plaza, px, py, 52, 1.0)
    stone_col = np.array([118, 116, 108], dtype=np.float32)
    rgb = rgb * (1 - plaza[:, :, None] * 0.92) + stone_col * (plaza[:, :, None] * 0.92)
    ring = np.zeros((H, W), dtype=np.float32)
    stamp_disk(ring, px, py, 54, 1.0)
    stamp_disk(ring, px, py, 46, -1.0)  # will clip below
    ring = np.clip(ring, 0, 1)
    # redo ring properly
    yy, xx = np.ogrid[:H, :W]
    d = np.sqrt((xx - px) ** 2 + (yy - py) ** 2)
    ring = np.clip(1 - np.abs(d - 48) / 4.5, 0, 1)
    rgb = rgb * (1 - ring[:, :, None] * 0.5) + np.array([88, 86, 80]) * (ring[:, :, None] * 0.5)

    # spawn discoloration
    sx, sy = WAYPOINTS[0]
    rift = np.zeros((H, W), dtype=np.float32)
    stamp_disk(rift, sx - 10, sy, 44, 1.0)
    ember = np.array([70, 42, 36], dtype=np.float32)
    rgb = rgb * (1 - rift[:, :, None] * 0.45) + ember * (rift[:, :, None] * 0.45)

    # vignette
    vy = ((np.arange(H) / H - 0.5) ** 2)[:, None]
    vx = ((np.arange(W) / W - 0.5) ** 2)[None, :]
    vig = np.clip(1.0 - 0.55 * (vx * 1.4 + vy * 1.8), 0.55, 1.0)
    rgb *= vig[:, :, None]

    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    return Image.fromarray(rgb, "RGB")


def shade_ellipse(draw: ImageDraw.ImageDraw, box, fill, outline=None, width=1):
    draw.ellipse(box, fill=fill, outline=outline, width=width)


def paint_sentry() -> Image.Image:
    im = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, foot = 256, 470
    # shadow
    d.ellipse((cx - 92, foot - 18, cx + 92, foot + 16), fill=(20, 18, 14, 90))
    # posts
    wood = [(86, 64, 42), (110, 84, 54), (64, 48, 32), (132, 102, 70)]
    posts = [(-70, 18), (-40, 8), (40, 8), (70, 18), (-16, 4), (16, 4)]
    for i, (ox, oz) in enumerate(posts):
        top = foot - 150 + oz
        col = wood[i % len(wood)]
        d.rectangle((cx + ox - 10, top, cx + ox + 10, foot - 8), fill=col)
        d.polygon(
            [(cx + ox - 10, top), (cx + ox + 6, top - 10), (cx + ox + 10, top), (cx + ox - 6, top + 8)],
            fill=tuple(min(255, c + 24) for c in col),
        )
    # platform
    d.polygon(
        [(cx - 88, foot - 158), (cx + 88, foot - 158), (cx + 104, foot - 132), (cx - 104, foot - 132)],
        fill=(96, 72, 48),
    )
    d.polygon(
        [(cx - 104, foot - 132), (cx + 104, foot - 132), (cx + 104, foot - 118), (cx - 104, foot - 118)],
        fill=(72, 54, 36),
    )
    # palisade
    for i, x in enumerate(range(cx - 80, cx + 84, 18)):
        h = 46 + (i % 3) * 8
        d.rectangle((x, foot - 158 - h, x + 14, foot - 150), fill=(78, 58, 38))
        d.polygon([(x, foot - 158 - h), (x + 7, foot - 158 - h - 12), (x + 14, foot - 158 - h)], fill=(92, 70, 46))
    # crossbow
    d.rectangle((cx - 8, foot - 268, cx + 8, foot - 170), fill=(42, 44, 48))
    d.polygon([(cx - 8, foot - 268), (cx + 8, foot - 268), (cx + 70, foot - 250), (cx + 62, foot - 236)], fill=(36, 38, 42))
    d.arc((cx + 36, foot - 292, cx + 118, foot - 214), 200, 340, fill=(28, 30, 34), width=8)
    d.line((cx + 8, foot - 250, cx + 78, foot - 228), fill=(20, 20, 22), width=3)
    # moss
    rng = np.random.default_rng(4)
    pix = np.array(im)
    for _ in range(80):
        x = int(rng.integers(cx - 90, cx + 90))
        y = int(rng.integers(foot - 220, foot - 20))
        if 0 <= x < 512 and 0 <= y < 512 and pix[y, x, 3] > 20:
            d.ellipse((x - 3, y - 2, x + 3, y + 2), fill=(58, 78, 54, 160))
    return im.filter(ImageFilter.SMOOTH)


def paint_mortar() -> Image.Image:
    im = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, foot = 256, 470
    d.ellipse((cx - 100, foot - 20, cx + 100, foot + 18), fill=(20, 18, 14, 90))
    # stone body
    d.ellipse((cx - 110, foot - 70, cx + 110, foot - 8), fill=(92, 90, 84))
    d.rectangle((cx - 96, foot - 210, cx + 96, foot - 40), fill=(108, 106, 98))
    d.polygon(
        [(cx - 96, foot - 210), (cx + 96, foot - 210), (cx + 78, foot - 250), (cx - 78, foot - 250)],
        fill=(124, 122, 112),
    )
    # blocks
    for y in range(foot - 200, foot - 50, 28):
        d.line((cx - 94, y, cx + 94, y), fill=(86, 84, 78), width=2)
    for x in range(cx - 70, cx + 80, 48):
        d.line((x, foot - 200, x, foot - 50), fill=(86, 84, 78), width=2)
    # copper bowl
    d.ellipse((cx - 72, foot - 292, cx + 72, foot - 228), fill=(164, 96, 58))
    d.ellipse((cx - 58, foot - 286, cx + 58, foot - 242), fill=(72, 32, 22))
    d.ellipse((cx - 28, foot - 274, cx + 20, foot - 250), fill=(220, 110, 64, 200))
    d.ellipse((cx - 12, foot - 268, cx + 8, foot - 254), fill=(255, 196, 120, 180))
    # moss
    rng = np.random.default_rng(9)
    for _ in range(60):
        x = int(rng.integers(cx - 90, cx + 90))
        y = int(rng.integers(foot - 200, foot - 20))
        d.ellipse((x - 4, y - 2, x + 4, y + 2), fill=(64, 82, 58, 150))
    return im.filter(ImageFilter.SMOOTH)


def main() -> None:
    (OUT / "map").mkdir(parents=True, exist_ok=True)
    (OUT / "towers").mkdir(parents=True, exist_ok=True)
    m = paint_map()
    m.save(OUT / "map" / "foundation.png", "PNG")
    print("map", m.size)
    s = paint_sentry()
    s.save(OUT / "towers" / "sentry.png", "PNG")
    print("sentry", s.size)
    t = paint_mortar()
    t.save(OUT / "towers" / "mortar.png", "PNG")
    print("mortar", t.size)


if __name__ == "__main__":
    main()
