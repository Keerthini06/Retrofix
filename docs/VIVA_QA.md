# RetroFix Viva Questions and Answers

## Project overview

**1. What is RetroFix?**  
RetroFix is a local Flask web application that restores selected defects in old photos using traditional OpenCV techniques.

**2. Why did you choose this project?**  
It applies image enhancement, filtering, restoration, and scratch removal concepts to a practical problem from BCI515D.

**3. Does the project use machine learning?**  
No. It uses deterministic image-processing algorithms and a user-drawn damage mask.

**4. Why is the processing local?**  
The Flask server runs on the same laptop. The image is sent to the local Python backend and is not saved as an uploaded file.

## Image fundamentals and preprocessing

**5. Why convert an image to RGB?**  
A consistent RGB array simplifies display and processing across uploaded JPEG and PNG files.

**6. Why resize large images?**  
Resizing bounds memory use and processing time while preserving the aspect ratio.

**7. What is LAB color space?**  
LAB separates lightness (L) from two color-opponent channels (A and B). This lets CLAHE adjust brightness contrast while retaining the color channels.

**8. Does RGB → LAB → RGB alone restore the image?**  
No. It demonstrates the color-space conversion and prepares the image representation; actual contrast enhancement occurs when CLAHE is applied to L.

## Noise removal and enhancement

**9. How does a median filter work?**  
It replaces each pixel with the median of values in its neighborhood. It is effective for impulse-like noise and often preserves edges better than averaging.

**10. What does the kernel size control?**  
It controls the neighborhood. Larger windows remove stronger noise but can soften fine details.

**11. What is histogram equalization?**  
It remaps intensity values using the image histogram to improve contrast. Global equalization applies one mapping to the whole image.

**12. What is CLAHE?**  
Contrast Limited Adaptive Histogram Equalization works on local tiles and clips excessive histogram peaks to limit over-amplification. RetroFix applies it to LAB lightness.

**13. What does the CLAHE clip limit do?**  
It controls how much local histogram peaks are clipped. Higher settings can increase local contrast but may also make noise more visible.

**14. Explain unsharp masking.**  
A blurred image is subtracted from the original to isolate high-frequency detail, then that detail is added back. In this app, a Gaussian blur and weighted sum implement the method.

**15. What is a risk of too much sharpening?**  
It can amplify noise and create halos around edges.

## Restoration and mask

**16. What is image inpainting?**  
Inpainting estimates missing or damaged pixels inside a mask from surrounding image information.

**17. How does the user create the mask?**  
The user paints over photo damage on a browser canvas. JavaScript sends the transparent brush layer with the image to Flask; Python converts it to a binary mask.

**18. Which inpainting method is used?**  
OpenCV Telea fast-marching inpainting (`cv2.INPAINT_TELEA`).

**19. What does inpainting radius mean?**  
It controls the neighborhood radius used to estimate values for masked pixels. Too small may leave damage; too large can make the fill overly smooth.

**20. Why can a large crease remain visible?**  
Traditional inpainting only uses nearby pixels. If a large area or important detail is missing, the original content cannot be inferred reliably.

**21. Does the app automatically find scratches?**  
No. The user selects damaged areas manually, which avoids applying repair to unrelated image content.

## Implementation

**22. What is Flask used for?**  
Flask serves the HTML page and exposes POST endpoints that receive images and settings and return processed image data.

**23. What is the role of JavaScript?**  
It previews selected files, manages the brush canvas and settings, sends requests with `fetch`, and displays results/download links.

**24. What does NumPy do?**  
It represents images and masks as arrays and supports mask operations such as thresholding and counting marked pixels.

**25. How are unsupported images handled?**  
The app checks decoded image format and reports a readable error for unsupported or corrupt files.

**26. What is the difference between enhancement and restoration?**  
Enhancement improves visual appearance, such as contrast or sharpness. Restoration attempts to correct modeled degradation, such as noise or known damaged areas.

**27. Which syllabus modules does the project demonstrate?**  
Module 2 through filtering and CLAHE, Module 3 through noise reduction and restoration, and Module 5 through mask-based blotch/scratch removal.

**28. What future improvements are possible?**  
Undo/redo brush strokes, alternate inpainting methods, batch processing, histogram display, and objective evaluation when a clean reference image exists.
