export interface Vector2 {
	x: number,
	y: number,
}

function drawRectangle(ctx: CanvasRenderingContext2D, pos: Vector2, width: number, height: number, color: string) {
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.rect(pos.x, pos.y, width, height);
	ctx.fill();
}

function drawCircle(ctx: CanvasRenderingContext2D, pos: Vector2, radius: number, color: string) {
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.shadowBlur = 15;
	ctx.shadowColor = "#FFB703"; // TODO: make dynamic
	ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.shadowBlur = 0;
}

function drawLine(ctx: CanvasRenderingContext2D, startPos: Vector2, endPos: Vector2, color: string) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.moveTo(startPos.x, startPos.y);
	ctx.lineTo(endPos.x, endPos.y);
	ctx.lineWidth = 4;
	ctx.stroke();
}

function drawText(ctx: CanvasRenderingContext2D, pos: Vector2, fontFamily: string, fontSize: number, text: string, color: string) {
	const font = fontSize.toString() + "px " + fontFamily;
	ctx.fillStyle = color;
	ctx.font = font;
	ctx.fillText(text, pos.x, pos.y);
}

function drawTextCenterX(ctx: CanvasRenderingContext2D, pos: Vector2, fontFamily: string, fontSize: number, text: string, color: string, blur: boolean = false) {
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

function checkCollisionRecCircle(recPos: Vector2, recWidth: number, recHeight: number, circlePos: Vector2, circleRadius: number): boolean {
	const recCenter: Vector2 = {
		x: recPos.x + (recWidth / 2),
		y: recPos.y + (recHeight / 2)
	};
	const delta: Vector2 = {
		x: Math.abs(recCenter.x - circlePos.x),
		y: Math.abs(recCenter.y - circlePos.y)
	}
	if (delta.x > (recWidth / 2 + circleRadius)) return (false);
	if (delta.y > (recHeight / 2 + circleRadius)) return (false);

	if (delta.x <= (recWidth / 2)) return (true);
	if (delta.y <= (recHeight / 2)) return (true);

	const cornerDistanceSq = (delta.x - recWidth / 2) ** 2 + (delta.y - recHeight / 2) ** 2;

	return cornerDistanceSq <= (circleRadius * circleRadius);
}

export {drawRectangle, drawCircle, drawLine, drawText, drawTextCenterX, checkCollisionRecCircle};
