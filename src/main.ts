import type {Vector2} from './shapes.js';
import {drawRectangle, drawCircle, drawLine, drawText, drawTextCenterX, checkCollisionRecCircle} from './shapes.js';

let windowWidth: number;
let windowHeight: number;
const pong = document.getElementById("pong") as HTMLCanvasElement | null;
if (pong == null) {
	throw new Error("No element with the id 'pong'");
}
const ctx = pong.getContext("2d");
if (ctx == null) {
	throw new Error("Cannot support 2d platform");
}
const bgMenu = document.getElementById("bgMenu") as HTMLImageElement | null;
if (bgMenu == null) {
	throw new Error("No element with the id 'bgMenu'");
}

pong.width = window.innerWidth;
pong.height = window.innerHeight;

windowWidth = ctx.canvas.width;
windowHeight = ctx.canvas.height;

enum PongScreen {
	Menu = 'MENU',
	Game = 'GAME',
	Auth = 'AUTH',
}

let currentScreen: PongScreen = PongScreen.Menu;

const bo = new Audio("../resources/bo.mp3");
bo.preload = "auto";
bo.loop = true;
bo.volume = 0.3;

// for bot
const botSpeed = 200;          // plus petit que playerVelocity
const botPrecision = 50;       // erreur humaine (pixels)
const botReaction = 1;      // temps de réaction (sec)
let botThinkTimer = 0;
let botTargetY = windowHeight / 2;

let hasSound = true;
const myWhite = "#E0FBFC";
const ballColor = "#FFD166";
const playerPaddleColor = "#00F5FF";
const botPaddleColor = "#9B5CFF";
const ballRadius = 10;
let windowWasResized = false;
const padding = 20;
const paddleWidth = 10;
const paddleHeight = 150;
let playerMoveUp = false;
let playerMoveDown = false;
let playerMoveRight = false;
let playerMoveLeft = false;
const playerVelocity = 300;
let paused = false;

const PARTICLE_QUANTITY = 25;
const PARTICLE_SIZE = 4;
const PARTICLE_LIFE = 1.5; // in second
const PARTICLE_MAX_SPEED = 40;
const FADE_FRACTION = 0.4;

interface RgbaColor {
	r: number,
	g: number,
	b: number,
	a: number,
}

interface Rect {
	pos: Vector2,
	width: number,
	height: number,
	color: RgbaColor,
};

interface Particle {
	rect: Rect,
	vx: number,
	vy: number,
	lifetime: number,
	birthtime: number,
}

function lerp(start: number, end: number, t: number): number {
	return (start + (end - start) * t);
}

function hexToRgba(hex: string): RgbaColor {
	hex = hex.replace('#', '');
	const hexInt = parseInt(hex, 16);
	return {
		r: (hexInt >> 16) & 255,
		g: (hexInt >> 8) & 255,
		b: hexInt & 255,
		a: 1,
	};
}

let particlesArray: Particle[][] = [];

function generateParticles(pos: Vector2, color: RgbaColor) {
	const particles: Particle[] = [];
	const now = performance.now();

	for (let i = 0; i < PARTICLE_QUANTITY; ++i) {
		const angle = Math.random() * Math.PI * 2;
		const particle = {
			rect: {
				pos: {x: pos.x, y: pos.y},
				width: PARTICLE_SIZE,
				height: PARTICLE_SIZE,
				color: {
					r: color.r,
					g: color.g,
					b: color.b,
					a: color.a
				}
			},
			vx: (Math.random() * PARTICLE_MAX_SPEED) * Math.cos(angle),
			vy: (Math.random() * PARTICLE_MAX_SPEED) * Math.sin(angle),
			lifetime: PARTICLE_LIFE,
			birthtime: now,
		};
		particles.push(particle);
	}
	particlesArray.push(particles);
}

