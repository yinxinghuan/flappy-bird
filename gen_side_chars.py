"""Generate side-profile flying character images using ComfyUI, then remove backgrounds."""
import json
import urllib.request
import time
import os
import shutil
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

COMFYUI_URL = "http://127.0.0.1:8188"
OUTPUT_DIR = "/Users/yin/Desktop/flappy-bird/src/FlappyBird/img"
COMFYUI_OUTPUT = "/Users/yin/ComfyUI/output"

NEGATIVE = "worst quality, low quality, blurry, watermark, text, deformed, ugly, bad anatomy, extra limbs, realistic photo, photograph, front view, facing camera, portrait, looking at viewer"

CHARACTERS = [
    {
        "name": "guitarist_side",
        "prompt": "side profile view of a cute young boy with a guitar on his back, flying through the air with arms spread like wings, disney pixar 3d cartoon style, chibi proportions, big head small body, bright solid green #00FF00 background, full body visible, dynamic flying pose facing right",
        "seed": 42,
    },
    {
        "name": "coder_side",
        "prompt": "side profile view of a cute young woman with glasses holding a coffee cup, flying through the air with one arm stretched forward like superman, disney pixar 3d cartoon style, chibi proportions, big head small body, bright solid green #00FF00 background, full body visible, dynamic flying pose facing right",
        "seed": 88,
    },
    {
        "name": "hacker_side",
        "prompt": "side profile view of a middle-aged man with thick glasses and hoodie, flying through the air with arms spread, disney pixar 3d cartoon style, chibi proportions, big head small body, bright solid green #00FF00 background, full body visible, dynamic flying pose facing right",
        "seed": 123,
    },
    {
        "name": "ghost_side",
        "prompt": "side profile view of a cute friendly cartoon ghost with a playful expression, flying through the air with small arms spread, disney pixar 3d cartoon style, transparent-ish white body, bright solid green #00FF00 background, full body visible, dynamic flying pose facing right",
        "seed": 77,
    },
]


def build_prompt(positive, negative, width, height, seed, prefix):
    return {
        "1": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {"ckpt_name": "dreamshaperXL_lightningDPMSDE.safetensors"}
        },
        "2": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["1", 1], "text": positive}
        },
        "3": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["1", 1], "text": negative}
        },
        "4": {
            "class_type": "EmptyLatentImage",
            "inputs": {"batch_size": 1, "height": height, "width": width}
        },
        "5": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["1", 0],
                "positive": ["2", 0],
                "negative": ["3", 0],
                "latent_image": ["4", 0],
                "seed": seed,
                "steps": 6,
                "cfg": 2.0,
                "sampler_name": "dpmpp_sde",
                "scheduler": "karras",
                "denoise": 1.0,
            }
        },
        "6": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["5", 0], "vae": ["1", 2]}
        },
        "7": {
            "class_type": "SaveImage",
            "inputs": {"images": ["6", 0], "filename_prefix": prefix}
        }
    }


def queue_prompt(prompt):
    data = json.dumps({"prompt": prompt}).encode('utf-8')
    req = urllib.request.Request(f"{COMFYUI_URL}/prompt", data=data,
                                headers={"Content-Type": "application/json"})
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def wait_for_completion(prompt_id, timeout=120):
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = urllib.request.urlopen(f"{COMFYUI_URL}/history/{prompt_id}")
            history = json.loads(resp.read())
            if prompt_id in history:
                outputs = history[prompt_id].get("outputs", {})
                for node_id, node_output in outputs.items():
                    if "images" in node_output:
                        return node_output["images"]
        except Exception:
            pass
        time.sleep(1)
    return None


def remove_bg_floodfill(img_path, threshold=55):
    """Remove background via BFS flood-fill from border pixels."""
    img = Image.open(img_path).convert('RGBA')
    data = np.array(img, dtype=np.float32)
    h, w = data.shape[:2]

    # Sample background color from corner regions
    cs = 15
    corners = [
        data[:cs, :cs, :3],
        data[:cs, -cs:, :3],
        data[-cs:, :cs, :3],
        data[-cs:, -cs:, :3],
    ]
    corner_pixels = np.concatenate([c.reshape(-1, 3) for c in corners])
    bg_color = np.median(corner_pixels, axis=0)
    print(f"  Detected bg color: R={bg_color[0]:.0f} G={bg_color[1]:.0f} B={bg_color[2]:.0f}")

    # BFS flood fill from all border pixels
    visited = np.zeros((h, w), dtype=bool)
    bg_mask = np.zeros((h, w), dtype=bool)
    queue = deque()

    # Add all border pixels to queue
    for x in range(w):
        queue.append((0, x))
        queue.append((h - 1, x))
    for y in range(h):
        queue.append((y, 0))
        queue.append((y, w - 1))

    while queue:
        y, x = queue.popleft()
        if y < 0 or y >= h or x < 0 or x >= w:
            continue
        if visited[y, x]:
            continue
        visited[y, x] = True

        pixel = data[y, x, :3]
        diff = np.sqrt(np.sum((pixel - bg_color) ** 2))

        if diff < threshold:
            bg_mask[y, x] = True
            for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                    queue.append((ny, nx))

    # Apply mask
    result = data.copy()
    result[bg_mask, 3] = 0

    # Smooth edges
    alpha = Image.fromarray(result[:, :, 3].astype(np.uint8))
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=1))
    result[:, :, 3] = np.array(alpha)

    # Re-enforce fully transparent bg
    result[bg_mask, 3] = 0

    output = Image.fromarray(result.astype(np.uint8))
    output.save(img_path)
    print(f"  Background removed, saved: {img_path}")


# Generate all characters
for char in CHARACTERS:
    print(f"\n--- Generating: {char['name']} ---")
    prompt = build_prompt(
        char["prompt"], NEGATIVE,
        width=768, height=768,
        seed=char["seed"],
        prefix=char["name"]
    )

    result = queue_prompt(prompt)
    prompt_id = result["prompt_id"]
    print(f"  Queued: {prompt_id}")

    images = wait_for_completion(prompt_id)
    if images:
        for img_info in images:
            src = os.path.join(COMFYUI_OUTPUT, img_info["filename"])
            dst = os.path.join(OUTPUT_DIR, f"{char['name']}.png")
            shutil.copy2(src, dst)
            print(f"  Copied to: {dst}")

            # Remove background
            remove_bg_floodfill(dst)
    else:
        print(f"  FAILED: No output for {char['name']}")

print("\n=== All done! ===")
