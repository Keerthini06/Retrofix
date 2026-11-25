# RetroFix — Old Photo Restoration System

VTU BCI515D mini-project demonstrating traditional image and video processing techniques with a local Python backend and an HTML/CSS/JavaScript frontend.

## Features

- Upload JPG, JPEG, and PNG photos up to 15 MB.
- Preview the selected photo in the browser.
- Resize very large images to a maximum dimension of 1600 pixels.
- Reduce noise with a selectable 3×3, 5×5, or 7×7 median filter.
- Mark paper wrinkles, scratches, and blotches with a brush; repair the mask with OpenCV Telea inpainting.
- Improve local contrast with CLAHE on the LAB lightness channel.
- Sharpen with unsharp masking.
- Compare before and after, use a light or dark theme, and download a restored JPEG.
- Process images in memory; the app does not save uploaded originals to disk.

## Project structure

```text
Restoration/
├── app.py                       # Flask routes and upload handling
├── processing.py                # OpenCV preprocessing/restoration functions
├── requirements.txt
├── templates/index.html         # Interface structure
├── static/styles.css            # Light/dark visual design
├── static/app.js                # Upload, preview, brush mask, and controls
├── docs/                         # Report, slides, viva, and testing guide
└── sample_images/                # Optional images for manual testing
```

## Run locally (PowerShell)

From the project folder in VS Code:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

Open <http://127.0.0.1:5000>. Stop the local server with **Ctrl+C**.

## Restoration workflow

1. Choose a photo and click **Prepare image**.
2. Turn individual filters on or off and adjust their settings.
3. Paint over photo-surface damage in magenta. For a long crease, use several short strokes.
4. Click **Restore marked photo** to run median filtering, inpainting, CLAHE, and sharpening in that order.
5. Review the before/after images and download the result.

The repair is manual: only marked regions are inpainted. Small, narrow damaged regions are more suitable for classical inpainting than large missing areas. No machine-learning model is used.

## Documentation

- [Project report](docs/PROJECT_REPORT.md)
- [Presentation outline](docs/PRESENTATION_OUTLINE.md)
- [Viva questions and answers](docs/VIVA_QA.md)
- [Manual testing guide](docs/TESTING_GUIDE.md)
- [Sample image sources](sample_images/README.md)
