from pathlib import Path
import sys
import warnings

from PIL import Image, ImageChops, ImageMath

warnings.filterwarnings("ignore", category=DeprecationWarning, module="PIL.ImageMath")


def cutout(src_path, out_path, background):
    img = Image.open(src_path).convert("RGBA")
    img.thumbnail((256, 256), Image.Resampling.LANCZOS)
    r, g, b, a = img.split()

    if background == "green":
        max_rb = ImageChops.lighter(r, b)
        delta = ImageChops.subtract(g, max_rb)
        mask = ImageMath.eval(
            "convert((delta > 10) & (g > 68) & (r < 155) & (b < 155), 'L') * 255",
            delta=delta,
            g=g,
            r=r,
            b=b,
        ).convert("L")
    elif background == "white":
        mask = ImageMath.eval(
            "convert((r > 248) & (g > 248) & (b > 248), 'L') * 255",
            r=r,
            g=g,
            b=b,
        ).convert("L")
    else:
        raise ValueError(f"Unsupported background kind: {background}")

    img.putalpha(ImageChops.subtract(a, mask))
    bbox = img.getbbox()
    if bbox:
        pad = 4
        width, height = img.size
        img = img.crop(
            (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(width, bbox[2] + pad),
                min(height, bbox[3] + pad),
            ),
        )

    canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    img.thumbnail((246, 246), Image.Resampling.LANCZOS)
    canvas.alpha_composite(img, ((256 - img.width) // 2, (256 - img.height) // 2))
    canvas.save(out_path, optimize=True)


if __name__ == "__main__":
    cutout(Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3])
