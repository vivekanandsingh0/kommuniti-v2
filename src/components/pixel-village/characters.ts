import type { DrawFn } from "./types";

const px = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), s, s);
};

export const drawStanding: DrawFn = (ctx, x, y, s, p, frame) => {
  // Hair
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+4*s, y+s, s, p.hair);
  // Face
  px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Eyes
  px(ctx, x+s, y+s, s, "#111"); px(ctx, x+3*s, y+s, s, "#111");
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  px(ctx, x, y+4*s, s, p.skin); px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt); px(ctx, x+4*s, y+4*s, s, p.skin);
  px(ctx, x+s, y+5*s, s, p.shirt); px(ctx, x+2*s, y+5*s, s, p.shirt); px(ctx, x+3*s, y+5*s, s, p.shirt);
  // Legs
  px(ctx, x+s, y+6*s, s, p.pants); px(ctx, x+3*s, y+6*s, s, p.pants);
  px(ctx, x+s, y+7*s, s, p.pants); px(ctx, x+3*s, y+7*s, s, p.pants);
  px(ctx, x+s, y+8*s, s, "#333"); px(ctx, x+3*s, y+8*s, s, "#333");
  // Waving
  if (frame === 1) {
    px(ctx, x+5*s, y+2*s, s, p.skin); px(ctx, x+5*s, y+s, s, p.skin); px(ctx, x+5*s, y, s, p.skin);
  }
};

export const drawWalking: DrawFn = (ctx, x, y, s, p, frame) => {
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt);
  px(ctx, x+s, y+5*s, s, p.shirt); px(ctx, x+2*s, y+5*s, s, p.shirt); px(ctx, x+3*s, y+5*s, s, p.shirt);
  // Arms swinging
  if (frame === 0) {
    px(ctx, x, y+3*s, s, p.skin); px(ctx, x+4*s, y+4*s, s, p.skin);
  } else {
    px(ctx, x+4*s, y+3*s, s, p.skin); px(ctx, x, y+4*s, s, p.skin);
  }
  // Legs walking
  if (frame === 0) {
    px(ctx, x, y+6*s, s, p.pants); px(ctx, x+4*s, y+6*s, s, p.pants);
    px(ctx, x-s, y+7*s, s, p.pants); px(ctx, x+4*s, y+7*s, s, p.pants);
    px(ctx, x-s, y+8*s, s, "#333"); px(ctx, x+5*s, y+8*s, s, "#333");
  } else {
    px(ctx, x+s, y+6*s, s, p.pants); px(ctx, x+3*s, y+6*s, s, p.pants);
    px(ctx, x+s, y+7*s, s, p.pants); px(ctx, x+3*s, y+7*s, s, p.pants);
    px(ctx, x, y+8*s, s, "#333"); px(ctx, x+4*s, y+8*s, s, "#333");
  }
};

