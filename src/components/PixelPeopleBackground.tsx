import { useEffect, useRef } from "react";

// Pixel character definitions - each is a grid of colored cells
// 0 = transparent, 1 = skin, 2 = hair/dark, 3 = shirt, 4 = pants, 5 = accent, 6 = laptop/item
const COLORS: Record<string, string[]> = {
  warm: ["transparent", "#D4A574", "#4A3728", "#E91E63", "#2D2D2D", "#FFC107", "#5C6BC0"],
  cool: ["transparent", "#C8A882", "#3D2E1F", "#5C6BC0", "#2D2D2D", "#FFC107", "#E91E63"],
  earth: ["transparent", "#BF9B7A", "#2D2D2D", "#4CAF50", "#3E2723", "#FFC107", "#FF9800"],
  muted: ["transparent", "#D4A574", "#5D4037", "#78909C", "#37474F", "#FFC107", "#E91E63"],
};

type CharFrame = number[][];

// Standing & waving character (2 frames)
const WAVING: CharFrame[] = [
  [
    [0,0,2,2,2,0,0],
    [0,2,1,1,1,2,0],
    [0,0,1,1,1,0,0],
    [0,3,3,3,3,5,0],
    [5,0,3,3,3,0,0],
    [0,0,3,3,3,0,0],
    [0,0,4,0,4,0,0],
    [0,0,4,0,4,0,0],
    [0,4,4,0,4,4,0],
  ],
  [
    [0,0,2,2,2,0,0],
    [0,2,1,1,1,2,0],
    [0,0,1,1,1,0,5],
    [0,3,3,3,3,3,0],
    [0,0,3,3,3,0,0],
    [0,0,3,3,3,0,0],
    [0,0,4,0,4,0,0],
    [0,0,4,0,4,0,0],
    [0,4,4,0,4,4,0],
  ],
];

// Walking character (2 frames)
const WALKING: CharFrame[] = [
  [
    [0,0,2,2,2,0,0],
    [0,2,1,1,1,2,0],
    [0,0,1,1,1,0,0],
    [0,0,3,3,3,0,0],
    [0,0,3,3,3,0,0],
    [0,0,3,3,3,0,0],
    [0,0,4,0,4,0,0],
    [0,4,0,0,0,4,0],
    [4,4,0,0,0,4,4],
  ],
  [
    [0,0,2,2,2,0,0],
    [0,2,1,1,1,2,0],
    [0,0,1,1,1,0,0],
    [0,0,3,3,3,0,0],
    [0,0,3,3,3,0,0],
    [0,0,3,3,3,0,0],
    [0,4,0,0,0,4,0],
    [4,0,0,0,0,0,4],
    [4,4,0,0,0,4,4],
  ],
];

// Typing on laptop (2 frames)
const TYPING: CharFrame[] = [
  [
    [0,0,2,2,2,0,0,0,0],
    [0,2,1,1,1,2,0,0,0],
    [0,0,1,1,1,0,0,0,0],
    [0,0,3,3,3,0,0,0,0],
    [0,0,3,3,3,6,6,6,0],
    [0,0,3,3,6,6,6,6,6],
    [0,0,4,0,4,0,0,0,0],
    [0,0,4,0,4,0,0,0,0],
    [0,4,4,0,4,4,0,0,0],
  ],
  [
    [0,0,2,2,2,0,0,0,0],
    [0,2,1,1,1,2,0,0,0],
    [0,0,1,1,1,0,0,0,0],
    [0,0,3,3,3,0,0,0,0],
    [0,3,3,3,3,6,6,6,0],
    [0,0,3,3,6,6,6,6,6],
    [0,0,4,0,4,0,0,0,0],
    [0,0,4,0,4,0,0,0,0],
    [0,4,4,0,4,4,0,0,0],
  ],
];

