const px = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), s, s);
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
    // Small bush tree
    for (let i = 0; i < 3; i++) { px(ctx, x+s, groundY-(i+1)*s, s, trunk); px(ctx, x+2*s, groundY-(i+1)*s, s, trunkD); }
    const ty = groundY - 4*s;
    for (let r = 0; r < 4; r++) for (let c = -1; c < 5; c++) {
      if (r===0 && (c<1||c>3)) continue;
      if (r===3 && (c<0||c>4)) continue;
      px(ctx, x+c*s, ty-r*s, s, g[(r+c+4)%4]);
    }
  } else if (variant === 1) {
    // Tall pine
    for (let i = 0; i < 5; i++) { px(ctx, x+2*s, groundY-(i+1)*s, s, trunk); }
    const ty = groundY - 6*s;
    const rows = [[2],[1,2,3],[0,1,2,3,4],[-1,0,1,2,3,4,5],[0,1,2,3,4],[1,2,3],[2]];
    rows.forEach((cols, r) => {
      cols.forEach(c => px(ctx, x+c*s, ty-r*s, s, g[(r+c+8)%4]));
    });
  } else {
    // Round tree
    for (let i = 0; i < 4; i++) { px(ctx, x+s, groundY-(i+1)*s, s, trunk); px(ctx, x+2*s, groundY-(i+1)*s, s, trunkD); }
    const ty = groundY - 5*s;
    const rows = [[0,1,2,3],[0,1,2,3],[-1,0,1,2,3,4],[-1,0,1,2,3,4],[0,1,2,3],[1,2]];
    rows.forEach((cols, r) => {
      cols.forEach(c => px(ctx, x+c*s, ty-r*s, s, g[(r+c+6)%4]));
    });
  }
};

// ─── Buildings ───
export const drawBuilding = (ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, variant: number, frame: number) => {
  const walls = [
    ["#37474F", "#455A64"],
    ["#3E2723", "#4E342E"],
    ["#263238", "#37474F"],
    ["#4E342E", "#5D4037"],
  ];
  const [w1, w2] = walls[variant % walls.length];
  const roofColors = ["#1A237E", "#B71C1C", "#E65100", "#1B5E20", "#4A148C"];
  const roofColor = roofColors[variant % roofColors.length];

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
  // Roof peak
  for (let col = 0; col < width; col++) {
    px(ctx, x + col * s, groundY - (floors + 3) * s, s, roofColor);
  }

  // Windows with warm glow
  for (let row = 1; row < floors - 1; row += 2) {
    for (let col = 1; col < width - 1; col += 3) {
      const lit = Math.random() > 0.2;
      const wColor = lit
        ? (frame === 0 ? "#FFC107" : "#FFD54F")
        : "#1A1A1A";
      const wFrame = "#5D4037";
      // Window frame
      px(ctx, x + col * s, groundY - (row + 1) * s, s, wFrame);
      px(ctx, x + (col+1) * s, groundY - (row + 1) * s, s, wFrame);
      px(ctx, x + col * s, groundY - (row + 2) * s, s, wFrame);
      px(ctx, x + (col+1) * s, groundY - (row + 2) * s, s, wFrame);
      // Window glass
      px(ctx, x + col * s, groundY - (row + 1) * s, s * 0.8, wColor);
      px(ctx, x + (col+1) * s, groundY - (row + 1) * s, s * 0.8, wColor);
      // Window glow
      if (lit) {
        ctx.fillStyle = `rgba(255, 193, 7, 0.06)`;
        ctx.fillRect(x + (col-1) * s, groundY - (row + 3) * s, 4 * s, 4 * s);
      }
    }
  }

  // Door
  const doorX = Math.floor(width / 2);
  px(ctx, x + doorX * s, groundY - s, s, "#5D4037");
  px(ctx, x + doorX * s, groundY - 2*s, s, "#5D4037");
  px(ctx, x + (doorX+1) * s, groundY - s, s, "#4E342E");
  px(ctx, x + (doorX+1) * s, groundY - 2*s, s, "#4E342E");
  // Door handle
  px(ctx, x + (doorX+1) * s + s*0.6, groundY - s - s*0.3, s*0.3, "#FFC107");

  // Balcony (for taller buildings)
  if (variant >= 1 && floors >= 6) {
    const bRow = 3;
    for (let col = 0; col < width; col++) {
      px(ctx, x + col * s, groundY - (bRow + 1) * s + s*0.7, s, "#78909C");
    }
    // Railing
    for (let col = 0; col < width; col += 2) {
      px(ctx, x + col * s, groundY - (bRow + 2) * s + s*0.7, s*0.5, "#90A4AE");
    }
  }
};

