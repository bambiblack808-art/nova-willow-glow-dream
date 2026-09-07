#!/usr/bin/env python3
"""Purify JPEG magenta, chroma-key, crop, and emit engine-ready PNGs."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

RAW = Path("/workspace/assets/raw")
OUT = Path("/workspace/public/game")
SPR = Path("/workspace/assets/sprites")
PROC = Path("/workspace/.grok/skills/generate2dsprite/scripts/generate2dsprite.py")


def purify_magenta(im: Image.Image) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)
    # JPEG magenta is noisy: high R, low G, high B
    mag = (r > 150) & (g < 110) & (b > 150) & ((r.astype(np.int32) + b) > g * 3 + 40)
    arr[mag, 0] = 255
    arr[mag, 1] = 0
    arr[mag, 2] = 255
    arr[mag, 3] = 255
    return Image.fromarray(arr)


def chroma_key(im: Image.Image, t: int = 55) -> Image.Image:
    arr = np.array(im.convert("RGBA"))
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)
    dist = np.sqrt((r - 255) ** 2 + (g - 0) ** 2 + (b - 255) ** 2)
    mag = (dist < t * 2.2) | ((r > 170) & (g < 90) & (b > 170))
    # Soft edge
    alpha = arr[:, :, 3].astype(np.float32)
    fade = np.clip((dist - 40) / 70, 0, 1)
    alpha = np.where(mag, alpha * fade, alpha)
    arr[:, :, 3] = alpha.astype(np.uint8)
    arr[mag & (dist < 48), 3] = 0
    return Image.fromarray(arr)


def crop_alpha(im: Image.Image, pad: int = 8) -> Image.Image:
    arr = np.array(im)
    a = arr[:, :, 3]
    ys, xs = np.where(a > 12)
    if len(xs) == 0:
        return im
    x0, x1 = max(0, xs.min() - pad), min(im.width, xs.max() + pad + 1)
    y0, y1 = max(0, ys.min() - pad), min(im.height, ys.max() + pad + 1)
    return im.crop((x0, y0, x1, y1))


def save_single(src: Path, dest: Path) -> None:
    im = purify_magenta(Image.open(src))
    im = chroma_key(im)
    im = crop_alpha(im, pad=10)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "PNG")
    print(f"single {src.name} -> {dest} {im.size}")


def split_2x2(src: Path, dest: Path, size: int = 256) -> None:
    im = purify_magenta(Image.open(src))
    im = chroma_key(im)
    w, h = im.size
    cw, ch = w // 2, h // 2
    frames = []
    for row in range(2):
        for col in range(2):
            cell = im.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch))
            cell = crop_alpha(cell, pad=6)
            # Fit into size x size keeping aspect, bottom-aligned
            cell.thumbnail((size - 12, size - 12), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            x = (size - cell.width) // 2
            y = size - cell.height - 4
            canvas.paste(cell, (x, y), cell)
            frames.append(canvas)
    sheet = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
    for i, fr in enumerate(frames):
        sheet.paste(fr, ((i % 2) * size, (i // 2) * size), fr)
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest, "PNG")
    print(f"sheet {src.name} -> {dest} {sheet.size}")


def main() -> None:
    save_single(RAW / "frost.jpg", OUT / "towers" / "frost.png")
    save_single(RAW / "lance.jpg", OUT / "towers" / "lance.png")
    save_single(RAW / "gate.jpg", OUT / "props" / "gate.png")

    split_2x2(RAW / "mite.jpg", OUT / "creeps" / "mite.png")
    split_2x2(RAW / "runner.jpg", OUT / "creeps" / "runner.png")
    split_2x2(RAW / "brute.jpg", OUT / "creeps" / "brute.png")
    split_2x2(RAW / "boss.jpg", OUT / "creeps" / "boss.png")

    # Gate was accidentally a 2x2; also emit a cropped single of the largest cell
    gate_sheet = Image.open(OUT / "props" / "gate.png")
    # If gate.png is a full keyed image of 4 gates, split and take top-left
    g = purify_magenta(Image.open(RAW / "gate.jpg"))
    g = chroma_key(g)
    w, h = g.size
    cell = g.crop((0, 0, w // 2, h // 2))
    cell = crop_alpha(cell, pad=8)
    cell.save(OUT / "props" / "gate.png", "PNG")
    print("gate cell", cell.size)


if __name__ == "__main__":
    main()
