import hashlib
import json
import os
import pathlib
import shutil
import subprocess

from PIL import Image


ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "workers"
SOURCE_DIR = pathlib.Path(os.environ.get("WORKER_POSE_SOURCE_DIR", ROOT / "source-worker-poses"))

POSES = {
    "idle": ["Idle Pose.png"] * 4,
    "walking": [
        "Walking 1 Pose.png",
        "Walking 2 Pose.png",
        "Walking 1 Pose.png",
        "Walking 2 Pose.png",
    ],
    "working": [
        "Working 1 Pose.png",
        "Working 2 Pose.png",
        "Working 1 Pose.png",
        "Working 2 Pose.png",
    ],
    "waiting": ["Waiting Pose.png"] * 4,
    "angry": ["Irate Pose.png"] * 4,
}

ROW_NAMES = ["idle", "walking", "working", "waiting", "angry"]
CELL_W = 260
CELL_H = 380
SUBJECT_ALPHA = 20
SKIN_TONES = [
    (239, 178, 128),
    (204, 135, 86),
    (160, 96, 64),
    (124, 74, 52),
    (226, 153, 104),
    (184, 113, 74),
]


def project_trade_colors():
    script = """
import('./src/gameConfig.js').then(({PROJECTS}) => {
  const seen = new Map();
  for (const project of PROJECTS) {
    for (const trade of project.trades) {
      if (!seen.has(trade.key)) seen.set(trade.key, trade.color);
    }
  }
  console.log(JSON.stringify(Object.fromEntries(seen)));
});
"""
    output = subprocess.check_output(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        text=True,
    )
    return json.loads(output)


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def keyed_index(key, count):
    return int(hashlib.sha1(key.encode()).hexdigest()[:8], 16) % count


def threshold_bbox(image, threshold=SUBJECT_ALPHA):
    alpha = image.getchannel("A")
    mask = alpha.point(lambda px: 255 if px > threshold else 0)
    return mask.getbbox()


def recolor_pose(image, trade_color, skin_tone):
    rgba = image.copy().convert("RGBA")
    pixels = rgba.load()
    bbox = threshold_bbox(rgba) or (0, 0, rgba.width, rgba.height)
    left, top, right, bottom = bbox
    subject_h = bottom - top

    for y in range(top, bottom):
        y_ratio = (y - top) / max(1, subject_h)
        for x in range(left, right):
            r, g, b, a = pixels[x, y]
            if a <= SUBJECT_ALPHA:
                pixels[x, y] = (r, g, b, 0)
                continue

            lum = 0.299 * r + 0.587 * g + 0.114 * b
            neutral = max(r, g, b) - min(r, g, b) < 62
            helmet_zone = y_ratio < 0.24 and neutral and 78 < lum < 248
            if helmet_zone:
                shade = max(0.28, min(1.28, lum / 185))
                nr = int(max(0, min(255, trade_color[0] * shade)))
                ng = int(max(0, min(255, trade_color[1] * shade)))
                nb = int(max(0, min(255, trade_color[2] * shade)))
                highlight = max(0, min(0.38, (lum - 170) / 210))
                nr = int(nr * (1 - highlight) + 245 * highlight)
                ng = int(ng * (1 - highlight) + 245 * highlight)
                nb = int(nb * (1 - highlight) + 245 * highlight)
                pixels[x, y] = (nr, ng, nb, a)
                continue

            skin = (
                r > 95
                and g > 45
                and b < 165
                and r > g * 1.04
                and g > b * 1.08
                and not (r > 190 and g > 175 and b < 80)
            )
            if skin:
                shade = max(0.45, min(1.25, lum / 156))
                tr, tg, tb = skin_tone
                pixels[x, y] = (
                    int(r * 0.48 + min(255, tr * shade) * 0.52),
                    int(g * 0.48 + min(255, tg * shade) * 0.52),
                    int(b * 0.48 + min(255, tb * shade) * 0.52),
                    a,
                )

    return rgba


def fit_to_cell(image):
    bbox = threshold_bbox(image) or image.getbbox()
    if not bbox:
        return Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))

    pad = 24
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(image.width, right + pad)
    bottom = min(image.height, bottom + pad)
    crop = image.crop((left, top, right, bottom))
    scale = min((CELL_W - 16) / crop.width, (CELL_H - 14) / crop.height)
    crop = crop.resize(
        (max(1, round(crop.width * scale)), max(1, round(crop.height * scale))),
        Image.Resampling.LANCZOS,
    )
    cell = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
    cell.alpha_composite(crop, ((CELL_W - crop.width) // 2, CELL_H - crop.height - 4))
    return cell


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    colors = project_trade_colors()
    source_cache = {
        name: Image.open(SOURCE_DIR / name).convert("RGBA")
        for row in POSES.values()
        for name in row
    }

    for key, color in colors.items():
        trade_color = hex_to_rgb(color)
        skin_tone = SKIN_TONES[keyed_index(key, len(SKIN_TONES))]
        sheet = Image.new("RGBA", (CELL_W * 4, CELL_H * len(ROW_NAMES)), (0, 0, 0, 0))

        for row_index, row_name in enumerate(ROW_NAMES):
            for column, pose_name in enumerate(POSES[row_name]):
                frame = recolor_pose(source_cache[pose_name], trade_color, skin_tone)
                sheet.alpha_composite(
                    fit_to_cell(frame),
                    (column * CELL_W, row_index * CELL_H),
                )

        sheet.save(OUT / f"{key}.png", optimize=True)

    if "framing" in colors:
        shutil.copyfile(OUT / "framing.png", OUT / "generic.png")

    print(f"Generated {len(colors)} trade worker sheets in {OUT}")


if __name__ == "__main__":
    main()
