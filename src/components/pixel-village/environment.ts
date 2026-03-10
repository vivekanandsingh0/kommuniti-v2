const px = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), s, s);
};

// ─── Skyline silhouette (far background) ───
export const drawSkyline = (ctx: CanvasRenderingContext2D, w: number, baseY: number, s: number) => {
  // Generate a repeating cityscape silhouette
  const buildings = [
    { w: 8, h: 18 }, { w: 5, h: 12 }, { w: 10, h: 25 }, { w: 6, h: 14 },
    { w: 12, h: 30 }, { w: 4, h: 10 }, { w: 7, h: 20 }, { w: 9, h: 16 },
    { w: 5, h: 22 }, { w: 11, h: 28 }, { w: 6, h: 11 }, { w: 8, h: 24 },
    { w: 4, h: 15 }, { w: 10, h: 20 }, { w: 7, h: 26 }, { w: 5, h: 13 },
    { w: 9, h: 32 }, { w: 6, h: 17 }, { w: 8, h: 21 }, { w: 4, h: 9 },
  ];

  let cx = 0;
  const color1 = "rgba(20, 20, 30, 0.6)";
  const color2 = "rgba(25, 25, 40, 0.5)";
  const winColor = "rgba(255, 193, 7, 0.15)";

  let idx = 0;
  while (cx < w + 20) {
    const b = buildings[idx % buildings.length];
    const bw = b.w * s;
    const bh = b.h * s;
    const by = baseY - bh;

    // Building body
    ctx.fillStyle = idx % 2 === 0 ? color1 : color2;
    ctx.fillRect(cx, by, bw, bh);

    // Antenna/spire on tall buildings
    if (b.h > 22) {
      ctx.fillStyle = "rgba(30, 30, 45, 0.7)";
      ctx.fillRect(cx + bw / 2 - s / 2, by - 4 * s, s, 4 * s);
      // Blinking light
      ctx.fillStyle = "rgba(255, 50, 50, 0.4)";
      ctx.fillRect(cx + bw / 2 - s / 2, by - 4 * s, s, s);
    }

    // Tiny windows
    for (let wy = by + 2 * s; wy < baseY - 2 * s; wy += 3 * s) {
      for (let wx = cx + s; wx < cx + bw - s; wx += 3 * s) {
        if (Math.random() > 0.4) {
          ctx.fillStyle = winColor;
          ctx.fillRect(wx, wy, s, s);
        }
      }
    }

    cx += bw + s * (1 + Math.floor(idx % 3));
    idx++;
  }
};

// ─── Trees ───
export const drawTree = (ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number) => {
  const greens = [
    ["#1B5E20", "#2E7D32", "#388E3C", "#43A047"],
    ["#004D40", "#00695C", "#00796B", "#00897B"],
    ["#33691E", "#558B2F", "#689F38", "#7CB342"],
  ];
  const g = greens[variant % greens.length];
  const trunk = "#4E342E";
  const trunkD = "#3E2723";

  if (variant === 0) {
    for (let i = 0; i < 3; i++) { px(ctx, x+s, groundY-(i+1)*s, s, trunk); px(ctx, x+2*s, groundY-(i+1)*s, s, trunkD); }
    const ty = groundY - 4*s;
    for (let r = 0; r < 4; r++) for (let c = -1; c < 5; c++) {
      if (r===0 && (c<1||c>3)) continue;
      if (r===3 && (c<0||c>4)) continue;
      px(ctx, x+c*s, ty-r*s, s, g[(r+c+4)%4]);
    }
  } else if (variant === 1) {
    for (let i = 0; i < 5; i++) { px(ctx, x+2*s, groundY-(i+1)*s, s, trunk); }
    const ty = groundY - 6*s;
    const rows = [[2],[1,2,3],[0,1,2,3,4],[-1,0,1,2,3,4,5],[0,1,2,3,4],[1,2,3],[2]];
    rows.forEach((cols, r) => { cols.forEach(c => px(ctx, x+c*s, ty-r*s, s, g[(r+c+8)%4])); });
  } else {
    for (let i = 0; i < 4; i++) { px(ctx, x+s, groundY-(i+1)*s, s, trunk); px(ctx, x+2*s, groundY-(i+1)*s, s, trunkD); }
    const ty = groundY - 5*s;
    const rows = [[0,1,2,3],[0,1,2,3],[-1,0,1,2,3,4],[-1,0,1,2,3,4],[0,1,2,3],[1,2]];
    rows.forEach((cols, r) => { cols.forEach(c => px(ctx, x+c*s, ty-r*s, s, g[(r+c+6)%4])); });
  }
};

