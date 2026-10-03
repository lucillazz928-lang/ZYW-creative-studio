# -*- coding: utf-8 -*-
import json
from pathlib import Path
from PIL import Image

src = Path(r"c:\Users\Lenovo\Desktop\个人作品集网站版\个人作品\平面作品")
dst = Path(r"c:\Users\Lenovo\Desktop\个人作品集网站版\public\works\graphics")
dst.mkdir(parents=True, exist_ok=True)

for old in dst.glob("*"):
    old.unlink()

files = sorted(
    [f for f in src.iterdir() if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}],
    key=lambda p: p.name,
)

# 可商素材底图不计入个人成稿
skip_names = {"可商素材丨金箔流星月亮装饰背景（最终）.png"}

meta = []
idx = 0
MAX = 1600

for f in files:
    if f.name in skip_names:
        print("SKIP", f.name)
        continue
    idx += 1
    im = Image.open(f)
    if im.mode in ("RGBA", "P", "LA"):
        im = im.convert("RGB")
    else:
        im = im.convert("RGB")
    w, h = im.size
    scale = min(1.0, MAX / max(w, h))
    if scale < 1:
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

    out_name = f"graphic-{idx:02d}.jpg"
    out = dst / out_name
    im.save(out, "JPEG", quality=85, optimize=True)

    title = f.stem
    for prefix in ("2313211117郑轶玟-", "231321117郑轶玟-"):
        if title.startswith(prefix):
            title = title[len(prefix) :]
    for ch in ("《", "》", '"', "\u201c", "\u201d"):
        title = title.replace(ch, "")
    title = title.replace(" (1)", "").replace(" (2)", " Ⅱ")

    meta.append(
        {
            "id": f"poster-{idx:02d}",
            "file": out_name,
            "title": title.strip(),
            "src": f.name,
            "size": out.stat().st_size,
            "wh": list(im.size),
        }
    )
    print(idx, out_name, title, im.size, out.stat().st_size)

(dst / "_meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
print("DONE", len(meta))