function drawParticles(ctx: CanvasRenderingContext2D): void {
	for (let i = 0; i < particlesArray.length; ++i) {
		for (let j = 0; j < PARTICLE_QUANTITY; ++j) {
			const particle = particlesArray[i]?.[j];
			if (particle) {
				const {r, g, b, a} = particle.rect.color;
				const color = `rgba(${r}, ${g}, ${b}, ${a})`;
				drawRectangle(ctx, particle.rect.pos, particle.rect.width, particle.rect.height, color);
			}
		}
	}
}

function updateParticles(dt: number) {
	for (let i = 0; i < particlesArray.length; ++i) {
		const group = particlesArray[i];
		if (!group) break;
		for (let j = group.length - 1; j >= 0; --j) {
			const p = group[j];
			if (!p) continue;
			p.lifetime -= dt;
			if (p.lifetime <= 0) {
				group.splice(j, 1);
			} else {
				p.rect.pos.x += p.vx * dt;
				p.rect.pos.y += p.vy * dt;

				if (p.lifetime < PARTICLE_LIFE * FADE_FRACTION) {
					const t = p.lifetime / (PARTICLE_LIFE * FADE_FRACTION);
					p.rect.color.a = lerp(1, 0, 1 - t);
				}
			}
		}
		if (group.length === 0) {
			particlesArray.splice(i, 1);
		}
	}
}

let ballPos = {
	x: windowWidth / 2,
	y: windowHeight / 2
}

const ballSpeed = 400;
let ballVelocity = {
	x: ballSpeed,
	y: ballSpeed
}

let playerPos = {
	x: padding,
	y: (windowHeight - paddleHeight) / 2,
}

let botPos = {
	x: windowWidth - paddleWidth - padding,
	y: (windowHeight - paddleHeight) / 2,
}

function drawGame(ctx: CanvasRenderingContext2D) {
	ctx.clearRect(0, 0, windowWidth, windowHeight);
	if (pong) {
		if (bgMenu) {
			ctx.drawImage(bgMenu, 0, 0, windowWidth, windowHeight);
		}
		// platform
		drawLine(ctx, {x: windowWidth / 2, y: 0}, {x: windowWidth / 2, y: windowHeight}, myWhite);
		// left Line
		drawLine(ctx, {x: 0, y: 0}, {x: 0, y: windowHeight}, myWhite);
		// right Line
		drawLine(ctx, {x: windowWidth, y: 0}, {x: windowWidth, y: windowHeight}, myWhite);
		drawLine(ctx, {x: 0, y: 0}, {x: windowWidth, y: 0}, myWhite);
		drawLine(ctx, {x: 0, y: windowHeight}, {x: windowWidth, y: windowHeight}, myWhite);

		// ball
		drawCircle(ctx, ballPos, ballRadius, ballColor);

		// paddles 
		drawRectangle(ctx, playerPos, paddleWidth, paddleHeight, playerPaddleColor);
		drawRectangle(ctx, botPos, paddleWidth, paddleHeight, botPaddleColor);

		drawParticles(ctx);
	}

	// Pause
	if (paused) {
		drawText(ctx, {
			x: windowWidth / 2, y: windowHeight / 2
		}, "Orbitron", 42, "Pause", "#E0FBFC");
	}
}

const menuItems: string[] = [
	"Solo",
	"Multiplayer",
	"Music: on",
];
let menuItemFocus = 0;

function drawMenu(ctx: CanvasRenderingContext2D) {
	const TITLE_PADDING_TOP = 169;
	const TITLE_PADDING_BOTTOM = 200;
	const ITEM_GAP = 120;
	const menuFont = "Orbitron"

	bo.pause();
	ctx.clearRect(0, 0, windowWidth, windowHeight);
	if (bgMenu) {
		ctx.drawImage(bgMenu, 0, 0, windowWidth, windowHeight);
	}
	drawTextCenterX(ctx, {x: windowWidth / 2, y: TITLE_PADDING_TOP}, menuFont, 100, "Pixel Pong", "#7de2d1");
	let itemPosY = TITLE_PADDING_TOP + TITLE_PADDING_BOTTOM;
	menuItems.forEach((item, i) => {
		if (i === menuItemFocus) {
			drawTextCenterX(ctx, {
				x: (windowWidth / 2) - 300, y: (itemPosY + i * ITEM_GAP) - 10
			}, menuFont, 69, "→", "#339989", true);
			drawTextCenterX(ctx, {x: windowWidth / 2, y: itemPosY + i * ITEM_GAP}, menuFont, 69, item, "#339989", true);
		} else {
			drawTextCenterX(ctx, {x: windowWidth / 2, y: itemPosY + i * ITEM_GAP}, menuFont, 69, item, myWhite);
		}
	})
}

