# -*- coding: utf-8 -*-
import os
import cv2
from pathlib import Path

root = Path('public') / 'works' / 'videos'
out = root / 'posters'
out.mkdir(parents=True, exist_ok=True)

# Match by relative path fragments (Unicode in source file)
wanted_rules = [
    ('haoxi', ['广告片']),
    ('qingmi', ['影视混剪', '情迷']),
    ('yuluan', ['影视混剪', '狱乱']),
    ('apr3', ['影视混剪', '4月3']),
    ('dinggao', ['社团宣传片']),
    ('hotel', ['营销号', '酒店']),
    ('jul12', ['营销号', '7月12']),
]

mp4s = []
for dirpath, _, filenames in os.walk(root):
    for name in filenames:
        if name.lower().endswith('.mp4'):
            mp4s.append(Path(dirpath) / name)

wanted = {}
for cid, parts in wanted_rules:
    hit = None
    for p in mp4s:
        s = str(p).replace('\\', '/')
        if all(part in s for part in parts):
            hit = p
            break
    if hit is None and len(parts) == 1:
        folder = parts[0]
        folder_hits = [p for p in mp4s if folder in str(p).replace('\\', '/')]
        if len(folder_hits) == 1:
            hit = folder_hits[0]
    wanted[cid] = hit

print('resolved:')
for k, v in wanted.items():
    print(' ', k, '->', v)


def mean_brightness(frame):
    return float(frame.mean())


def grab(cap, frame_idx):
    cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, int(frame_idx)))
    ok, frame = cap.read()
    return frame if ok else None


# Prefer theme-forward mid shots; fall back if too dark/bright
prefer = {
    'haoxi': 'p12',
    'qingmi': 'p12',
    'yuluan': 'p28',
    'apr3': 'p28',
    'dinggao': 'p45',
    'hotel': 'p28',
    'jul12': 'p28',
}

chosen = {}
for cid, path in wanted.items():
    if path is None or not path.exists():
        print('MISSING', cid)
        continue
    cap = cv2.VideoCapture(str(path.resolve()))
    if not cap.isOpened():
        print('FAIL_OPEN', cid, path)
        continue
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    first_good = None
    scan_n = min(n, int(fps * 3) + 1)
    step = max(1, int(fps // 4) or 1)
    for i in range(0, scan_n, step):
        fr = grab(cap, i)
        if fr is not None and mean_brightness(fr) > 28:
            first_good = i
            break
    if first_good is None:
        first_good = min(int(fps * 0.5), max(0, n - 1))

    candidates = {
        'start': first_good,
        'p12': min(int(n * 0.12), max(0, n - 1)),
        'p28': min(int(n * 0.28), max(0, n - 1)),
        'p45': min(int(n * 0.45), max(0, n - 1)),
    }

    frames = {}
    for label, fi in candidates.items():
        fr = grab(cap, fi)
        if fr is None:
            continue
        b = mean_brightness(fr)
        h, w = fr.shape[:2]
        scale = 1280 / max(w, h)
        save = fr
        if scale < 1:
            save = cv2.resize(fr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        fp = out / f'{cid}_{label}.jpg'
        ok = cv2.imwrite(str(fp), save, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
        frames[label] = (save, b)
        print(f'  {cid} {label} ok={ok} bright={b:.1f} bytes={fp.stat().st_size if fp.exists() else 0}')

    label = prefer.get(cid, 'start')
    if label not in frames or frames[label][1] < 15 or frames[label][1] > 245:
        label = min(frames.keys(), key=lambda k: abs(frames[k][1] - 90))

    final = out / f'{cid}.jpg'
    ok = cv2.imwrite(str(final), frames[label][0], [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    chosen[cid] = label
    print(f'CHOSEN {cid}={label} final_ok={ok} size={final.stat().st_size if final.exists() else 0}')
    cap.release()

print('OUT:')
for p in sorted(out.glob('*.jpg')):
    print(' ', p.name, p.stat().st_size)
print('chosen', chosen)
