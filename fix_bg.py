"""Aggressive background removal for side-profile characters."""
import numpy as np
from PIL import Image, ImageFilter
from collections import deque
import os

IMG_DIR = "/Users/yin/Desktop/flappy-bird/src/FlappyBird/img"
FILES = ["guitarist_side.png", "coder_side.png", "hacker_side.png", "ghost_side.png"]


def remove_bg(img_path, threshold=65):
    """Aggressive BFS flood-fill from borders with higher threshold."""
    print(f"Processing {os.path.basename(img_path)}...")
    img = Image.open(img_path).convert('RGBA')
    data = np.array(img, dtype=np.float32)
    h, w = data.shape[:2]

    # Sample bg from corners
    cs = 20
    corners = [
        data[:cs, :cs, :3],
        data[:cs, -cs:, :3],
        data[-cs:, :cs, :3],
        data[-cs:, -cs:, :3],
    ]
    corner_pixels = np.concatenate([c.reshape(-1, 3) for c in corners])
    bg_color = np.median(corner_pixels, axis=0)
    print(f"  BG color: R={bg_color[0]:.0f} G={bg_color[1]:.0f} B={bg_color[2]:.0f}")

    # Also detect green-ish pixels (from green screen)
    is_greenish = (data[:, :, 1] > data[:, :, 0] + 15) & (data[:, :, 1] > data[:, :, 2] + 15)

    visited = np.zeros((h, w), dtype=bool)
    bg_mask = np.zeros((h, w), dtype=bool)
    queue = deque()

    for x in range(w):
        queue.append((0, x))
        queue.append((h - 1, x))
    for y in range(h):
        queue.append((y, 0))
        queue.append((y, w - 1))

    while queue:
        y, x = queue.popleft()
        if y < 0 or y >= h or x < 0 or x >= w or visited[y, x]:
            continue
        visited[y, x] = True

        pixel = data[y, x, :3]
        diff = np.sqrt(np.sum((pixel - bg_color) ** 2))

        # Mark as background if close to bg color OR greenish
        if diff < threshold or (is_greenish[y, x] and diff < threshold * 1.5):
            bg_mask[y, x] = True
            for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                    queue.append((ny, nx))

    # Also remove any remaining green-tinted pixels at edges
    # Dilate bg_mask slightly to catch fringe
    from scipy.ndimage import binary_dilation
    fringe = binary_dilation(bg_mask, iterations=2) & ~bg_mask
    for y, x in zip(*np.where(fringe)):
        pixel = data[y, x, :3]
        if is_greenish[y, x]:
            bg_mask[y, x] = True

    result = data.copy()
    result[bg_mask, 3] = 0

    # Anti-alias edges
    alpha = Image.fromarray(result[:, :, 3].astype(np.uint8))
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.8))
    alpha_arr = np.array(alpha, dtype=np.float32)
    # Keep fully transparent pixels as 0
    alpha_arr[bg_mask] = 0
    result[:, :, 3] = alpha_arr

    output = Image.fromarray(result.astype(np.uint8))
    output.save(img_path)
    print(f"  Saved: {img_path}")


for f in FILES:
    path = os.path.join(IMG_DIR, f)
    if os.path.exists(path):
        remove_bg(path)

print("\nDone!")
