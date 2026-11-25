# RetroFix Presentation — 10-slide outline

## Slide 1 — Title
**RetroFix: Old Photo Restoration System**  
BCI515D — Image and Video Processing · VTU 5th Semester  
Student name, USN, guide, department, academic year.

**Visual:** The app interface with one selected sample image.

## Slide 2 — Problem and motivation
- Old photographs can contain noise, low contrast, scratches, blotches, and paper creases.
- Manual editing tools can be difficult for a beginner.
- Need a simple local application using explainable image-processing methods.

**Speaker note:** This project focuses on repair of selected defects; it does not use AI to reconstruct hidden content.

## Slide 3 — Objectives and scope
- Upload and preview JPG/JPEG/PNG photographs.
- Reduce noise, repair manually marked damage, improve contrast, and sharpen.
- Compare original and processed results and download the output.
- Run locally with free libraries and no external service.

## Slide 4 — Technology stack
- Python, Flask, OpenCV, NumPy, Pillow
- HTML, CSS, JavaScript
- Local browser interface and local Python processing

**Visual:** Browser → Flask → OpenCV/NumPy → browser result flow.

## Slide 5 — System workflow
Upload → Validate → Resize/convert → Median filter → Brush mask and inpainting → CLAHE → Unsharp mask → Compare/download.

**Visual:** Flowchart from the report.

## Slide 6 — Image-processing algorithms
- Median filter: neighborhood median suppresses impulse noise.
- Inpainting: Telea method fills user-marked mask from surrounding pixels.
- CLAHE: local histogram equalization on LAB lightness with clipping.
- Unsharp mask: combines the source image and a Gaussian-blurred copy.

## Slide 7 — Interface and user controls
- Dark theme by default, with light theme option.
- Brush, brush size, and inpainting radius.
- Independent median, CLAHE, and sharpening switches/settings.
- Before/after preview and JPEG download.

**Visual:** Screenshot with the marked mask and results panel.

## Slide 8 — Demonstration and observations
Demonstrate one image:
1. Prepare it and describe resizing/LAB preprocessing.
2. Run median filtering alone.
3. Mark a scratch and show the mask count.
4. Apply repair and optional enhancement controls.
5. Compare and download.

**Results to report:** Describe observed changes honestly; do not invent PSNR/SSIM values.

## Slide 9 — Limitations and future work
- Mask must be drawn manually.
- Inpainting works best for small defects; it cannot recover unknown detail in large damaged areas.
- Strong filtering can soften texture; strong sharpening can amplify noise.
- Future work: undo/redo, alternate inpainting methods, and objective quality measures with reference images.

## Slide 10 — Conclusion and questions
- Demonstrates BCI515D Modules 2, 3, and 5.
- Combines image enhancement, noise reduction, and selected-damage restoration.
- Runs locally with traditional techniques and no model training.

**Closing:** Thank you · Questions?

## Suggested timing

| Slides | Time |
|---|---:|
| 1–3: motivation and objectives | 2 min |
| 4–6: architecture and algorithms | 3 min |
| 7–8: application demo and observations | 3 min |
| 9–10: limitations and conclusion | 1–2 min |
