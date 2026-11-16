"""
Temporal noise of a rotation sequence: how far each frame is from the average of its two neighbours.
A smooth turn gives small, spatially smooth residuals; z-fighting / texture shimmer gives speckle.
  python scripts/showcase/flicker.py <dir> [<dir> ...]
Pillow only. Counts only pixels that are part of the box (brighter than the dark stage).
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


def analyse(folder):
    files = sorted(Path(folder).glob("f*.png"))
    frames = [Image.open(f).convert("L") for f in files]
    if len(frames) < 3:
        return None
    total_pixels = 0
    noisy = 0
    sum_res = 0.0
    for i in range(1, len(frames) - 1):
        neighbour_avg = Image.blend(frames[i - 1], frames[i + 1], 0.5)
        res = ImageChops.difference(frames[i], neighbour_avg)
        mask = frames[i].point(lambda v: 255 if v > 60 else 0)
        count = ImageStat.Stat(mask).sum[0] / 255
        if not count:
            continue
        hot = res.point(lambda v: 255 if v > 28 else 0)
        hot_in_box = ImageChops.multiply(hot, mask)
        noisy += ImageStat.Stat(hot_in_box).sum[0] / 255
        masked_res = ImageChops.multiply(res, mask.point(lambda v: 1 if v else 0))
        sum_res += ImageStat.Stat(masked_res).sum[0]
        total_pixels += count
    return {
        "frames": len(frames),
        "mean_residual": round(sum_res / total_pixels, 3),
        "noisy_pixels_pct": round(noisy / total_pixels * 100, 3),
        "box_pixels_per_frame": int(total_pixels / (len(frames) - 2)),
    }


for folder in sys.argv[1:]:
    print(Path(folder).name, analyse(folder))
