const sierpinskiCanvas = document.getElementById('sierpinskiCanvas');
const selectionCanvas = document.getElementById('selectionCanvas');
const sierpinskiCtx = sierpinskiCanvas.getContext('2d');
const selectionCtx = selectionCanvas.getContext('2d');

const width = sierpinskiCanvas.width;
const height = sierpinskiCanvas.height;

let maxIter = 5; // Максимальное количество итераций
let isDragging = false;
let startX, startY, endX, endY;
let x1 = width / 2, y1 = 20;
let x2 = x1 - width / 2, y2 = height - 20;
let x3 = x1 + width / 2, y3 = height - 20;

// Рисуем базовый треугольник
function drawTriangle(ctx, x1, y1, x2, y2, x3, y3) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
}

// Рекурсивное рисование фрактала
function drawSierpinski(ctx, x1, y1, x2, y2, x3, y3, depth) {
    // Если фрактал на слишком глубоком уровне итерации, завершаем
    if (depth === 0 || Math.abs(x2 - x1) < 1 || Math.abs(y3 - y1) < 1) {
        drawTriangle(ctx, x1, y1, x2, y2, x3, y3);
        return;
    }

    const midX1 = (x1 + x2) / 2;
    const midY1 = (y1 + y2) / 2;
    const midX2 = (x2 + x3) / 2;
    const midY2 = (y2 + y3) / 2;
    const midX3 = (x1 + x3) / 2;
    const midY3 = (y1 + y3) / 2;

    drawSierpinski(ctx, x1, y1, midX1, midY1, midX3, midY3, depth - 1);
    drawSierpinski(ctx, midX1, midY1, x2, y2, midX2, midY2, depth - 1);
    drawSierpinski(ctx, midX3, midY3, midX2, midY2, x3, y3, depth - 1);
}
function drawFractalStep(ctx, x1, y1, x2, y2, x3, y3, depth, currentDepth = 0) {
    if (currentDepth >= depth) {
        drawTriangle(ctx, x1, y1, x2, y2, x3, y3);
        return;
    }

    const midX1 = (x1 + x2) / 2;
    const midY1 = (y1 + y2) / 2;
    const midX2 = (x2 + x3) / 2;
    const midY2 = (y2 + y3) / 2;
    const midX3 = (x1 + x3) / 2;
    const midY3 = (y1 + y3) / 2;

    // Рекурсивная отрисовка с анимацией
    setTimeout(() => {
        drawFractalStep(ctx, x1, y1, midX1, midY1, midX3, midY3, depth, currentDepth + 1);
        drawFractalStep(ctx, midX1, midY1, x2, y2, midX2, midY2, depth, currentDepth + 1);
        drawFractalStep(ctx, midX3, midY3, midX2, midY2, x3, y3, depth, currentDepth + 1);
    }, 0);
}



// Основная функция отрисовки
function drawFractal() {
    sierpinskiCtx.clearRect(0, 0, width, height);
    drawSierpinski(sierpinskiCtx, x1, y1, x2, y2, x3, y3, maxIter);
}
function zoomFractal(x1Sel, y1Sel, x2Sel, y2Sel) {
    // Нормализуем выделенную область
    const zoomMinX = Math.min(x1Sel, x2Sel);
    const zoomMaxX = Math.max(x1Sel, x2Sel);
    const zoomMinY = Math.min(y1Sel, y2Sel);
    const zoomMaxY = Math.max(y1Sel, y2Sel);

    // Вычисляем коэффициенты масштабирования
    const scaleX = width / (zoomMaxX - zoomMinX);
    const scaleY = height / (zoomMaxY - zoomMinY);

    // Пересчет вершин треугольника
    const offsetX = zoomMinX;
    const offsetY = zoomMinY;

    x1 = (x1 - offsetX) * scaleX;
    y1 = (y1 - offsetY) * scaleY;
    x2 = (x2 - offsetX) * scaleX;
    y2 = (y2 - offsetY) * scaleY;
    x3 = (x3 - offsetX) * scaleX;
    y3 = (y3 - offsetY) * scaleY;

    // Перерисовка
    drawFractal();
}
function drawFractalWithScale(ctx, scale) {
    const effectiveDepth = Math.min(maxIter, Math.floor(15 + Math.log2(scale)));
    drawFractalStep(ctx, x1, y1, x2, y2, x3, y3, effectiveDepth);
}


// Сброс настроек
function resetZoom() {
    x1 = width / 2;
    y1 = 20;
    x2 = x1 - width / 2;
    y2 = height - 20;
    x3 = x1 + width / 2;
    y3 = height - 20;

    drawFractal();
}

// Обновление итераций
function updateIterations() {
    const input = document.getElementById('iterationInput');
    const newIter = parseInt(input.value, 10);

    if (isNaN(newIter) || newIter < 0) {
        alert('Введите положительное значение итераций');
        return;
    }

    maxIter = newIter;
    drawFractal();
}

// События для масштабирования (пока зум не реализован)
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

selectionCanvas.addEventListener('mouseup', (event) => {
    if (isDragging) {
        isDragging = false;
        const rect = selectionCanvas.getBoundingClientRect();
        const zoomEndX = (event.clientX - rect.left) * (width / rect.width);
        const zoomEndY = (event.clientY - rect.top) * (height / rect.height);
        selectionCtx.clearRect(0, 0, width, height);

        zoomFractal(startX, startY, zoomEndX, zoomEndY);
    }
});


// Инициализация
drawFractal();
