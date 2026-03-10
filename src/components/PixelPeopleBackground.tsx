import { useEffect, useRef, useCallback } from "react";
import type { SceneEntity } from "./pixel-village/types";
import { randomPalette } from "./pixel-village/types";
import { CHARACTER_DRAWS } from "./pixel-village/characters";
import { drawTree, drawBuilding, drawLamp, drawCloud, drawSky, drawGround } from "./pixel-village/environment";

interface Star { x: number; y: number; b: number; }

const PixelPeopleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const entitiesRef = useRef<SceneEntity[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastFrameTime = useRef(0);
  const scrollY = useRef(0);
  const frameCount = useRef(0);

  // Parallax scroll listener
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
      const s = 3;
      const groundY = h - 60;

      // Stars
      const stars: Star[] = [];
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.5,
          b: 0.1 + Math.random() * 0.25,
        });
      }
      starsRef.current = stars;

      // Clouds (far background, layer 0)
      for (let i = 0; i < 6; i++) {
        entities.push({
          type: "cloud",
          x: Math.random() * w,
          y: h * 0.05 + Math.random() * h * 0.25,
          variant: Math.random() > 0.5 ? 0 : 1,
          frame: 0,
          dx: 0.02 + Math.random() * 0.03,
          scale: 4 + Math.random() * 3,
          layer: 0,
        });
      }

      // Buildings (layer 0 - far background, silhouettes)
      const bgBuildings = [0.0, 0.12, 0.25, 0.4, 0.55, 0.68, 0.82, 0.92];
      bgBuildings.forEach((pct, i) => {
        entities.push({
          type: "building",
          x: w * pct + (Math.random() - 0.5) * 15,
          y: groundY,
          variant: i % 4,
          frame: 0,
          dx: 0,
          scale: s * 0.7,
          layer: 0,
        });
      });

      // Trees (layer 1 - mid ground)
      const treePositions = [0.03, 0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86, 0.96];
      treePositions.forEach((pct, i) => {
        entities.push({
          type: "tree",
          x: w * pct + (Math.random() - 0.5) * 20,
          y: groundY,
          variant: i % 3,
          frame: 0,
          dx: 0,
          scale: s,
          layer: 1,
        });
      });

      // Lamps (layer 1)
      for (let i = 0; i < 6; i++) {
        entities.push({
          type: "lamp",
          x: w * (0.08 + i * 0.17) + (Math.random() - 0.5) * 20,
          y: groundY,
          variant: 0,
          frame: 0,
          dx: 0,
          scale: s,
          layer: 1,
        });
      }

      // Foreground buildings (layer 1 - closer, detailed)
      const fgBuildings = [0.05, 0.22, 0.42, 0.6, 0.78, 0.93];
      fgBuildings.forEach((pct, i) => {
        entities.push({
          type: "building",
          x: w * pct + (Math.random() - 0.5) * 10,
          y: groundY,
          variant: (i + 2) % 4,
          frame: 0,
          dx: 0,
          scale: s,
          layer: 1,
        });
      });

      // Characters (layer 2 - foreground)
      const numChars = Math.max(10, Math.floor(w / 70));
      for (let i = 0; i < numChars; i++) {
        const fnIdx = Math.floor(Math.random() * CHARACTER_DRAWS.length);
        const isMoving = fnIdx === 1 || fnIdx === 7; // walking or bicycle
        const speed = fnIdx === 7 ? 0.35 : 0.18;
        entities.push({
          type: fnIdx === 7 ? "bicycle" : "character",
          x: (i / numChars) * w + (Math.random() - 0.5) * 30,
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

      // Sort by layer then y for correct draw order
      entities.sort((a, b) => a.layer - b.layer || a.y - b.y);
      entitiesRef.current = entities;
    };

    const animate = (time: number) => {
      if (time - lastFrameTime.current > 700) {
        lastFrameTime.current = time;
        frameCount.current++;
        const w = canvas.offsetWidth;
        entitiesRef.current.forEach((e) => {
          e.frame = e.frame === 0 ? 1 : 0;
          if (e.dx !== 0) {
            e.x += e.dx * 10;
            if (e.type === "cloud") {
              if (e.x > w + 80) e.x = -80;
            } else {
              if (e.x > w + 60) e.x = -80;
              if (e.x < -90) e.x = w + 50;
            }
          }
        });
      }

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const sy = scrollY.current;

      ctx.clearRect(0, 0, w, h);

      // Sky + stars
      drawSky(ctx, w, h, starsRef.current, frameCount.current % 2);

      // Draw entities by layer with parallax offset
      const parallaxFactors = [0.1, 0.3, 0.5];

      entitiesRef.current.forEach((e) => {
        const pOff = sy * parallaxFactors[e.layer] * 0.15;
        const s = e.scale;
        const ey = e.y + pOff;
        const opacity = e.layer === 0 ? 0.2 : e.layer === 1 ? 0.35 : 0.5;

        ctx.save();
        ctx.globalAlpha = opacity;

        if (e.type === "cloud") {
          drawCloud(ctx, e.x, ey, s, e.variant);
        } else if (e.type === "building") {
          drawBuilding(ctx, e.x, ey, s, e.variant, e.frame);
        } else if (e.type === "tree") {
          drawTree(ctx, e.x, ey, s, e.variant);
        } else if (e.type === "lamp") {
          ctx.globalAlpha = 0.6;
          drawLamp(ctx, e.x, ey, s, e.frame);
        } else if ((e.type === "character" || e.type === "bicycle") && e.drawFn && e.palette) {
          ctx.globalAlpha = 0.55;
          e.drawFn(ctx, e.x, ey - 9*s, s, e.palette, e.frame);
        }

        ctx.restore();
      });

      // Ground (foreground, no parallax)
      ctx.globalAlpha = 0.5;
      drawGround(ctx, w, h - 60);
      ctx.globalAlpha = 1;

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