function drawAuth(ctx: CanvasRenderingContext2D) {
	if (bgMenu) {
		ctx.drawImage(bgMenu, 0, 0, windowWidth, windowHeight);
	}
	drawTextCenterX(ctx, {x: windowWidth / 2, y: windowHeight / 2}, "Orbitron", 69, "Multiplayer Screen", myWhite);
}

function playGame(ctx: CanvasRenderingContext2D, dt: number) {
	if (!paused) {
		if (ballPos.x + ballRadius >= windowWidth) {
			ballVelocity.x *= -1;
			const color = hexToRgba(myWhite);
			generateParticles({x: ballPos.x + ballRadius, y: ballPos.y}, color);
		}
		if (ballPos.x - ballRadius <= 0) {
			ballVelocity.x *= -1;
			const color = hexToRgba(myWhite);
			generateParticles({x: ballPos.x - ballRadius, y: ballPos.y}, color);
		}
		if (ballPos.y + ballRadius >= windowHeight) {
			ballVelocity.y *= -1;
			const color = hexToRgba(myWhite);
			generateParticles({x: ballPos.x, y: ballPos.y + ballRadius}, color);
		}
		if (ballPos.y - ballRadius <= 0) {
			ballVelocity.y *= -1;
			const color = hexToRgba(myWhite);
			generateParticles({x: ballPos.x, y: ballPos.y - ballRadius}, color);
		}
		if (checkCollisionRecCircle(playerPos, paddleWidth, paddleHeight, ballPos, ballRadius)) {
			ballVelocity.x *= -1;
			const color = hexToRgba(playerPaddleColor);
			generateParticles({x: ballPos.x, y: ballPos.y}, color);
		}

		if (checkCollisionRecCircle(botPos, paddleWidth, paddleHeight, ballPos, ballRadius)) {
			ballVelocity.x *= -1;
			const color = hexToRgba(botPaddleColor);
			generateParticles({x: ballPos.x, y: ballPos.y}, color);
		}

		ballPos.x += ballVelocity.x * dt;
		ballPos.y += ballVelocity.y * dt;

		if (playerMoveUp && playerPos.y > 0) {
			playerPos.y -= playerVelocity * dt;
		} else if (playerMoveDown && playerPos.y + paddleHeight < windowHeight) {
			playerPos.y += playerVelocity * dt;
		} else if (playerMoveLeft && playerPos.x > 0) {
			playerPos.x -= playerVelocity * dt;
		} else if (playerMoveRight && playerPos.x + paddleWidth < windowWidth / 2) {
			playerPos.x += playerVelocity * dt;
		}
	}
	if (!paused) {
		updateBot(dt);
		updateParticles(dt);
	}
	drawGame(ctx);
}

