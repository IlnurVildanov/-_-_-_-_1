const mandelbrotCanvas = document.getElementById('mandelbrotCanvas');
const selectionCanvas = document.getElementById('selectionCanvas');
const mandelbrotCtx = mandelbrotCanvas.getContext('2d');
const selectionCtx = selectionCanvas.getContext('2d');

const width = mandelbrotCanvas.width;
const height = mandelbrotCanvas.height;

let xMin = -2.5, xMax = 1.5;
let yMin = -2.0, yMax = 2.0;
let maxIter = 128;

let isDragging = false;
let startX, startY, endX, endY;

function drawMandelbrot() {
    const imageData = mandelbrotCtx.createImageData(width, height);
    const data = imageData.data;

    for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
            let x0 = xMin + (xMax - xMin) * px / width;
            let y0 = yMin + (yMax - yMin) * py / height;
            let x = 0, y = 0, iteration = 0;

            while (x * x + y * y <= 4 && iteration < maxIter) {
                const xTemp = x * x - y * y + x0;
                y = 2 * x * y + y0;
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

    mandelbrotCtx.putImageData(imageData, 0, 0);
}
function resetZoom() {
    xMin = -2.5;
    xMax = 1.5;
    yMin = -2.0;
    yMax = 2.0;
    drawMandelbrot();
}


function updateIterations() {
    const input = document.getElementById('iterationInput');
    const newIter = parseInt(input.value, 10);

    if (isNaN(newIter) || newIter <= 0) {
        alert('Введите положительное число!');
        return;
    }

    // Обновляем maxIter только здесь
    maxIter = newIter;
    drawMandelbrot(); // Перерисовка с новым значением maxIter
}




function zoomMandelbrot(x1, y1, x2, y2) {
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

    // Перестраиваем множество с текущим значением maxIter
    drawMandelbrot();
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
        selectionCtx.lineWidth = 2;
        selectionCtx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
});

selectionCanvas.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        const rect = selectionCanvas.getBoundingClientRect();
        const zoomEndX = (event.clientX - rect.left) * (width / rect.width);
        const zoomEndY = (event.clientY - rect.top) * (height / rect.height);
        selectionCtx.clearRect(0, 0, width, height);
        zoomMandelbrot(startX, startY, zoomEndX, zoomEndY);
    }
});

drawMandelbrot();
