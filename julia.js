const juliaCanvas = document.getElementById('juliaCanvas');
const selectionCanvas = document.getElementById('selectionCanvas');
const juliaCtx = juliaCanvas.getContext('2d');
const selectionCtx = selectionCanvas.getContext('2d');

const width = juliaCanvas.width;
const height = juliaCanvas.height;

let xMin = -2.0, xMax = 2.0;
let yMin = -2.0, yMax = 2.0;
let maxIter = 512;

let cRe = -0.5251993;
let cIm = 0.5251993;

let isDragging = false;
let startX, startY, endX, endY;

function drawJulia() {
    const imageData = juliaCtx.createImageData(width, height);
    const data = imageData.data;

    for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
            let x = xMin + (xMax - xMin) * px / width;
            let y = yMin + (yMax - yMin) * py / height;
            let iteration = 0;

            while (x * x + y * y <= 4 && iteration < maxIter) {
                let xTemp = x * x - y * y + cRe;
                y = 2 * x * y + cIm;
                x = xTemp;
                iteration++;
            }

            const grayScale = iteration === maxIter ? 0 : 255 - Math.floor((iteration / maxIter) * 255);
            const index = (px + py * width) * 4;

            data[index] = grayScale;
            data[index + 1] = grayScale;
            data[index + 2] = 255;
            data[index + 3] = grayScale;
        }
    }

    juliaCtx.putImageData(imageData, 0, 0);
}

function resetZoom() {
    xMin = -2.0;
    xMax = 2.0;
    yMin = -2.0;
    yMax = 2.0;
    drawJulia();
}

function updateParameters() {
    const iterationsInput = document.getElementById('iterationsInput').value;
    const realInput = document.getElementById('realInput').value;
    const imaginaryInput = document.getElementById('imaginaryInput').value;

    maxIter = parseInt(iterationsInput);
    cRe = parseFloat(realInput);
    cIm = parseFloat(imaginaryInput);

    if (isNaN(maxIter) || isNaN(cRe) || isNaN(cIm)) {
        alert("Пожалуйста, введите корректные значения.");
        return;
    }

    drawJulia();
}

selectionCanvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    const rect = selectionCanvas.getBoundingClientRect();
    startX = (event.clientX - rect.left) * (width / rect.width);
    startY = (event.clientY - rect.top) * (height / rect.height);
});

selectionCanvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        selectionCtx.clearRect(0, 0, width, height);
        const rect = selectionCanvas.getBoundingClientRect();
        endX = (event.clientX - rect.left) * (width / rect.width);
        endY = (event.clientY - rect.top) * (height / rect.height);

        selectionCtx.strokeStyle = 'lightblue';
        selectionCtx.lineWidth = 3;
        selectionCtx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
});

selectionCanvas.addEventListener('mouseup', (event) => {
    if (isDragging) {
        isDragging = false;
        const rect = selectionCanvas.getBoundingClientRect();
        endX = (event.clientX - rect.left) * (width / rect.width);
        endY = (event.clientY - rect.top) * (height / rect.height);
        selectionCtx.clearRect(0, 0, width, height);
        zoomJulia(startX, startY, endX, endY);
    }
});

function zoomJulia(x1, y1, x2, y2) {
    const new_xMin = xMin + (xMax - xMin) * (x1 / width);
    const new_xMax = xMin + (xMax - xMin) * (x2 / width);
    const new_yMin = yMin + (yMax - yMin) * (y1 / height);
    const new_yMax = yMin + (yMax - yMin) * (y2 / height);

    const aspectRatio = (xMax - xMin) / (yMax - yMin);
    const zoomWidth = new_xMax - new_xMin;
    const zoomHeight = new_yMax - new_yMin;

    if (zoomWidth / zoomHeight > aspectRatio) {
        const adjustedHeight = zoomWidth / aspectRatio;
        yMin = new_yMin - (adjustedHeight - zoomHeight) / 2;
        yMax = new_yMax + (adjustedHeight - zoomHeight) / 2;
        xMin = new_xMin;
        xMax = new_xMax;
    } else {
        const adjustedWidth = zoomHeight * aspectRatio;
        xMin = new_xMin - (adjustedWidth - zoomWidth) / 2;
        xMax = new_xMax + (adjustedWidth - zoomWidth) / 2;
        yMin = new_yMin;
        yMax = new_yMax;
    }

    drawJulia();
}

drawJulia();
