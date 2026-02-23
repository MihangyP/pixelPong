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
function drawText(ctx, pos, fontFamily, fontSize, text, color) {
    const font = fontSize.toString() + "px " + fontFamily;
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, pos.x, pos.y);
}
function drawTextCenterX(ctx, pos, fontFamily, fontSize, text, color, blur = false) {
    const font = fontSize.toString() + "px " + fontFamily;
    ctx.fillStyle = color;
    if (blur) {
        ctx.shadowBlur = 2;
        ctx.shadowColor = "#5FFFE0";
    }
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.fillText(text, pos.x, pos.y);
    ctx.shadowBlur = 0;
}
function checkCollisionRecCircle(recPos, recWidth, recHeight, circlePos, circleRadius) {
    const recCenter = {
        x: recPos.x + (recWidth / 2),
        y: recPos.y + (recHeight / 2)
    };
    const delta = {
        x: Math.abs(recCenter.x - circlePos.x),
        y: Math.abs(recCenter.y - circlePos.y)
    };
    if (delta.x > (recWidth / 2 + circleRadius))
        return (false);
    if (delta.y > (recHeight / 2 + circleRadius))
        return (false);
    if (delta.x <= (recWidth / 2))
        return (true);
    if (delta.y <= (recHeight / 2))
        return (true);
    const cornerDistanceSq = (delta.x - recWidth / 2) ** 2 + (delta.y - recHeight / 2) ** 2;
    return cornerDistanceSq <= (circleRadius * circleRadius);
}
export { drawRectangle, drawCircle, drawLine, drawText, drawTextCenterX, checkCollisionRecCircle };