// ─── Buildings ───
export const drawBuilding = (ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number, frame: number) => {
  const walls: [string, string][] = [
    ["#37474F", "#455A64"],
    ["#3E2723", "#4E342E"],
    ["#263238", "#37474F"],
    ["#4E342E", "#5D4037"],
  ];
  const [w1, w2] = walls[variant % walls.length];
  const roofColors = ["#1A237E", "#B71C1C", "#E65100", "#1B5E20", "#4A148C"];
  const roofColor = roofColors[variant % roofColors.length];
  const signColors = ["#E91E63", "#FFC107", "#00BCD4", "#FF9800", "#9C27B0"];

  const floors = 4 + variant * 2;
  const width = 7 + variant * 2;

  // Main walls
  for (let row = 0; row < floors; row++) {
    for (let col = 0; col < width; col++) {
      px(ctx, x + col * s, groundY - (row + 1) * s, s, (col + row) % 3 === 0 ? w1 : w2);
    }
  }

  // Roof
  for (let col = -1; col <= width; col++) {
    px(ctx, x + col * s, groundY - (floors + 1) * s, s, roofColor);
    px(ctx, x + col * s, groundY - (floors + 2) * s, s, roofColor);
  }
  for (let col = 0; col < width; col++) {
    px(ctx, x + col * s, groundY - (floors + 3) * s, s, roofColor);
  }

  // Windows with warm glow - deterministic based on position
  for (let row = 1; row < floors - 1; row += 2) {
    for (let col = 1; col < width - 1; col += 3) {
      const lit = ((row * 7 + col * 13 + variant * 3) % 5) !== 0;
      const wColor = lit
        ? (frame === 0 ? "#FFC107" : "#FFD54F")
        : "#1A1A1A";
      const wFrame = "#5D4037";
      px(ctx, x + col * s, groundY - (row + 1) * s, s, wFrame);
      px(ctx, x + (col+1) * s, groundY - (row + 1) * s, s, wFrame);
      px(ctx, x + col * s, groundY - (row + 2) * s, s, wFrame);
      px(ctx, x + (col+1) * s, groundY - (row + 2) * s, s, wFrame);
      px(ctx, x + col * s, groundY - (row + 1) * s, s * 0.8, wColor);
      px(ctx, x + (col+1) * s, groundY - (row + 1) * s, s * 0.8, wColor);
      if (lit) {
        ctx.fillStyle = `rgba(255, 193, 7, 0.08)`;
        ctx.fillRect(x + (col-1) * s, groundY - (row + 3) * s, 4 * s, 4 * s);
      }
    }
  }

  // Shop sign on ground floor
  if (variant <= 2) {
    const signColor = signColors[variant % signColors.length];
    for (let col = 1; col < Math.min(width - 1, 5); col++) {
      px(ctx, x + col * s, groundY - (floors) * s - s * 0.5, s * 0.6, signColor);
    }
  }

  // Door
  const doorX = Math.floor(width / 2);
  px(ctx, x + doorX * s, groundY - s, s, "#5D4037");
  px(ctx, x + doorX * s, groundY - 2*s, s, "#5D4037");
  px(ctx, x + (doorX+1) * s, groundY - s, s, "#4E342E");
  px(ctx, x + (doorX+1) * s, groundY - 2*s, s, "#4E342E");
  // Door light
  ctx.fillStyle = "rgba(255, 193, 7, 0.1)";
  ctx.fillRect(x + (doorX-1) * s, groundY - 3*s, 4 * s, 3 * s);
  px(ctx, x + (doorX+1) * s + s*0.6, groundY - s - s*0.3, s*0.3, "#FFC107");

  // Balcony
  if (variant >= 1 && floors >= 6) {
    const bRow = 3;
    for (let col = 0; col < width; col++) {
      px(ctx, x + col * s, groundY - (bRow + 1) * s + s*0.7, s, "#78909C");
    }
    for (let col = 0; col < width; col += 2) {
      px(ctx, x + col * s, groundY - (bRow + 2) * s + s*0.7, s*0.5, "#90A4AE");
    }
  }

  // Chimney on some buildings
  if (variant === 0 || variant === 3) {
    px(ctx, x + 2*s, groundY - (floors+3)*s, s, "#5D4037");
    px(ctx, x + 2*s, groundY - (floors+4)*s, s, "#5D4037");
    px(ctx, x + 3*s, groundY - (floors+3)*s, s, "#4E342E");
    px(ctx, x + 3*s, groundY - (floors+4)*s, s, "#4E342E");
    // Smoke
    if (frame === 1) {
      ctx.fillStyle = "rgba(200,200,200,0.15)";
      ctx.fillRect(x + 2*s, groundY - (floors+5)*s, s, s);
      ctx.fillRect(x + 3*s, groundY - (floors+6)*s, s, s);
    }
  }
};

