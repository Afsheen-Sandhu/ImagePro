// Initialize variables and get canvas contexts
const imageUpload = document.getElementById('imageUpload');
const canvas = document.getElementById('imageCanvas');
const mirroredCanvas = document.getElementById('mirroredCanvas');
const ctx = canvas.getContext('2d');
const mirroredCtx = mirroredCanvas.getContext('2d');
let img = new Image();
let originalImageData = null;
let isFlippedHorizontally = false;
let isFlippedVertically = false;
let isGrayscale = false;
let isNegative = false;
let classificationModel = null;
let objectDetectionModel = null;

// Load and display image on canvas
imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
        img.onload = function() {
            const maxWidth = window.innerWidth * 0.9; // 90% of viewport width
            const maxHeight = window.innerHeight * 0.7; // 70% of viewport height
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            mirroredCanvas.width = canvas.width;
            mirroredCanvas.height = canvas.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            enableAllButtons();
        }
    }
    reader.readAsDataURL(file);
});

// Enable buttons and reset transformations
function enableAllButtons() {
    document.querySelectorAll('button, input, select').forEach(el => {
        el.disabled = false;
    });
    resetTransformations();
}

function resetTransformations() {
    ctx.putImageData(originalImageData, 0, 0);
    mirroredCtx.clearRect(0, 0, mirroredCanvas.width, mirroredCanvas.height);
    isFlippedHorizontally = false;
    isFlippedVertically = false;
    isGrayscale = false;
    isNegative = false;
    mirroredCanvas.style.display = 'none';
    blurSlider.value = 0;
    contrastSlider.value = 100;
    saturationSlider.value = 100;
    cropSelection.value = "none";
}

// Flip and mirror image functions
document.getElementById('flipHorizontalButton').addEventListener('click', function() {
    isFlippedHorizontally = !isFlippedHorizontally;
    applyTransformations();
});

document.getElementById('flipVerticalButton').addEventListener('click', function() {
    isFlippedVertically = !isFlippedVertically;
    applyTransformations();
});

document.getElementById('mirrorButton').addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1); // Flip horizontally
    ctx.drawImage(img, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    mirroredCanvas.style.display = 'none';
});

// Apply blur filter
const blurSlider = document.getElementById('blur-slider');
document.getElementById('blurButton').addEventListener('click', function() {
    applyBlur(blurSlider.value);
});

blurSlider.addEventListener('input', function() {
    applyBlur(this.value);
});

function applyBlur(blurAmount) {
    resetTransformations();
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
}

// Apply grayscale and negative filters
document.getElementById('grayscaleButton').addEventListener('click', function() {
    isGrayscale = !isGrayscale;
    applyTransformations();
});

document.getElementById('negativeButton').addEventListener('click', function() {
    isNegative = !isNegative;
    applyTransformations();
});

// Apply contrast filter
const contrastSlider = document.getElementById('contrast-slider');
document.getElementById('contrastButton').addEventListener('click', function() {
    applyContrast(contrastSlider.value);
});

contrastSlider.addEventListener('input', function() {
    applyContrast(this.value);
});

function applyContrast(contrastAmount) {
    resetTransformations();
    ctx.filter = `contrast(${contrastAmount}%)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
}

// Apply saturation filter
const saturationSlider = document.getElementById('saturation-slider');
document.getElementById('saturationButton').addEventListener('click', function() {
    applySaturation(saturationSlider.value);
});

saturationSlider.addEventListener('input', function() {
    applySaturation(this.value);
});

function applySaturation(saturationAmount) {
    resetTransformations();
    ctx.filter = `saturate(${saturationAmount}%)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
}

// Crop image
document.getElementById('cropButton').addEventListener('click', function() {
    const cropSelection = document.getElementById('cropSelection').value;
    if (cropSelection !== "none") {
        const cropArea = calculateCropArea(cropSelection);
        const croppedImage = ctx.getImageData(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;
        ctx.putImageData(croppedImage, 0, 0);
    }
});

function calculateCropArea(selection) {
    const width = canvas.width / 2;
    const height = canvas.height / 2;
    switch (selection) {
        case "top-left":
            return { x: 0, y: 0, width: width, height: height };
        case "top-right":
            return { x: width, y: 0, width: width, height: height };
        case "bottom-left":
            return { x: 0, y: height, width: width, height: height };
        case "bottom-right":
            return { x: width, y: height, width: width, height: height };
        default:
            return { x: 0, y: 0, width: canvas.width, height: canvas.height };
    }
}

// Download processed image
document.getElementById('downloadButton').addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = 'processed-image.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Reset all transformations
document.getElementById('resetButton').addEventListener('click', function() {
    resetTransformations();
});

// Apply grayscale and negative transformations
function applyGrayscale(imageData) {
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
    return imageData;
}

function applyNegative(imageData) {
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
    return imageData;
}

// Apply transformations (flipping, grayscale, negative)
function applyTransformations() {
    ctx.putImageData(originalImageData, 0, 0);

    ctx.save();
    ctx.scale(isFlippedHorizontally ? -1 : 1, isFlippedVertically ? -1 : 1);
    ctx.drawImage(
        img,
        isFlippedHorizontally ? -canvas.width : 0,
        isFlippedVertically ? -canvas.height : 0,
        canvas.width,
        canvas.height
    );
    ctx.restore();

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (isGrayscale) {
        imageData = applyGrayscale(imageData);
    }

    if (isNegative) {
        imageData = applyNegative(imageData);
    }

    ctx.putImageData(imageData, 0, 0);
}

// Classification and object detection using TensorFlow.js models
document.getElementById('classifyButton').addEventListener('click', async function() {
    if (!classificationModel) {
        classificationModel = await mobilenet.load();
    }
    const predictions = await classificationModel.classify(canvas);
    alert('Predictions: ' + predictions.map(p => `${p.className}: ${p.probability.toFixed(2)}`).join(', '));
});

document.getElementById('detectObjectsButton').addEventListener('click', async function() {
    if (!objectDetectionModel) {
        objectDetectionModel = await cocoSsd.load();
    }
    const predictions = await objectDetectionModel.detect(canvas);
    predictions.forEach(prediction => {
        ctx.beginPath();
        ctx.rect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.stroke();
        ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
    });
});