export const drawTyping: DrawFn = (ctx, x, y, s, p, frame) => {
  // Head (looking down)
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  // Arms to laptop
  px(ctx, x+3*s, y+4*s, s, p.skin); px(ctx, x+4*s, y+4*s, s, p.skin);
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt);
  // Laptop screen
  const lc = frame === 0 ? "#4FC3F7" : "#81D4FA";
  px(ctx, x+5*s, y+3*s, s, "#455A64"); px(ctx, x+6*s, y+3*s, s, lc); px(ctx, x+7*s, y+3*s, s, lc); px(ctx, x+8*s, y+3*s, s, "#455A64");
  // Laptop base
  px(ctx, x+5*s, y+4*s, s, "#546E7A"); px(ctx, x+6*s, y+4*s, s, "#546E7A"); px(ctx, x+7*s, y+4*s, s, "#546E7A"); px(ctx, x+8*s, y+4*s, s, "#546E7A");
  // Seated legs
  px(ctx, x, y+5*s, s, p.pants); px(ctx, x+s, y+5*s, s, p.pants); px(ctx, x+2*s, y+5*s, s, p.pants); px(ctx, x+3*s, y+5*s, s, p.pants); px(ctx, x+4*s, y+5*s, s, p.pants);
  // Chair
  px(ctx, x-s, y+4*s, s, "#5D4037"); px(ctx, x-s, y+5*s, s, "#5D4037"); px(ctx, x-s, y+6*s, s, "#5D4037");
  px(ctx, x+5*s, y+5*s, s, "#5D4037"); px(ctx, x+5*s, y+6*s, s, "#5D4037");
  // Chair legs
  px(ctx, x-s, y+7*s, s, "#5D4037"); px(ctx, x+5*s, y+7*s, s, "#5D4037");
  // Table
  px(ctx, x+5*s, y+5*s, s, "#4E342E"); px(ctx, x+6*s, y+5*s, s, "#4E342E"); px(ctx, x+7*s, y+5*s, s, "#4E342E"); px(ctx, x+8*s, y+5*s, s, "#4E342E");
  px(ctx, x+5*s, y+6*s, s, "#4E342E"); px(ctx, x+8*s, y+6*s, s, "#4E342E");
  px(ctx, x+5*s, y+7*s, s, "#4E342E"); px(ctx, x+8*s, y+7*s, s, "#4E342E");
  px(ctx, x+5*s, y+8*s, s, "#4E342E"); px(ctx, x+8*s, y+8*s, s, "#4E342E");
};

export const drawDancing: DrawFn = (ctx, x, y, s, p, frame) => {
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt);
  px(ctx, x+s, y+5*s, s, p.shirt); px(ctx, x+2*s, y+5*s, s, p.shirt); px(ctx, x+3*s, y+5*s, s, p.shirt);
  // Arms (dance moves)
  if (frame === 0) {
    px(ctx, x-s, y+2*s, s, p.skin); px(ctx, x-2*s, y+s, s, p.skin);
    px(ctx, x+5*s, y+2*s, s, p.skin); px(ctx, x+6*s, y+s, s, p.skin);
  } else {
    px(ctx, x-s, y+3*s, s, p.skin); px(ctx, x-2*s, y+3*s, s, p.skin);
    px(ctx, x+5*s, y+3*s, s, p.skin); px(ctx, x+6*s, y+3*s, s, p.skin);
  }
  // Legs
  if (frame === 0) {
    px(ctx, x, y+6*s, s, p.pants); px(ctx, x+4*s, y+6*s, s, p.pants);
    px(ctx, x-s, y+7*s, s, p.pants); px(ctx, x+5*s, y+7*s, s, p.pants);
    px(ctx, x-s, y+8*s, s, "#333"); px(ctx, x+5*s, y+8*s, s, "#333");
  } else {
    px(ctx, x+s, y+6*s, s, p.pants); px(ctx, x+3*s, y+6*s, s, p.pants);
    px(ctx, x+s, y+7*s, s, p.pants); px(ctx, x+3*s, y+7*s, s, p.pants);
    px(ctx, x+s, y+8*s, s, "#333"); px(ctx, x+3*s, y+8*s, s, "#333");
  }
  // Music notes
  if (frame === 1) {
    px(ctx, x+6*s, y-s, s, p.accent); px(ctx, x+7*s, y-2*s, s, p.accent);
  } else {
    px(ctx, x-2*s, y-s, s, p.accent); px(ctx, x-3*s, y, s, p.accent);
  }
};

