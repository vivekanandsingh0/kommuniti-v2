import { useEffect, useRef } from "react";

// ─── Color palettes for characters ───
const SKIN = ["#D4A574", "#C8A882", "#BF9B7A", "#E0C097"];
const HAIR = ["#4A3728", "#3D2E1F", "#2D2D2D", "#5D4037", "#3E2723"];
const SHIRTS = ["#E91E63", "#5C6BC0", "#4CAF50", "#78909C", "#FFC107", "#FF9800", "#9C27B0"];
const PANTS = ["#2D2D2D", "#37474F", "#3E2723", "#1A237E"];

interface Palette {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  accent: string;
}

const randomPalette = (): Palette => ({
  skin: SKIN[Math.floor(Math.random() * SKIN.length)],
  hair: HAIR[Math.floor(Math.random() * HAIR.length)],
  shirt: SHIRTS[Math.floor(Math.random() * SHIRTS.length)],
  pants: PANTS[Math.floor(Math.random() * PANTS.length)],
  accent: "#FFC107",
});

// ─── Drawing helpers ───
const px = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), s, s);
};

// ─── Character drawing functions (each frame) ───
type DrawFn = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, p: Palette, frame: number) => void;

const drawStanding: DrawFn = (ctx, x, y, s, p, frame) => {
  // Head
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  px(ctx, x, y+4*s, s, p.skin); px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt); px(ctx, x+4*s, y+4*s, s, p.skin);
  px(ctx, x+s, y+5*s, s, p.shirt); px(ctx, x+2*s, y+5*s, s, p.shirt); px(ctx, x+3*s, y+5*s, s, p.shirt);
  // Legs
  px(ctx, x+s, y+6*s, s, p.pants); px(ctx, x+3*s, y+6*s, s, p.pants);
  px(ctx, x+s, y+7*s, s, p.pants); px(ctx, x+3*s, y+7*s, s, p.pants);
  // Waving arm
  if (frame === 1) {
    px(ctx, x+4*s, y+2*s, s, p.skin);
    px(ctx, x+5*s, y+s, s, p.skin);
  }
};

const drawWalking: DrawFn = (ctx, x, y, s, p, frame) => {
  // Head
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt);
  px(ctx, x+s, y+5*s, s, p.shirt); px(ctx, x+2*s, y+5*s, s, p.shirt); px(ctx, x+3*s, y+5*s, s, p.shirt);
  // Legs (animated)
  if (frame === 0) {
    px(ctx, x, y+6*s, s, p.pants); px(ctx, x+3*s, y+6*s, s, p.pants);
    px(ctx, x, y+7*s, s, p.pants); px(ctx, x+4*s, y+7*s, s, p.pants);
  } else {
    px(ctx, x+s, y+6*s, s, p.pants); px(ctx, x+3*s, y+6*s, s, p.pants);
    px(ctx, x+2*s, y+7*s, s, p.pants); px(ctx, x+3*s, y+7*s, s, p.pants);
  }
  // Swinging arms
  if (frame === 0) {
    px(ctx, x, y+3*s, s, p.skin); px(ctx, x+4*s, y+4*s, s, p.skin);
  } else {
    px(ctx, x+4*s, y+3*s, s, p.skin); px(ctx, x, y+4*s, s, p.skin);
  }
};

const drawTyping: DrawFn = (ctx, x, y, s, p, frame) => {
  // Sitting person with laptop
  // Head
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  // Arms reaching to laptop
  const armX = frame === 0 ? x+4*s : x+5*s;
  px(ctx, x+3*s, y+4*s, s, p.skin); px(ctx, x+4*s, y+4*s, s, p.skin);
  // Laptop
  px(ctx, x+5*s, y+3*s, s, "#5C6BC0"); px(ctx, x+6*s, y+3*s, s, "#5C6BC0"); px(ctx, x+7*s, y+3*s, s, "#5C6BC0");
  px(ctx, x+5*s, y+4*s, s, "#78909C"); px(ctx, x+6*s, y+4*s, s, "#78909C"); px(ctx, x+7*s, y+4*s, s, "#78909C");
  // Seated legs
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt);
  px(ctx, x, y+5*s, s, p.pants); px(ctx, x+s, y+5*s, s, p.pants); px(ctx, x+2*s, y+5*s, s, p.pants); px(ctx, x+3*s, y+5*s, s, p.pants); px(ctx, x+4*s, y+5*s, s, p.pants);
  // Chair
  px(ctx, x, y+6*s, s, "#5D4037"); px(ctx, x+4*s, y+6*s, s, "#5D4037");
  px(ctx, x, y+7*s, s, "#5D4037"); px(ctx, x+4*s, y+7*s, s, "#5D4037");
};

