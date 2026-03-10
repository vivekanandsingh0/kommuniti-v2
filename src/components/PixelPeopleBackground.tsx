import { useEffect, useRef } from "react";
import type { SceneEntity } from "./pixel-village/types";
import { randomPalette } from "./pixel-village/types";
import { CHARACTER_DRAWS } from "./pixel-village/characters";
import { drawTree, drawBuilding, drawLamp, drawCloud, drawSky, drawSkyline, drawGround } from "./pixel-village/environment";

interface Star { x: number; y: number; b: number; }

const PixelPeopleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const entitiesRef = useRef<SceneEntity[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastFrameTime = useRef(0);
  const scrollY = useRef(0);
  const frameCount = useRef(0);
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const hoverRadius = 80;

  // Parallax scroll
  useEffect(() => {
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mouse tracking for hover interactions
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => { mousePos.current = null; };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

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
      const s = 4; // Bigger pixel size for more presence
      const groundY = h - 65;

      // Stars
      const stars: Star[] = [];
      for (let i = 0; i < 120; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.55,
          b: 0.1 + Math.random() * 0.35,
        });
      }
      starsRef.current = stars;

      // Clouds (layer 0)
      for (let i = 0; i < 8; i++) {
        entities.push({
          type: "cloud",
          x: Math.random() * w,
          y: h * 0.05 + Math.random() * h * 0.2,
          variant: Math.random() > 0.5 ? 0 : 1,
          frame: 0,
          dx: 0.015 + Math.random() * 0.025,
          scale: 5 + Math.random() * 4,
          layer: 0,
        });
      }

      // Background buildings as silhouettes (layer 0)
      const bgBuildings = [0.0, 0.1, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.9];
      bgBuildings.forEach((pct, i) => {
        entities.push({
          type: "building",
          x: w * pct + (Math.random() - 0.5) * 10,
          y: groundY,
          variant: i % 4,
          frame: 0,
          dx: 0,
          scale: s * 0.6,
          layer: 0,
        });
      });

      // Trees (layer 1)
      const treePositions = [0.02, 0.11, 0.22, 0.33, 0.45, 0.57, 0.68, 0.79, 0.9, 0.97];
      treePositions.forEach((pct, i) => {
        entities.push({
          type: "tree",
          x: w * pct + (Math.random() - 0.5) * 15,
          y: groundY,
          variant: i % 3,
          frame: 0,
          dx: 0,
          scale: s,
          layer: 1,
        });
      });

      // Lamps (layer 1)
      for (let i = 0; i < 7; i++) {
        entities.push({
          type: "lamp",
          x: w * (0.06 + i * 0.14) + (Math.random() - 0.5) * 15,
          y: groundY,
          variant: 0,
          frame: 0,
          dx: 0,
          scale: s,
          layer: 1,
        });
      }

      // Foreground buildings (layer 1)
      const fgBuildings = [0.04, 0.18, 0.34, 0.5, 0.66, 0.82, 0.95];
      fgBuildings.forEach((pct, i) => {
        entities.push({
          type: "building",
          x: w * pct + (Math.random() - 0.5) * 8,
          y: groundY,
          variant: (i + 2) % 4,
          frame: 0,
          dx: 0,
          scale: s,
          layer: 1,
        });
      });

      // Characters (layer 2)
      const numChars = Math.max(14, Math.floor(w / 55));
      for (let i = 0; i < numChars; i++) {
        const fnIdx = Math.floor(Math.random() * CHARACTER_DRAWS.length);
        const isMoving = fnIdx === 1 || fnIdx === 7;
        const speed = fnIdx === 7 ? 0.4 : 0.2;
        entities.push({
          type: fnIdx === 7 ? "bicycle" : "character",
          x: (i / numChars) * w + (Math.random() - 0.5) * 25,
          y: groundY,
          drawFn: CHARACTER_DRAWS[fnIdx],
          palette: randomPalette(),
          variant: fnIdx,
          frame: Math.random() > 0.5 ? 0 : 1,
          dx: isMoving ? (Math.random() > 0.5 ? speed : -speed) : 0,
          scale: s,
          layer: 2,
        });
      }

      entities.sort((a, b) => a.layer - b.layer || a.y - b.y);
      entitiesRef.current = entities;
    };

    const isNearMouse = (ex: number, ey: number): boolean => {
      if (!mousePos.current) return false;
      const dx = mousePos.current.x - ex;
      const dy = mousePos.current.y - ey;
      return dx * dx + dy * dy < hoverRadius * hoverRadius;
    };

    const animate = (time: number) => {
      if (time - lastFrameTime.current > 650) {
        lastFrameTime.current = time;
        frameCount.current++;
        const w = canvas.offsetWidth;
        entitiesRef.current.forEach((e) => {
          e.frame = e.frame === 0 ? 1 : 0;
          if (e.dx !== 0) {
            e.x += e.dx * 10;
            if (e.type === "cloud") {
              if (e.x > w + 100) e.x = -100;
            } else {
              if (e.x > w + 70) e.x = -90;
              if (e.x < -100) e.x = w + 60;
            }
          }
        });
      }

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const sy = scrollY.current;
      const groundY = h - 65;

      ctx.clearRect(0, 0, w, h);

      // Sky + stars
      drawSky(ctx, w, h, starsRef.current, frameCount.current % 2);

      // Background skyline silhouette (very far back, minimal parallax)
      ctx.save();
      ctx.globalAlpha = 0.3;
      const skylineOffset = sy * 0.02;
      drawSkyline(ctx, w, groundY + skylineOffset, 2);
      ctx.restore();

      // Draw entities
      const parallaxFactors = [0.08, 0.2, 0.35];

      entitiesRef.current.forEach((e) => {
        const pOff = sy * parallaxFactors[e.layer] * 0.12;
        const s = e.scale;
        const ey = e.y + pOff;

        // Base opacity per layer - much more vibrant now
        let opacity = e.layer === 0 ? 0.35 : e.layer === 1 ? 0.6 : 0.8;

        // Hover boost
        const charCenterX = e.x + s * 2.5;
        const charCenterY = ey - s * 4;
        const hovered = isNearMouse(charCenterX, charCenterY);
        if (hovered) {
          opacity = Math.min(1, opacity + 0.3);
        }

        ctx.save();
        ctx.globalAlpha = opacity;

        // Hover glow effect
        if (hovered && (e.type === "character" || e.type === "bicycle")) {
          ctx.shadowColor = "#FFC107";
          ctx.shadowBlur = 12;
        }
        if (hovered && e.type === "building") {
          ctx.shadowColor = "#FFC107";
          ctx.shadowBlur = 8;
        }
        if (hovered && e.type === "lamp") {
          ctx.shadowColor = "#FFC107";
          ctx.shadowBlur = 15;
        }

        if (e.type === "cloud") {
          drawCloud(ctx, e.x, ey, s, e.variant);
        } else if (e.type === "building") {
          drawBuilding(ctx, e.x, ey, s, e.variant, e.frame);
        } else if (e.type === "tree") {
          drawTree(ctx, e.x, ey, s, e.variant);
        } else if (e.type === "lamp") {
          drawLamp(ctx, e.x, ey, s, e.frame);
        } else if ((e.type === "character" || e.type === "bicycle") && e.drawFn && e.palette) {
          e.drawFn(ctx, e.x, ey - 9*s, s, e.palette, e.frame);
        }

        ctx.restore();
      });

      // Ground
      ctx.globalAlpha = 0.7;
      drawGround(ctx, w, groundY);
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(animate);
    };

    resize();
    animRef.current = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0, cursor: "default" }}
    />
  );
};

export default PixelPeopleBackground;
