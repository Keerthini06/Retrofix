# RetroFix Manual Testing Guide

## Start the application

From the project folder in PowerShell:

```powershell
.\.venv\Scripts\python.exe app.py
```

Open <http://127.0.0.1:5000>. Stop with **Ctrl+C**.

## Suggested sample images

Open a Commons page and choose **Original file** to save an image locally. Check the page for its license and attribution details.

- [Old photo 1880 (public domain)](https://commons.wikimedia.org/wiki/File:Old_photo_1880.jpg)
- [Rijksmuseum framed portrait of an older woman (CC0)](https://commons.wikimedia.org/wiki/File:Ingelijste_portretfoto_van_een_oudere_vrouw,_RP-F-00-6917-10.jpg)
- [Robert Cornelius portrait (public domain)](https://commons.wikimedia.org/wiki/File:RobertCornelius.jpg)

These provide old-photo examples, not guaranteed damaged originals. To test the repair brush without a dataset, make a copy of a downloaded image and use a basic editor to draw a few thin white and dark lines on the copy. Keep the clean source unchanged for visual comparison.

## Test cases

| # | Action | Expected result |
|---|---|---|
| 1 | Open the home page | RetroFix opens in the dark theme; the Light mode switch is available. |
| 2 | Choose a JPG or PNG | Browser shows the filename, dimensions, and preview. |
| 3 | Select an unsupported file or a file above 15 MB | The page displays an error and does not process it. |
| 4 | Click Prepare image | Original and preprocessed previews appear; resize and LAB explanation is shown. |
| 5 | Run median only, then compare | Small impulse-like noise is reduced; larger kernels may soften detail. |
| 6 | Run CLAHE only | Local contrast changes, especially in faded areas; adjust the clip limit. |
| 7 | Run unsharp mask only | Edges appear crisper; excessive strength can emphasize noise/halos. |
| 8 | Draw over an artificial scratch and restore | Status reports detected brush pixels and the repair method; marked line should be reduced. |
| 9 | Click Clear marks, then restore | The mask is cleared; only the selected filters run. |
| 10 | Download the result | A JPEG file downloads and can be opened. |
| 11 | Switch to Light mode | The page uses the light theme; image pixels are unaffected by the theme. |

## Suggested manual comparison

Use the same source image for each trial. Compare the original and output at the same display size. Record the enabled controls and settings. Evaluate whether noise, local contrast, sharpness, and marked defects changed. Include screenshots of the app and note that results depend on image content and settings. Do not invent numeric scores; PSNR or SSIM requires an appropriate clean reference image.

## Troubleshooting

- If the page does not refresh its styles or scripts, use **Ctrl+F5**.
- If an upload reports unsupported data, ensure the file really is JPEG or PNG, not only renamed with that extension.
- If the mask count is zero, check that magenta strokes are visible on the canvas before clicking Restore marked photo.
- If a marked crease still shows, mark its entire length in several strokes and try a larger inpainting radius. Broad damage may remain soft with classical inpainting.
