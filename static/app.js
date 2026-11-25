const fileInput = document.querySelector("#photo-input");
const dropzone = document.querySelector("#dropzone");
const preview = document.querySelector("#preview");
const emptyNote = document.querySelector("#empty-note");
const previewImage = document.querySelector("#photo-preview");
const fileName = document.querySelector("#file-name");
const imageMeta = document.querySelector("#image-meta");
const processButton = document.querySelector("#process-photo");
const statusMessage = document.querySelector("#status-message");
const results = document.querySelector("#results");
const restorePanel = document.querySelector("#restoration-controls");
const restoreButton = document.querySelector("#restore-photo");
const restoreStatus = document.querySelector("#restore-status");
const restoreResults = document.querySelector("#restore-results");
const damageBackground = document.querySelector("#damage-background");
const damageCanvas = document.querySelector("#damage-canvas");
const brushSize = document.querySelector("#brush-size");
const brushContext = damageCanvas.getContext("2d");
let currentUrl = null;
let selectedFile = null;
let isDrawing = false;

function showPhoto(file) {
  if (!file) return;
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    showStatus(statusMessage, "Please choose a JPG, JPEG, or PNG photograph.", true);
    fileInput.value = "";
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    showStatus(statusMessage, "This file is over 15 MB. Please choose a smaller photograph.", true);
    fileInput.value = "";
    return;
  }
  selectedFile = file;
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentUrl = URL.createObjectURL(file);
  previewImage.src = currentUrl;
  fileName.textContent = file.name;
  previewImage.onload = () => {
    imageMeta.textContent = `${previewImage.naturalWidth} × ${previewImage.naturalHeight} pixels · ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  };
  preview.hidden = false;
  emptyNote.hidden = true;
  results.hidden = true;
  restorePanel.hidden = true;
  restoreResults.hidden = true;
  statusMessage.hidden = true;
  restoreStatus.hidden = true;
}

function showStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
  element.hidden = false;
}

function clearMask() {
  brushContext.clearRect(0, 0, damageCanvas.width, damageCanvas.height);
}

function initializeCanvas(dataUrl) {
  damageBackground.onload = () => {
    damageCanvas.width = damageBackground.naturalWidth;
    damageCanvas.height = damageBackground.naturalHeight;
    clearMask();
  };
  damageBackground.src = dataUrl;
}

function pointOnCanvas(event) {
  const rect = damageCanvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * damageCanvas.width / rect.width,
    y: (event.clientY - rect.top) * damageCanvas.height / rect.height,
  };
}

fileInput.addEventListener("change", () => showPhoto(fileInput.files[0]));
document.querySelector("#remove-photo").addEventListener("click", () => {
  selectedFile = null;
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentUrl = null;
  fileInput.value = "";
  previewImage.removeAttribute("src");
  preview.hidden = true;
  results.hidden = true;
  restorePanel.hidden = true;
  restoreResults.hidden = true;
  statusMessage.hidden = true;
  emptyNote.hidden = false;
});

for (const eventName of ["dragenter", "dragover"]) {
  dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.add("dragging"); });
}
for (const eventName of ["dragleave", "drop"]) {
  dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.remove("dragging"); });
}
dropzone.addEventListener("drop", event => showPhoto(event.dataTransfer.files[0]));

processButton.addEventListener("click", async () => {
  if (!selectedFile) return showStatus(statusMessage, "Choose a photograph first.", true);
  const data = new FormData();
  data.append("photo", selectedFile);
  processButton.disabled = true;
  processButton.textContent = "Preparing image…";
  showStatus(statusMessage, "Sending the image to the local Python backend…");
  results.hidden = true;
  restorePanel.hidden = true;
  try {
    const response = await fetch("/api/preprocess", { method: "POST", body: data });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The image could not be prepared.");
    document.querySelector("#server-original").src = result.original;
    document.querySelector("#server-preprocessed").src = result.preprocessed;
    document.querySelector("#processed-dimensions").textContent = `${result.width} × ${result.height} pixels`;
    document.querySelector("#processing-explanation").textContent = result.explanation;
    results.hidden = false;
    restorePanel.hidden = false;
    initializeCanvas(result.original);
    showStatus(statusMessage, "Preprocessing complete. Mark damage or adjust the restoration controls.");
  } catch (error) {
    showStatus(statusMessage, error.message || "Could not connect to the Python backend.", true);
  } finally {
    processButton.disabled = false;
    processButton.innerHTML = 'Prepare image <span aria-hidden="true">→</span>';
  }
});

function drawStart(event) {
  if (damageCanvas.width === 0) return;
  isDrawing = true;
  damageCanvas.setPointerCapture(event.pointerId);
  const point = pointOnCanvas(event);
  brushContext.beginPath();
  brushContext.moveTo(point.x, point.y);
  brushContext.lineCap = "round";
  brushContext.lineJoin = "round";
  brushContext.strokeStyle = "rgba(220, 35, 125, 1)";
  brushContext.fillStyle = "rgba(220, 35, 125, 1)";
  brushContext.lineWidth = Number(brushSize.value);
  brushContext.arc(point.x, point.y, Number(brushSize.value) / 2, 0, Math.PI * 2);
  brushContext.fill();
  brushContext.beginPath();
  brushContext.moveTo(point.x, point.y);
}
function drawMove(event) {
  if (!isDrawing) return;
  const point = pointOnCanvas(event);
  brushContext.lineTo(point.x, point.y);
  brushContext.stroke();
}
function drawEnd() { isDrawing = false; brushContext.closePath(); }
damageCanvas.addEventListener("pointerdown", drawStart);
damageCanvas.addEventListener("pointermove", drawMove);
damageCanvas.addEventListener("pointerup", drawEnd);
damageCanvas.addEventListener("pointercancel", drawEnd);
document.querySelector("#clear-mask").addEventListener("click", () => { clearMask(); restoreResults.hidden = true; });

const clipControl = document.querySelector("#clip-limit");
const sharpControl = document.querySelector("#sharpen-amount");
clipControl.addEventListener("input", () => { document.querySelector("#clip-value").value = Number(clipControl.value).toFixed(1); });
sharpControl.addEventListener("input", () => { document.querySelector("#sharp-value").value = Number(sharpControl.value).toFixed(1); });
brushSize.addEventListener("input", () => { document.querySelector("#brush-value").value = `${brushSize.value} px`; });
const radiusControl = document.querySelector("#inpaint-radius");
radiusControl.addEventListener("input", () => { document.querySelector("#radius-value").value = `${radiusControl.value} px`; });

restoreButton.addEventListener("click", async () => {
  if (!selectedFile) return showStatus(restoreStatus, "Choose a photograph first.", true);
  const brushPixels = brushContext.getImageData(0, 0, damageCanvas.width, damageCanvas.height).data;
  let brushMarkCount = 0;
  for (let i = 0; i < brushPixels.length; i += 4) {
    if (brushPixels[i + 3] > 10 || (brushPixels[i] > 120 && brushPixels[i + 2] > 80 && brushPixels[i + 1] < 160)) brushMarkCount++;
  }
  const maskBlob = await new Promise(resolve => damageCanvas.toBlob(resolve, "image/png"));
  if (!maskBlob) return showStatus(restoreStatus, "Could not read the brush layer. Refresh the page and mark again.", true);
  const data = new FormData();
  data.append("photo", selectedFile);
  data.append("mask", maskBlob, "brush-mask.png");
  data.append("use_median", String(document.querySelector("#use-median").checked));
  data.append("median_kernel", document.querySelector("#median-kernel").value);
  data.append("use_clahe", String(document.querySelector("#use-clahe").checked));
  data.append("clip_limit", clipControl.value);
  data.append("use_sharpen", String(document.querySelector("#use-sharpen").checked));
  data.append("sharpen_amount", sharpControl.value);
  data.append("inpaint_radius", radiusControl.value);
  restoreButton.disabled = true;
  restoreButton.textContent = "Restoring image…";
  showStatus(restoreStatus, brushMarkCount ? `Sending ${brushMarkCount.toLocaleString()} marked brush pixels for repair…` : "No brush strokes detected; applying selected filters only.");
  restoreResults.hidden = true;
  try {
    const response = await fetch("/api/restore", { method: "POST", body: data });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The image could not be restored.");
    document.querySelector("#restore-original").src = result.original;
    document.querySelector("#restore-output").src = result.restored;
    document.querySelector("#restore-dimensions").textContent = `${result.width} × ${result.height} pixels`;
    document.querySelector("#restore-explanation").textContent = result.explanation;
    const downloadLink = document.querySelector("#download-restored");
    downloadLink.href = result.restored;
    restoreResults.hidden = false;
    const maskNote = result.mask_pixels > 0 ? `Detected ${result.mask_pixels.toLocaleString()} marked pixels; scratch repair was applied.` : "No brush marks were detected. Draw over the scratch in magenta before restoring.";
    showStatus(restoreStatus, `${maskNote} Compare the images and download the result.`);
  } catch (error) {
    showStatus(restoreStatus, error.message || "Could not connect to the Python backend.", true);
  } finally {
    restoreButton.disabled = false;
    restoreButton.innerHTML = 'Restore marked photo <span aria-hidden="true">→</span>';
  }
});

document.querySelector("#theme-toggle").addEventListener("click", event => {
  const button = event.currentTarget;
  const dark = document.body.dataset.theme !== "dark";
  document.body.dataset.theme = dark ? "dark" : "light";
  button.setAttribute("aria-pressed", String(dark));
  button.querySelector("span").textContent = dark ? "Light mode" : "Dark mode";
});

