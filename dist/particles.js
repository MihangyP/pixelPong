import { drawRectangle } from './shapes.js';
const PARTICLE_QUANTITY = 25;
const PARTICLE_SIZE = 4;
const PARTICLE_LIFE = 1.5; // in second
const PARTICLE_MAX_SPEED = 40;
const FADE_FRACTION = 0.4;
;
let particlesArray = [];
function lerp(start, end, t) {
    return (start + (end - start) * t);
}
export function hexToRgba(hex) {
    hex = hex.replace('#', '');
    const hexInt = parseInt(hex, 16);
    return {
        r: (hexInt >> 16) & 255,
        g: (hexInt >> 8) & 255,
        b: hexInt & 255,
        a: 1,
    };
}
export function generateParticles(pos, color) {
    const particles = [];
    const now = performance.now();
    for (let i = 0; i < PARTICLE_QUANTITY; ++i) {
        const angle = Math.random() * Math.PI * 2;
        const particle = {
            rect: {
                pos: { x: pos.x, y: pos.y },
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
export function drawParticles(ctx) {
    for (let i = 0; i < particlesArray.length; ++i) {
        for (let j = 0; j < PARTICLE_QUANTITY; ++j) {
            const particle = particlesArray[i]?.[j];
            if (particle) {
                const { r, g, b, a } = particle.rect.color;
                const color = `rgba(${r}, ${g}, ${b}, ${a})`;
                drawRectangle(ctx, particle.rect.pos, particle.rect.width, particle.rect.height, color);
            }
        }
    }
}
export function updateParticles(dt) {
    for (let i = 0; i < particlesArray.length; ++i) {
        const group = particlesArray[i];
        if (!group)
            break;
        for (let j = group.length - 1; j >= 0; --j) {
            const p = group[j];
            if (!p)
                continue;
            p.lifetime -= dt;
            if (p.lifetime <= 0) {
                group.splice(j, 1);
            }
            else {
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