const drawDancing: DrawFn = (ctx, x, y, s, p, frame) => {
  // Head
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt);
  px(ctx, x+s, y+5*s, s, p.shirt); px(ctx, x+2*s, y+5*s, s, p.shirt); px(ctx, x+3*s, y+5*s, s, p.shirt);
  // Arms up (dancing)
  if (frame === 0) {
    px(ctx, x-s, y+2*s, s, p.skin); px(ctx, x-s, y+s, s, p.skin);
    px(ctx, x+5*s, y+2*s, s, p.skin); px(ctx, x+5*s, y+s, s, p.skin);
  } else {
    px(ctx, x-s, y+3*s, s, p.skin); px(ctx, x-2*s, y+2*s, s, p.skin);
    px(ctx, x+5*s, y+3*s, s, p.skin); px(ctx, x+6*s, y+2*s, s, p.skin);
  }
  // Legs
  if (frame === 0) {
    px(ctx, x, y+6*s, s, p.pants); px(ctx, x+4*s, y+6*s, s, p.pants);
    px(ctx, x, y+7*s, s, p.pants); px(ctx, x+4*s, y+7*s, s, p.pants);
  } else {
    px(ctx, x+s, y+6*s, s, p.pants); px(ctx, x+3*s, y+6*s, s, p.pants);
    px(ctx, x+s, y+7*s, s, p.pants); px(ctx, x+3*s, y+7*s, s, p.pants);
  }
};

const drawSelling: DrawFn = (ctx, x, y, s, p, frame) => {
  // Vendor with stall
  // Head
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  // Body
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  // Arms on stall
  px(ctx, x, y+4*s, s, p.skin); px(ctx, x+4*s, y+4*s, s, p.skin);
  // Stall top
  const stallColor = "#8D6E63";
  for (let i = -1; i <= 8; i++) px(ctx, x+i*s, y+4*s, s, stallColor);
  // Stall items
  const items = ["#E91E63", "#FFC107", "#4CAF50", "#FF9800"];
  for (let i = 0; i < 7; i++) {
    px(ctx, x+(i-1)*s, y+5*s, s, items[(i + frame) % items.length]);
  }
  // Stall bottom
  for (let i = -1; i <= 8; i++) px(ctx, x+i*s, y+6*s, s, stallColor);
  // Stall legs
  px(ctx, x-s, y+7*s, s, stallColor); px(ctx, x+7*s, y+7*s, s, stallColor);
  // Person legs
  px(ctx, x+s, y+5*s, s, p.pants); px(ctx, x+3*s, y+5*s, s, p.pants);
};

const drawTalking: DrawFn = (ctx, x, y, s, p, frame) => {
  const p2 = { ...p, shirt: SHIRTS[(SHIRTS.indexOf(p.shirt) + 3) % SHIRTS.length] };
  // Person 1
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  if (frame === 0) px(ctx, x+4*s, y+3*s, s, p.skin);
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt);
  px(ctx, x+s, y+5*s, s, p.shirt); px(ctx, x+2*s, y+5*s, s, p.shirt); px(ctx, x+3*s, y+5*s, s, p.shirt);
  px(ctx, x+s, y+6*s, s, p.pants); px(ctx, x+3*s, y+6*s, s, p.pants);
  px(ctx, x+s, y+7*s, s, p.pants); px(ctx, x+3*s, y+7*s, s, p.pants);
  // Speech bubble
  if (frame === 1) {
    px(ctx, x+4*s, y-s, s, "#fff"); px(ctx, x+5*s, y-s, s, "#fff"); px(ctx, x+6*s, y-s, s, "#fff");
    px(ctx, x+4*s, y, s, "#fff");
  }
  // Person 2 (facing left)
  const x2 = x + 8*s;
  px(ctx, x2+s, y, s, p2.hair); px(ctx, x2+2*s, y, s, p2.hair); px(ctx, x2+3*s, y, s, p2.hair);
  px(ctx, x2, y+s, s, p2.hair); px(ctx, x2+s, y+s, s, p2.skin); px(ctx, x2+2*s, y+s, s, p2.skin); px(ctx, x2+3*s, y+s, s, p2.skin); px(ctx, x2+4*s, y+s, s, p2.hair);
  px(ctx, x2+s, y+2*s, s, p2.skin); px(ctx, x2+2*s, y+2*s, s, p2.skin); px(ctx, x2+3*s, y+2*s, s, p2.skin);
  px(ctx, x2+s, y+3*s, s, p2.shirt); px(ctx, x2+2*s, y+3*s, s, p2.shirt); px(ctx, x2+3*s, y+3*s, s, p2.shirt);
  if (frame === 1) px(ctx, x2, y+3*s, s, p2.skin);
  px(ctx, x2+s, y+4*s, s, p2.shirt); px(ctx, x2+2*s, y+4*s, s, p2.shirt); px(ctx, x2+3*s, y+4*s, s, p2.shirt);
  px(ctx, x2+s, y+5*s, s, p2.shirt); px(ctx, x2+2*s, y+5*s, s, p2.shirt); px(ctx, x2+3*s, y+5*s, s, p2.shirt);
  px(ctx, x2+s, y+6*s, s, p2.pants); px(ctx, x2+3*s, y+6*s, s, p2.pants);
  px(ctx, x2+s, y+7*s, s, p2.pants); px(ctx, x2+3*s, y+7*s, s, p2.pants);
};