// Dancing character (2 frames)
const DANCING: CharFrame[] = [
  [
    [0,0,2,2,2,0,0],
    [0,2,1,1,1,2,0],
    [0,0,1,1,1,0,0],
    [5,0,3,3,3,0,5],
    [0,0,3,3,3,0,0],
    [0,0,3,3,3,0,0],
    [0,0,4,0,4,0,0],
    [0,4,0,0,0,4,0],
    [4,4,0,0,0,4,4],
  ],
  [
    [0,0,2,2,2,0,0],
    [0,2,1,1,1,2,0],
    [0,0,1,1,1,0,0],
    [0,5,3,3,3,5,0],
    [0,0,3,3,3,0,0],
    [0,0,3,3,3,0,0],
    [0,4,0,0,0,4,0],
    [4,0,0,0,0,0,4],
    [4,0,0,0,0,0,4],
  ],
];

// Standing looking around (2 frames)
const LOOKING: CharFrame[] = [
  [
    [0,0,2,2,2,0,0],
    [0,2,1,1,1,2,0],
    [0,0,2,1,1,0,0],
    [0,0,3,3,3,0,0],
    [0,3,3,3,3,3,0],
    [0,0,3,3,3,0,0],
    [0,0,4,0,4,0,0],
    [0,0,4,0,4,0,0],
    [0,4,4,0,4,4,0],
  ],
  [
    [0,0,2,2,2,0,0],
    [0,2,1,1,1,2,0],
    [0,0,1,1,2,0,0],
    [0,0,3,3,3,0,0],
    [0,3,3,3,3,3,0],
    [0,0,3,3,3,0,0],
    [0,0,4,0,4,0,0],
    [0,0,4,0,4,0,0],
    [0,4,4,0,4,4,0],
  ],
];

const CHARACTER_TYPES = [WAVING, WALKING, TYPING, DANCING, LOOKING];
const PALETTE_KEYS = Object.keys(COLORS);

interface Character {
  x: number;
  y: number;
  type: CharFrame[];
  palette: string[];
  frame: number;
  scale: number;
  opacity: number;
}

const PixelPeopleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const charsRef = useRef<Character[]>([]);
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
      ctx.scale(dpr, dpr);
      generateCharacters();
    };

    const generateCharacters = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const chars: Character[] = [];
      const spacing = 120;
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Skip some positions randomly for organic feel
          if (Math.random() < 0.35) continue;

          const typeIdx = Math.floor(Math.random() * CHARACTER_TYPES.length);
          const paletteIdx = Math.floor(Math.random() * PALETTE_KEYS.length);
          chars.push({
            x: col * spacing + (Math.random() - 0.5) * 40 + 30,
            y: row * spacing + (Math.random() - 0.5) * 30 + 20,
            type: CHARACTER_TYPES[typeIdx],
            palette: COLORS[PALETTE_KEYS[paletteIdx]],
            frame: Math.random() > 0.5 ? 0 : 1,
            scale: 3 + Math.random() * 1.5,
            opacity: 0.12 + Math.random() * 0.12,
          });
        }
      }
      charsRef.current = chars;
    };

    const drawChar = (char: Character, ctx: CanvasRenderingContext2D) => {
      const grid = char.type[char.frame];
      ctx.globalAlpha = char.opacity;
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const val = grid[r][c];
          if (val === 0) continue;
          ctx.fillStyle = char.palette[val] || "#888";
          ctx.fillRect(
            char.x + c * char.scale,
            char.y + r * char.scale,
            char.scale,
            char.scale
          );
        }
      }
      ctx.globalAlpha = 1;
    };

    const animate = (time: number) => {
      // Toggle frames every 800ms
      if (time - lastFrameTime.current > 800) {
        lastFrameTime.current = time;
        charsRef.current.forEach((c) => {
          c.frame = c.frame === 0 ? 1 : 0;
        });
      }

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      charsRef.current.forEach((c) => drawChar(c, ctx));
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