// ─── Street Lamps ───
export const drawLamp = (ctx: CanvasRenderingContext2D, x: number, groundY: number, s: number, frame: number) => {
  const pole = "#78909C";
  // Post
  for (let i = 0; i < 7; i++) px(ctx, x+s, groundY - (i+1)*s, s, pole);
  // Lamp arm
  px(ctx, x, groundY-8*s, s, pole); px(ctx, x+s, groundY-8*s, s, pole); px(ctx, x+2*s, groundY-8*s, s, pole);
  // Bulb
  const brightness = frame === 0 ? 0.9 : 0.7;
  px(ctx, x+s, groundY-9*s, s, `rgba(255,193,7,${brightness})`);
  // Glow cone
  ctx.save();
  ctx.globalAlpha = frame === 0 ? 0.08 : 0.05;
  ctx.fillStyle = "#FFC107";
  ctx.beginPath();
  ctx.moveTo(x, groundY - 8*s);
  ctx.lineTo(x - 3*s, groundY);
  ctx.lineTo(x + 5*s, groundY);
  ctx.closePath();
  ctx.fill();
  // Radial glow
  const grd = ctx.createRadialGradient(x+s, groundY-8*s, s, x+s, groundY-8*s, s*8);
  grd.addColorStop(0, `rgba(255,193,7,${frame === 0 ? 0.12 : 0.08})`);
  grd.addColorStop(1, "rgba(255,193,7,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(x - 6*s, groundY - 12*s, 14*s, 14*s);
  ctx.restore();
  // Base
  px(ctx, x, groundY, s, "#546E7A"); px(ctx, x+s, groundY, s, "#546E7A"); px(ctx, x+2*s, groundY, s, "#546E7A");
};

// ─── Clouds ───
export const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, variant: number) => {
  const c = `rgba(255,255,255,${variant === 0 ? 0.04 : 0.06})`;
  if (variant === 0) {
    // Small cloud
    const cols = [[1,2,3],[0,1,2,3,4],[1,2,3]];
    cols.forEach((row, r) => row.forEach(col => px(ctx, x+col*s, y+r*s, s, c)));
  } else {
    // Large cloud
    const cols = [[2,3,4],[1,2,3,4,5],[0,1,2,3,4,5,6],[1,2,3,4,5],[2,3,4]];
    cols.forEach((row, r) => row.forEach(col => px(ctx, x+col*s, y+r*s, s, c)));
  }
};

// ─── Sky ───
export const drawSky = (ctx: CanvasRenderingContext2D, w: number, h: number, stars: {x:number,y:number,b:number}[], frame: number) => {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "hsl(240, 15%, 8%)");
  grad.addColorStop(0.3, "hsl(250, 12%, 10%)");
  grad.addColorStop(0.6, "hsl(260, 10%, 13%)");
  grad.addColorStop(0.85, "hsl(250, 8%, 15%)");
  grad.addColorStop(1, "hsl(0, 0%, 12%)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Stars with twinkle
  stars.forEach(star => {
    const twinkle = frame === 0 ? star.b : star.b * (0.5 + Math.random() * 0.5);
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.fillRect(star.x, star.y, 2, 2);
  });

  // Moon
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.12, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.12, 15, 0, Math.PI * 2);
  ctx.fill();
};

// ─── Ground ───
export const drawGround = (ctx: CanvasRenderingContext2D, w: number, groundY: number) => {
  // Sidewalk
  ctx.fillStyle = "#37474F";
  ctx.fillRect(0, groundY - 3, w, 6);
  // Road
  ctx.fillStyle = "#212121";
  ctx.fillRect(0, groundY + 3, w, 40);
  // Lane markings
  ctx.fillStyle = "#424242";
  for (let lx = 0; lx < w; lx += 30) {
    ctx.fillRect(lx, groundY + 21, 14, 3);
  }
  // Curb
  ctx.fillStyle = "#546E7A";
  ctx.fillRect(0, groundY, w, 3);
  // Bottom sidewalk
  ctx.fillStyle = "#2D2D2D";
  ctx.fillRect(0, groundY + 43, w, 20);
  // Pathway lines
  ctx.fillStyle = "#3E3E3E";
  for (let lx = 0; lx < w; lx += 8) {
    ctx.fillRect(lx, groundY + 46, 4, 2);
  }
};
