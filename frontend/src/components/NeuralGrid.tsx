import { useEffect, useRef } from "react";

const SPACING = 44;
const DOT_R = 1.1;
const BASE_OPACITY = 0.1;
const PULSE_WIDTH = 120;
const PULSE_SPEED = 1.4;
const CYAN = { r: 0, g: 212, b: 255 };

const NeuralGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let pulseX = -PULSE_WIDTH;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / SPACING) + 2;
      const rows = Math.ceil(canvas.height / SPACING) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING;
          const y = r * SPACING;
          const dist = Math.abs(x - pulseX);
          let opacity = BASE_OPACITY;
          if (dist < PULSE_WIDTH) {
            const factor = 1 - dist / PULSE_WIDTH;
            opacity = BASE_OPACITY + factor * 0.45;
          }
          ctx.beginPath();
          ctx.arc(x, y, DOT_R, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${CYAN.r},${CYAN.g},${CYAN.b},${opacity.toFixed(3)})`;
          ctx.fill();
        }
      }

      pulseX += PULSE_SPEED;
      if (pulseX > canvas.width + PULSE_WIDTH) pulseX = -PULSE_WIDTH;
      animationId = requestAnimationFrame(drawFrame);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Static dot grid, no animation
      const cols = Math.ceil(window.innerWidth / SPACING) + 2;
      const rows = Math.ceil(window.innerHeight / SPACING) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.beginPath();
          ctx.arc(c * SPACING, r * SPACING, DOT_R, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${CYAN.r},${CYAN.g},${CYAN.b},${BASE_OPACITY})`;
          ctx.fill();
        }
      }
    } else {
      drawFrame();
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="neural-grid-root">
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
};

export default NeuralGrid;
