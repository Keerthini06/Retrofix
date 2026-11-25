import base64
from io import BytesIO

import numpy as np
from flask import Flask, jsonify, render_template, request
from PIL import Image, UnidentifiedImageError

from processing import preprocess_image, restore_image

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG", "PNG"}


def image_data_url(pixels: np.ndarray) -> str:
    """Encode RGB pixels as a browser-friendly JPEG data URL."""
    buffer = BytesIO()
    Image.fromarray(pixels).save(buffer, format="JPEG", quality=92)
    return "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


def read_uploaded_image() -> Image.Image:
    """Read and validate the uploaded JPG or PNG without saving it to disk."""
    uploaded = request.files.get("photo")
    if uploaded is None or not uploaded.filename:
        raise ValueError("Choose a photograph first.")
    try:
        image = Image.open(uploaded.stream)
        if image.format not in ALLOWED_FORMATS:
            raise ValueError("Please upload a JPG, JPEG, or PNG image.")
        image.load()
        if image.width * image.height > 40_000_000:
            raise ValueError("This image is very large. Please choose one under 40 megapixels.")
        return image.convert("RGB")
    except (UnidentifiedImageError, OSError) as error:
        raise ValueError("The selected file is not a readable JPG, JPEG, or PNG image.") from error


def read_damage_mask(width: int, height: int) -> np.ndarray | None:
    """Turn the transparent brush layer into the binary mask OpenCV needs."""
    uploaded_mask = request.files.get("mask")
    if uploaded_mask is None or not uploaded_mask.filename:
        return None
    try:
        mask_image = Image.open(uploaded_mask.stream).convert("RGBA")
        mask_image = mask_image.resize((width, height), Image.Resampling.NEAREST)
        pixels = np.asarray(mask_image)
    except (UnidentifiedImageError, OSError, ValueError) as error:
        raise ValueError("The brush mask could not be read. Please clear it and mark the damage again.") from error
    alpha = pixels[:, :, 3]
    red, green, blue = pixels[:, :, 0], pixels[:, :, 1], pixels[:, :, 2]
    magenta_pixels = (red > 120) & (blue > 80) & (green < 160)
    mask = np.where((alpha > 10) | magenta_pixels, 255, 0).astype(np.uint8)
    return mask if np.any(mask) else None


@app.get("/")
def home():
    return render_template("index.html")


@app.post("/api/preprocess")
def preprocess_upload():
    try:
        image = read_uploaded_image()
    except ValueError as error:
        return jsonify(error=str(error)), 400

    source_width, source_height = image.size
    original, preview = preprocess_image(image)
    height, width = original.shape[:2]
    was_resized = (width, height) != (source_width, source_height)
    resize_note = (
        f"The photo was resized from {source_width} × {source_height} to {width} × {height} pixels while keeping its proportions. "
        if was_resized
        else f"The photo was already within the 1600-pixel limit, so its {width} × {height} size was kept. "
    )
    explanation = resize_note + "RGB was converted to LAB, which separates brightness from color, then converted back. This prepares the brightness channel for contrast enhancement in a later step; this stage does not add detail."
    return jsonify(
        explanation=explanation,
        original=image_data_url(original),
        preprocessed=image_data_url(preview),
        width=width,
        height=height,
    )


@app.post("/api/restore")
def restore_upload():
    try:
        image = read_uploaded_image()
        original, _preview = preprocess_image(image)
        height, width = original.shape[:2]
        mask = read_damage_mask(width, height)
        mask_pixels = int(np.count_nonzero(mask)) if mask is not None else 0
        median_kernel = int(request.form.get("median_kernel", "3"))
        clip_limit = float(request.form.get("clip_limit", "2.0"))
        sharpen_amount = float(request.form.get("sharpen_amount", "0.8"))
        inpaint_radius = int(request.form.get("inpaint_radius", "3"))
        restored, applied = restore_image(
            original,
            use_median=request.form.get("use_median") == "true",
            median_kernel=median_kernel,
            damage_mask=mask,
            inpaint_radius=inpaint_radius,
            use_clahe=request.form.get("use_clahe") == "true",
            clip_limit=clip_limit,
            use_sharpen=request.form.get("use_sharpen") == "true",
            sharpen_amount=sharpen_amount,
        )
    except (ValueError, TypeError) as error:
        return jsonify(error=str(error) or "Please check the restoration settings."), 400

    if not applied:
        explanation = "No restoration operations or brush marks were selected. Choose a method or mark damaged areas and try again."
    else:
        explanation = "Applied " + "; ".join(applied) + ". Small, narrow marks generally inpaint best; broad marks may look soft because OpenCV fills them from nearby pixels."
    return jsonify(
        original=image_data_url(original),
        restored=image_data_url(restored),
        applied=applied,
        mask_pixels=mask_pixels,
        explanation=explanation,
        width=width,
        height=height,
    )


@app.errorhandler(413)
def file_too_large(_error):
    return jsonify(error="The upload is over 15 MB. Please choose a smaller photo."), 413


if __name__ == "__main__":
    app.run(debug=True)