const drawSitting: DrawFn = (ctx, x, y, s, p, frame) => {
  // Meditating
  px(ctx, x+s, y, s, p.hair); px(ctx, x+2*s, y, s, p.hair); px(ctx, x+3*s, y, s, p.hair);
  px(ctx, x, y+s, s, p.hair); px(ctx, x+s, y+s, s, p.skin); px(ctx, x+2*s, y+s, s, p.skin); px(ctx, x+3*s, y+s, s, p.skin); px(ctx, x+4*s, y+s, s, p.hair);
  px(ctx, x+s, y+2*s, s, p.skin); px(ctx, x+2*s, y+2*s, s, p.skin); px(ctx, x+3*s, y+2*s, s, p.skin);
  px(ctx, x+s, y+3*s, s, p.shirt); px(ctx, x+2*s, y+3*s, s, p.shirt); px(ctx, x+3*s, y+3*s, s, p.shirt);
  // Arms crossed/meditating
  if (frame === 0) {
    px(ctx, x, y+3*s, s, p.skin); px(ctx, x+4*s, y+3*s, s, p.skin);
  } else {
    px(ctx, x-s, y+2*s, s, p.skin); px(ctx, x+5*s, y+2*s, s, p.skin);
  }
  px(ctx, x+s, y+4*s, s, p.shirt); px(ctx, x+2*s, y+4*s, s, p.shirt); px(ctx, x+3*s, y+4*s, s, p.shirt);
  // Cross-legged
  px(ctx, x, y+5*s, s, p.pants); px(ctx, x+s, y+5*s, s, p.pants); px(ctx, x+2*s, y+5*s, s, p.pants); px(ctx, x+3*s, y+5*s, s, p.pants); px(ctx, x+4*s, y+5*s, s, p.pants);
};

