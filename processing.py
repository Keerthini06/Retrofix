"""Traditional image processing functions used by RetroFix."""

import cv2
import numpy as np
from PIL import Image


def preprocess_image(image: Image.Image, max_dimension: int = 1600) -> tuple[np.ndarray, np.ndarray]:
    """Return resized original RGB pixels and an RGB → LAB → RGB preview."""
    original = np.asarray(image.convert("RGB"))
    height, width = original.shape[:2]
    scale = min(1.0, max_dimension / max(height, width))
    if scale < 1.0:
        new_size = (round(width * scale), round(height * scale))
        original = cv2.resize(original, new_size, interpolation=cv2.INTER_AREA)

    lab = cv2.cvtColor(original, cv2.COLOR_RGB2LAB)
    preprocessed = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    return original, preprocessed


def restore_image(
    image_rgb: np.ndarray,
    use_median: bool = True,
    median_kernel: int = 3,
    damage_mask: np.ndarray | None = None,
    inpaint_radius: int = 6,
    use_clahe: bool = True,
    clip_limit: float = 2.0,
    use_sharpen: bool = True,
    sharpen_amount: float = 0.8,
) -> tuple[np.ndarray, list[str]]:
    """Apply selected operations in the order noise removal, repair, enhancement."""
    result = image_rgb.copy()
    applied = []

    if use_median:
        if median_kernel not in (3, 5, 7):
            raise ValueError("Median kernel must be 3, 5, or 7.")
        result = cv2.medianBlur(result, median_kernel)
        applied.append(f"Median filter ({median_kernel}×{median_kernel})")

    if damage_mask is not None and np.any(damage_mask):
        if not 1 <= inpaint_radius <= 20:
            raise ValueError("Inpainting radius must be between 1 and 20.")
        mask = cv2.resize(damage_mask, (result.shape[1], result.shape[0]), interpolation=cv2.INTER_NEAREST)
        mask = cv2.dilate(mask, np.ones((3, 3), dtype=np.uint8), iterations=1)
        result = cv2.inpaint(result, mask, inpaint_radius, cv2.INPAINT_TELEA)
        applied.append(f"Scratch repair (Telea inpainting, radius {inpaint_radius})")

    if use_clahe:
        lab = cv2.cvtColor(result, cv2.COLOR_RGB2LAB)
        lightness, channel_a, channel_b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
        lightness = clahe.apply(lightness)
        result = cv2.cvtColor(cv2.merge((lightness, channel_a, channel_b)), cv2.COLOR_LAB2RGB)
        applied.append(f"CLAHE contrast (clip limit {clip_limit:.1f})")

    if use_sharpen:
        blurred = cv2.GaussianBlur(result, (0, 0), sigmaX=1.0)
        result = cv2.addWeighted(result, 1.0 + sharpen_amount, blurred, -sharpen_amount, 0)
        applied.append(f"Unsharp mask (strength {sharpen_amount:.1f})")

    return result, applied


