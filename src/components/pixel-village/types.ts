export interface Palette {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  accent: string;
}

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  p: Palette,
  frame: number
) => void;

export interface SceneEntity {
  type: "character" | "tree" | "building" | "lamp" | "cloud" | "bicycle";
  x: number;
  y: number;
  drawFn?: DrawFn;
  palette?: Palette;
  variant: number;
  frame: number;
  dx: number;
  scale: number;
  layer: number; // 0=far back, 1=mid, 2=foreground
}

export const SKIN = ["#D4A574", "#C8A882", "#BF9B7A", "#E0C097", "#A67C52"];
export const HAIR = ["#4A3728", "#3D2E1F", "#2D2D2D", "#5D4037", "#3E2723", "#1A1A1A"];
export const SHIRTS = ["#E91E63", "#5C6BC0", "#4CAF50", "#78909C", "#FFC107", "#FF9800", "#9C27B0", "#00BCD4", "#FF5722", "#3F51B5"];
export const PANTS = ["#2D2D2D", "#37474F", "#3E2723", "#1A237E", "#212121"];

export const randomPalette = (): Palette => ({
  skin: SKIN[Math.floor(Math.random() * SKIN.length)],
  hair: HAIR[Math.floor(Math.random() * HAIR.length)],
  shirt: SHIRTS[Math.floor(Math.random() * SHIRTS.length)],
  pants: PANTS[Math.floor(Math.random() * PANTS.length)],
  accent: Math.random() > 0.5 ? "#FFC107" : "#FF9800",
});