// ─── Environment drawing ───
const drawTree = (ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number) => {
  const green1 = "#2E7D32";
  const green2 = "#388E3C";
  const green3 = "#1B5E20";
  const trunk = "#5D4037";
  const h = variant === 0 ? 6 : 8;

  // Trunk
  for (let i = 0; i < 3 + variant; i++) {
    px(ctx, x+s, groundY - (i+1)*s, s, trunk);
    px(ctx, x+2*s, groundY - (i+1)*s, s, trunk);
  }
  const ty = groundY - (4 + variant)*s;
  // Canopy - triangular
  if (variant === 0) {
    // Small tree
    px(ctx, x+s, ty, s, green2); px(ctx, x+2*s, ty, s, green1);
    px(ctx, x, ty-s, s, green2); px(ctx, x+s, ty-s, s, green1); px(ctx, x+2*s, ty-s, s, green2); px(ctx, x+3*s, ty-s, s, green3);
    px(ctx, x-s, ty-2*s, s, green3); px(ctx, x, ty-2*s, s, green1); px(ctx, x+s, ty-2*s, s, green2); px(ctx, x+2*s, ty-2*s, s, green1); px(ctx, x+3*s, ty-2*s, s, green2); px(ctx, x+4*s, ty-2*s, s, green3);
    px(ctx, x, ty-3*s, s, green2); px(ctx, x+s, ty-3*s, s, green1); px(ctx, x+2*s, ty-3*s, s, green2); px(ctx, x+3*s, ty-3*s, s, green3);
    px(ctx, x+s, ty-4*s, s, green1); px(ctx, x+2*s, ty-4*s, s, green2);
  } else {
    // Tall tree
    px(ctx, x+s, ty, s, green2); px(ctx, x+2*s, ty, s, green1);
    px(ctx, x, ty-s, s, green2); px(ctx, x+s, ty-s, s, green1); px(ctx, x+2*s, ty-s, s, green2); px(ctx, x+3*s, ty-s, s, green3);
    px(ctx, x-s, ty-2*s, s, green3); px(ctx, x, ty-2*s, s, green1); px(ctx, x+s, ty-2*s, s, green2); px(ctx, x+2*s, ty-2*s, s, green1); px(ctx, x+3*s, ty-2*s, s, green2); px(ctx, x+4*s, ty-2*s, s, green3);
    px(ctx, x-2*s, ty-3*s, s, green3); px(ctx, x-s, ty-3*s, s, green2); px(ctx, x, ty-3*s, s, green1); px(ctx, x+s, ty-3*s, s, green2); px(ctx, x+2*s, ty-3*s, s, green1); px(ctx, x+3*s, ty-3*s, s, green2); px(ctx, x+4*s, ty-3*s, s, green3); px(ctx, x+5*s, ty-3*s, s, green3);
    px(ctx, x-s, ty-4*s, s, green2); px(ctx, x, ty-4*s, s, green1); px(ctx, x+s, ty-4*s, s, green2); px(ctx, x+2*s, ty-4*s, s, green1); px(ctx, x+3*s, ty-4*s, s, green2); px(ctx, x+4*s, ty-4*s, s, green3);
    px(ctx, x, ty-5*s, s, green1); px(ctx, x+s, ty-5*s, s, green2); px(ctx, x+2*s, ty-5*s, s, green1); px(ctx, x+3*s, ty-5*s, s, green2);
    px(ctx, x+s, ty-6*s, s, green1); px(ctx, x+2*s, ty-6*s, s, green2);
  }
};

const drawBuilding = (ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number) => {
  const wall1 = "#37474F";
  const wall2 = "#455A64";
  const roof = "#263238";
  const window1 = "#FFC107";
  const window2 = "#FFE082";
  const door = "#5D4037";

  const floors = 3 + variant * 2;
  const width = 6 + variant * 2;

  // Walls
  for (let row = 0; row < floors; row++) {
    for (let col = 0; col < width; col++) {
      const c = (col + row) % 2 === 0 ? wall1 : wall2;
      px(ctx, x + col * s, groundY - (row + 1) * s, s, c);
    }
  }
  // Roof
  for (let col = -1; col <= width; col++) {
    px(ctx, x + col * s, groundY - (floors + 1) * s, s, roof);
  }
  // Windows
  for (let row = 1; row < floors; row += 2) {
    for (let col = 1; col < width - 1; col += 2) {
      const wc = Math.random() > 0.3 ? window1 : window2;
      px(ctx, x + col * s, groundY - (row + 1) * s, s, wc);
    }
  }
  // Door
  px(ctx, x + Math.floor(width/2)*s, groundY - s, s, door);
  px(ctx, x + Math.floor(width/2)*s, groundY - 2*s, s, door);
};

const drawLamp = (ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number) => {
  const pole = "#78909C";
  const light = "#FFC107";
  for (let i = 0; i < 5; i++) px(ctx, x, groundY - (i+1)*s, s, pole);
  px(ctx, x-s, groundY-6*s, s, pole);
  px(ctx, x, groundY-6*s, s, pole);
  px(ctx, x+s, groundY-6*s, s, pole);
  px(ctx, x, groundY-7*s, s, light);
  // Glow
  ctx.fillStyle = "rgba(255, 193, 7, 0.08)";
  ctx.beginPath();
  ctx.arc(x + s/2, groundY - 6*s, s*4, 0, Math.PI*2);
  ctx.fill();
};

// ─── Scene entities ───
interface SceneEntity {
  type: "character" | "tree" | "building" | "lamp";
  x: number;
  groundY: number;
  drawFn?: DrawFn;
  palette?: Palette;
  variant?: number;
  frame: number;
  dx: number;
  scale: number;
}

const CHARACTER_DRAWS: DrawFn[] = [drawStanding, drawWalking, drawTyping, drawDancing, drawSelling, drawTalking, drawSitting];

const PixelPeopleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const entitiesRef = useRef<SceneEntity[]>([]);
  const lastFrameTime = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateScene();
    };

    const generateScene = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const entities: SceneEntity[] = [];
      const s = 3; // pixel size
      const groundY = h - 30; // ground line

      // Place buildings in the back
      const buildingPositions = [0.05, 0.18, 0.35, 0.52, 0.7, 0.85];
      buildingPositions.forEach((pct) => {
        const bx = w * pct + (Math.random() - 0.5) * 30;
        entities.push({
          type: "building",
          x: bx,
          groundY,
          variant: Math.floor(Math.random() * 3),
          frame: 0,
          dx: 0,
          scale: s,
        });
      });

      // Place trees
      const treePcts = [0.02, 0.12, 0.28, 0.42, 0.58, 0.73, 0.88, 0.95];
      treePcts.forEach((pct) => {
        entities.push({
          type: "tree",
          x: w * pct + (Math.random() - 0.5) * 20,
          groundY,
          variant: Math.random() > 0.5 ? 0 : 1,
          frame: 0,
          dx: 0,
          scale: s,
        });
      });

      // Place street lamps
      for (let i = 0; i < 5; i++) {
        entities.push({
          type: "lamp",
          x: w * (0.1 + i * 0.2) + (Math.random()-0.5)*30,
          groundY,
          frame: 0,
          dx: 0,
          scale: s,
        });
      }

      // Place characters on the ground
      const numChars = Math.floor(w / 60);
      for (let i = 0; i < numChars; i++) {
        const fnIdx = Math.floor(Math.random() * CHARACTER_DRAWS.length);
        const isWalker = fnIdx === 1;
        entities.push({
          type: "character",
          x: (i / numChars) * w + (Math.random() - 0.5) * 40,
          groundY: groundY - 2, // feet on ground
          drawFn: CHARACTER_DRAWS[fnIdx],
          palette: randomPalette(),
          frame: Math.random() > 0.5 ? 0 : 1,
          dx: isWalker ? (Math.random() > 0.5 ? 0.2 : -0.2) : 0,
          scale: s,
        });
      }

      // Sort by y (depth) so buildings/trees in back, characters in front
      entities.sort((a, b) => {
        const order = { building: 0, tree: 1, lamp: 2, character: 3 };
        return order[a.type] - order[b.type];
      });

      entitiesRef.current = entities;
    };

    const drawGround = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const groundY = h - 30;
      // Road
      ctx.fillStyle = "#263238";
      ctx.fillRect(0, groundY, w, 30);
      // Road lines
      ctx.fillStyle = "#37474F";
      for (let x = 0; x < w; x += 24) {
        ctx.fillRect(x, groundY + 13, 12, 3);
      }
      // Curb
      ctx.fillStyle = "#455A64";
      ctx.fillRect(0, groundY - 2, w, 2);
    };

    const drawSky = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // Gradient sky matching the dark theme
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "hsl(0, 0%, 9%)");
      grad.addColorStop(0.4, "hsl(0, 0%, 11%)");
      grad.addColorStop(0.7, "hsl(260, 10%, 14%)");
      grad.addColorStop(1, "hsl(0, 0%, 12%)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 40; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.5;
        ctx.fillRect(sx, sy, 2, 2);
      }
    };

    const animate = (time: number) => {
      if (time - lastFrameTime.current > 800) {
        lastFrameTime.current = time;
        const w = canvas.offsetWidth;
        entitiesRef.current.forEach((e) => {
          e.frame = e.frame === 0 ? 1 : 0;
          if (e.dx !== 0) {
            e.x += e.dx * 8;
            if (e.x > w + 40) e.x = -60;
            if (e.x < -70) e.x = w + 30;
          }
        });
      }

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      drawSky(ctx, w, h);

      ctx.globalAlpha = 0.25;
      entitiesRef.current.forEach((e) => {
        const s = e.scale;
        if (e.type === "building") {
          drawBuilding(ctx, e.x, e.groundY, s, e.variant || 0);
        } else if (e.type === "tree") {
          drawTree(ctx, e.x, e.groundY, s, e.variant || 0);
        } else if (e.type === "lamp") {
          drawLamp(ctx, e.x, e.groundY, s);
        } else if (e.type === "character" && e.drawFn && e.palette) {
          e.drawFn(ctx, e.x, e.groundY - 8*s, s, e.palette, e.frame);
        }
      });
      ctx.globalAlpha = 1;

      drawGround(ctx, w, h);

      animRef.current = requestAnimationFrame(animate);
    };

    resize();
    animRef.current = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default PixelPeopleBackground;