let lastTime = performance.now();
function gameLoop(now: number) {
	const dt = (now - lastTime) / 1000;
	lastTime = now;
	if (windowWasResized) {
		if (pong) {
			pong.width = window.innerWidth;
			pong.height = window.innerHeight;
		}
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		playerPos.y = (windowHeight - paddleHeight) / 2;
		botPos.x = windowWidth - paddleWidth - padding;
		botPos.y = (windowHeight - paddleHeight) / 2;
		windowWasResized = false;
	}
	if (ctx) {
		if (currentScreen === PongScreen.Game)
			playGame(ctx, dt);
		else if (currentScreen === PongScreen.Menu)
			drawMenu(ctx);
		else if (currentScreen === PongScreen.Auth)
			drawAuth(ctx);
	}
	requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

window.addEventListener("click", () => {
	if (currentScreen === PongScreen.Game) {
		console.log(currentScreen);
		ctx.lineWidth = 4;
		bo.play();
	}
}, {once: true})

window.addEventListener("resize", () => {
	windowWasResized = true;
});

window.addEventListener("keypress", (e) => {
	if (e.code === 'Space' && currentScreen === PongScreen.Game) {
		paused = !paused;
		if (paused)
			bo.pause();
		else if (hasSound)
			bo.play();
	}
	if (e.code === 'KeyT') { // toggle menu
		if (currentScreen === PongScreen.Game || currentScreen === PongScreen.Auth) {
			currentScreen = PongScreen.Menu;
			paused = true;
		}
		else if (currentScreen === PongScreen.Menu) currentScreen = PongScreen.Game;
	}
	// Action on Menu items
	if (e.code === 'Enter' && currentScreen === PongScreen.Menu) {
		switch (menuItemFocus) {
			case 0: { // Solo
				currentScreen = PongScreen.Game;
			} break;
			case 1: { // Multiplayer
				currentScreen = PongScreen.Auth;
			} break;
			case 2: { // Toogle sound
				if (hasSound) {
					bo.pause();
					bo.currentTime = 0;
					menuItems[2] = "Music: off";
					hasSound = false;
				} else {
					menuItems[2] = "Music: on";
					hasSound = true;
				}
			}
		}
	}
})

window.addEventListener("keydown", (e) => {
	switch (e.code) {
		case 'KeyW': {
			playerMoveUp = true;
		} break;
		case 'KeyS': {
			playerMoveDown = true;
		} break;
		case 'KeyD': {
			playerMoveRight = true;
		} break;
		case 'KeyA': {
			playerMoveLeft = true;
		} break;
		case 'ArrowUp': {
			if (menuItemFocus == 0) menuItemFocus = 2;
			else menuItemFocus -= 1;
			drawMenu(ctx);
		} break;
		case 'ArrowDown': {
			if (menuItemFocus == 2) menuItemFocus = 0;
			else menuItemFocus += 1;
			drawMenu(ctx);
		} break;
	}
})

window.addEventListener("keyup", (e) => {
	switch (e.code) {
		case 'KeyW': {
			playerMoveUp = false;
		} break;
		case 'KeyS': {
			playerMoveDown = false;
		} break;
		case 'KeyD': {
			playerMoveRight = false;
		} break;
		case 'KeyA': {
			playerMoveLeft = false;
		} break;
	}
})

// TODO: try to understand this function
function predictBallY(): number {
	let simulatedY = ballPos.y;
	let simulatedVy = ballVelocity.y;
	let simulatedX = ballPos.x;
	let simulatedVx = ballVelocity.x;

	// simule jusqu'au mur droit
	while (simulatedX < botPos.x) {
		simulatedX += simulatedVx * 0.016;
		simulatedY += simulatedVy * 0.016;

		// rebond haut/bas
		if (simulatedY <= ballRadius || simulatedY >= windowHeight - ballRadius) {
			simulatedVy *= -1;
		}
	}

	return simulatedY;
}

// TODO: and this
function updateBot(dt: number) {

	// réagit seulement si la balle vient vers lui
	if (ballVelocity.x <= 0) return;

	botThinkTimer -= dt;

	if (botThinkTimer <= 0) {
		botThinkTimer = botReaction;

		botTargetY = predictBallY();

		// erreur humaine
		botTargetY += (Math.random() * 2 - 1) * botPrecision;
	}

	const botCenter = botPos.y + paddleHeight / 2;
	const diff = botTargetY - botCenter;

	if (Math.abs(diff) > 5) {
		if (diff >= 0)
			botPos.y += botSpeed * dt;
		else
			botPos.y += -botSpeed * dt;
	}

	// clamp écran
	botPos.y = Math.max(0, Math.min(windowHeight - paddleHeight, botPos.y));
}
