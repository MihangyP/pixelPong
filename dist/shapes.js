function drawRectangle(ctx, pos, width, height, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(pos.x, pos.y, width, height);
    ctx.fill();
}
function drawCircle(ctx, pos, radius, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#FFB703"; // TODO: make dynamic
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
}
function drawLine(ctx, startPos, endPos, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    ctx.lineWidth = 4;
    ctx.stroke();
}
export { drawRectangle, drawCircle, drawLine };