// ─── Street Lamps ───
export const drawLamp = (ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, frame: number) => {
  const pole = "#78909C";
  for (let i = 0; i < 7; i++) px(ctx, x+s, groundY - (i+1)*s, s, pole);
  px(ctx, x, groundY-8*s, s, pole); px(ctx, x+s, groundY-8*s, s, pole); px(ctx, x+2*s, groundY-8*s, s, pole);
  const brightness = frame === 0 ? 1 : 0.75;
  px(ctx, x+s, groundY-9*s, s, `rgba(255,193,7,${brightness})`);
  ctx.save();
  // Glow cone
  ctx.globalAlpha = frame === 0 ? 0.12 : 0.07;
  ctx.fillStyle = "#FFC107";
  ctx.beginPath();
  ctx.moveTo(x, groundY - 8*s);
  ctx.lineTo(x - 4*s, groundY);
  ctx.lineTo(x + 6*s, groundY);
  ctx.closePath();
  ctx.fill();
  // Radial glow
  const grd = ctx.createRadialGradient(x+s, groundY-8*s, s, x+s, groundY-8*s, s*10);
  grd.addColorStop(0, `rgba(255,193,7,${frame === 0 ? 0.18 : 0.12})`);
  grd.addColorStop(1, "rgba(255,193,7,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(x - 8*s, groundY - 14*s, 18*s, 16*s);
  ctx.restore();
  px(ctx, x, groundY, s, "#546E7A"); px(ctx, x+s, groundY, s, "#546E7A"); px(ctx, x+2*s, groundY, s, "#546E7A");
};

// ─── Clouds ───
export const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, variant: number) => {
  const c = `rgba(255,255,255,${variant === 0 ? 0.05 : 0.08})`;
  if (variant === 0) {
    const cols = [[1,2,3],[0,1,2,3,4],[1,2,3]];
    cols.forEach((row, r) => row.forEach(col => px(ctx, x+col*s, y+r*s, s, c)));
  } else {
    const cols = [[2,3,4],[1,2,3,4,5],[0,1,2,3,4,5,6],[1,2,3,4,5],[2,3,4]];
    cols.forEach((row, r) => row.forEach(col => px(ctx, x+col*s, y+r*s, s, c)));
  }
};

// ─── Sky ───
export const drawSky = (ctx: CanvasRenderingContext2D, w: number, h: number, stars: {x:number,y:number,b:number}[], frame: number) => {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "hsl(240, 18%, 7%)");
  grad.addColorStop(0.2, "hsl(250, 15%, 9%)");
  grad.addColorStop(0.5, "hsl(260, 12%, 12%)");
  grad.addColorStop(0.75, "hsl(255, 10%, 14%)");
  grad.addColorStop(1, "hsl(250, 8%, 12%)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Stars
  stars.forEach(star => {
    const twinkle = frame === 0 ? star.b : star.b * (0.4 + Math.random() * 0.6);
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.fillRect(star.x, star.y, 2, 2);
  });

  // Moon with crescent
  const mx = w * 0.82, my = h * 0.1;
  // Moon glow
  const moonGlow = ctx.createRadialGradient(mx, my, 5, mx, my, 40);
  moonGlow.addColorStop(0, "rgba(255,255,230,0.12)");
  moonGlow.addColorStop(1, "rgba(255,255,230,0)");
  ctx.fillStyle = moonGlow;
  ctx.fillRect(mx - 40, my - 40, 80, 80);
  // Moon body
  ctx.fillStyle = "rgba(255,255,230,0.15)";
  ctx.beginPath();
  ctx.arc(mx, my, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,230,0.2)";
  ctx.beginPath();
  ctx.arc(mx, my, 14, 0, Math.PI * 2);
  ctx.fill();
  // Crescent shadow
  ctx.fillStyle = "hsl(240, 18%, 7%)";
  ctx.beginPath();
  ctx.arc(mx + 6, my - 3, 13, 0, Math.PI * 2);
  ctx.fill();
};

// ─── Ground ───
export const drawGround = (ctx: CanvasRenderingContext2D, w: number, groundY: number) => {
  // Grass strip
  ctx.fillStyle = "#1B5E20";
  ctx.fillRect(0, groundY - 4, w, 4);
  ctx.fillStyle = "#2E7D32";
  for (let lx = 0; lx < w; lx += 6) {
    ctx.fillRect(lx, groundY - 6, 3, 2);
  }
  // Sidewalk
  ctx.fillStyle = "#455A64";
  ctx.fillRect(0, groundY, w, 6);
  ctx.fillStyle = "#546E7A";
  for (let lx = 0; lx < w; lx += 12) {
    ctx.fillRect(lx, groundY, 1, 6);
  }
  // Road
  ctx.fillStyle = "#1A1A1A";
  ctx.fillRect(0, groundY + 6, w, 40);
  // Lane markings
  ctx.fillStyle = "#FFC107";
  for (let lx = 0; lx < w; lx += 30) {
    ctx.fillRect(lx, groundY + 24, 14, 2);
  }
  // Road edge lines
  ctx.fillStyle = "#333";
  ctx.fillRect(0, groundY + 6, w, 1);
  ctx.fillRect(0, groundY + 45, w, 1);
  // Bottom sidewalk
  ctx.fillStyle = "#37474F";
  ctx.fillRect(0, groundY + 46, w, 20);
};