export const drawSelling: DrawFn = (ctx, x, y, s, p, frame) => {
  // Head
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  // Arms on stall
  if (frame === 0) {
    px(ctx, x, y+4*s, s, p.skin); px(ctx, x+4*s, y+4*s, s, p.skin);
  } else {
    px(ctx, x-s, y+3*s, s, p.skin); px(ctx, x+5*s, y+3*s, s, p.skin);
  }
  // Stall canopy
  const canopy = "#C62828";
  const canopy2 = "#E53935";
  for (let i = -2; i <= 7; i++) px(ctx, x+i*s, y+3*s, s, i%2===0 ? canopy : canopy2);
  // Stall counter
  const stall = "#6D4C41";
  for (let i = -2; i <= 7; i++) px(ctx, x+i*s, y+4*s, s, stall);
  // Items on display
  const items = ["#E91E63", "#FFC107", "#4CAF50", "#FF9800", "#9C27B0"];
  for (let i = -1; i <= 6; i++) {
    px(ctx, x+i*s, y+5*s, s, items[(i + frame + 5) % items.length]);
  }
  // Stall bottom
  for (let i = -2; i <= 7; i++) px(ctx, x+i*s, y+6*s, s, stall);
  // Stall legs
  px(ctx, x-2*s, y+7*s, s, stall); px(ctx, x-2*s, y+8*s, s, stall);
  px(ctx, x+7*s, y+7*s, s, stall); px(ctx, x+7*s, y+8*s, s, stall);
  // Person legs (behind stall)
  px(ctx, x+s, y+5*s, s, p.pants); px(ctx, x+3*s, y+5*s, s, p.pants);
};

export const drawTalking: DrawFn = (ctx, x, y, s, p, frame) => {
  const p2 = { ...p, shirt: SHIRTS[(SHIRTS.indexOf(p.shirt) + 3) % SHIRTS.length], hair: HAIR[(HAIR.indexOf(p.hair) + 2) % HAIR.length] };
  // Person 1
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  if (frame === 0) px(ctx, x+4*s, y+3*s, s, p.skin);
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt);
  px(ctx, x+s, y+5*s, s, p.shirt); px(ctx, x+2*s, y+5*s, s, p.shirt); px(ctx, x+3*s, y+5*s, s, p.shirt);
  px(ctx, x+s, y+6*s, s, p.pants); px(ctx, x+3*s, y+6*s, s, p.pants);
  px(ctx, x+s, y+7*s, s, p.pants); px(ctx, x+3*s, y+7*s, s, p.pants);
  px(ctx, x+s, y+8*s, s, "#333"); px(ctx, x+3*s, y+8*s, s, "#333");
  // Speech bubble
  if (frame === 1) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(x+4*s, y-2*s, 4*s, 2*s);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(x+4*s, y, s, s);
    // Dots in bubble
    ctx.fillStyle = "#333";
    ctx.fillRect(x+5*s, y-s, s/2, s/2);
    ctx.fillRect(x+6*s, y-s, s/2, s/2);
    ctx.fillRect(x+7*s, y-s, s/2, s/2);
  }
  // Person 2
  const x2 = x + 9*s;
  px(ctx, x2+s, y, s, p2.hair); px(ctx, x2+2*s, y, s, p2.hair); px(ctx, x2+3*s, y, s, p2.hair);
  px(ctx, x2, y+s, s, p2.hair); px(ctx, x2+4*s, y+s, s, p2.hair);
  px(ctx, x2+s, y+s, s, p2.skin); px(ctx, x2+2*s, y+s, s, p2.skin); px(ctx, x2+3*s, y+s, s, p2.skin);
  px(ctx, x2+s, y+2*s, s, p2.skin); px(ctx, x2+2*s, y+2*s, s, p2.skin); px(ctx, x2+3*s, y+2*s, s, p2.skin);
  px(ctx, x2+s, y+3*s, s, p2.shirt); px(ctx, x2+2*s, y+3*s, s, p2.shirt); px(ctx, x2+3*s, y+3*s, s, p2.shirt);
  if (frame === 1) px(ctx, x2, y+3*s, s, p2.skin);
  px(ctx, x2+s, y+4*s, s, p2.shirt); px(ctx, x2+2*s, y+4*s, s, p2.shirt); px(ctx, x2+3*s, y+4*s, s, p2.shirt);
  px(ctx, x2+s, y+5*s, s, p2.shirt); px(ctx, x2+2*s, y+5*s, s, p2.shirt); px(ctx, x2+3*s, y+5*s, s, p2.shirt);
  px(ctx, x2+s, y+6*s, s, p2.pants); px(ctx, x2+3*s, y+6*s, s, p2.pants);
  px(ctx, x2+s, y+7*s, s, p2.pants); px(ctx, x2+3*s, y+7*s, s, p2.pants);
  px(ctx, x2+s, y+8*s, s, "#333"); px(ctx, x2+3*s, y+8*s, s, "#333");
};

