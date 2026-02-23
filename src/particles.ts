import {drawRectangle} from './shapes.js';
import type {Vector2} from './shapes.js';

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

let particlesArray: Particle[][] = [];

function lerp(start: number, end: number, t: number): number {
	return (start + (end - start) * t);
}

export function hexToRgba(hex: string): RgbaColor {
	hex = hex.replace('#', '');
	const hexInt = parseInt(hex, 16);
	return {
		r: (hexInt >> 16) & 255,
		g: (hexInt >> 8) & 255,
		b: hexInt & 255,
		a: 1,
	};
}

export function generateParticles(pos: Vector2, color: RgbaColor) {
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

export function drawParticles(ctx: CanvasRenderingContext2D): void {
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

export function updateParticles(dt: number) {
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