export const drawSitting: DrawFn = (ctx, x, y, s, p, frame) => {
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  // Arms zen
  if (frame === 0) {
    px(ctx, x, y+3*s, s, p.skin); px(ctx, x+4*s, y+3*s, s, p.skin);
  } else {
    px(ctx, x-s, y+2*s, s, p.skin); px(ctx, x+5*s, y+2*s, s, p.skin);
  }
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt);
  // Cross-legged
  px(ctx, x, y+5*s, s, p.pants); px(ctx, x+s, y+5*s, s, p.pants); px(ctx, x+2*s, y+5*s, s, p.pants); px(ctx, x+3*s, y+5*s, s, p.pants); px(ctx, x+4*s, y+5*s, s, p.pants);
  // Zen particles
  if (frame === 1) {
    ctx.fillStyle = "rgba(255,193,7,0.4)";
    ctx.fillRect(x-s, y-s, s/2, s/2);
    ctx.fillRect(x+5*s, y-s, s/2, s/2);
    ctx.fillRect(x+2*s, y-2*s, s/2, s/2);
  }
};

export const drawBicycle: DrawFn = (ctx, x, y, s, p, frame) => {
  // Rider head
  px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin);
  // Body leaning forward
  px(ctx, x+2*s, y+2*s, s, p.shirt); px(ctx, x+3*s, y+2*s, s, p.shirt);
  px(ctx, x+3*s, y+3*s, s, p.shirt); px(ctx, x+4*s, y+3*s, s, p.skin); // arm to handlebar
  // Legs on pedals
  if (frame === 0) {
    px(ctx, x+2*s, y+3*s, s, p.pants); px(ctx, x+s, y+4*s, s, p.pants);
  } else {
    px(ctx, x+2*s, y+4*s, s, p.pants); px(ctx, x+3*s, y+4*s, s, p.pants);
  }
  // Bicycle frame
  const bike = "#78909C";
  px(ctx, x+s, y+4*s, s, bike); px(ctx, x+2*s, y+4*s, s, bike); px(ctx, x+3*s, y+4*s, s, bike); px(ctx, x+4*s, y+4*s, s, bike);
  px(ctx, x+s, y+5*s, s, bike); px(ctx, x+4*s, y+3*s, s, bike);
  // Wheels
  const wheel = "#455A64";
  // Back wheel
  px(ctx, x, y+5*s, s, wheel); px(ctx, x+s, y+5*s, s, wheel);
  px(ctx, x, y+6*s, s, wheel); px(ctx, x+s, y+6*s, s, wheel);
  // Front wheel
  px(ctx, x+4*s, y+5*s, s, wheel); px(ctx, x+5*s, y+5*s, s, wheel);
  px(ctx, x+4*s, y+6*s, s, wheel); px(ctx, x+5*s, y+6*s, s, wheel);
  // Spokes animation
  if (frame === 0) {
    px(ctx, x, y+5*s, s, "#90A4AE");
    px(ctx, x+5*s, y+6*s, s, "#90A4AE");
  } else {
    px(ctx, x+s, y+6*s, s, "#90A4AE");
    px(ctx, x+4*s, y+5*s, s, "#90A4AE");
  }
};

import { SHIRTS, HAIR } from "./types";

export const CHARACTER_DRAWS: DrawFn[] = [
  drawStanding, drawWalking, drawTyping, drawDancing,
  drawSelling, drawTalking, drawSitting, drawBicycle
];
