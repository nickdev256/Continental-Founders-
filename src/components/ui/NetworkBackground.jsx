import { useEffect, useRef } from "react";

export default function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let animationFrame;
    let particles = [];

    const mouse = {
      x: null,
      y: null,
      radius: 240,
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
    };

    const createParticles = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      const count = Math.min(
        85,
        Math.max(40, Math.floor((width * height) / 19000))
      );

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,

        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,

        radius: Math.random() * 1.5 + 0.6,
      }));
    };

  const handleMouseMove = (event) => {
  const rect = canvas.getBoundingClientRect();

  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
};

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      // ---------------------------------------
      // PARTICLES
      // ---------------------------------------

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Keep particles inside the hero
        if (particle.x < 0 || particle.x > width) {
          particle.vx *= -1;
        }

        if (particle.y < 0 || particle.y > height) {
          particle.vy *= -1;
        }

        // ---------------------------------------
        // CURSOR INTERACTION
        // ---------------------------------------

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius && distance > 0) {
            const force =
              (mouse.radius - distance) / mouse.radius;

            // Pull particles gently toward cursor
            particle.x +=
              (dx / distance) *
              force *
              1.2;

            particle.y +=
              (dy / distance) *
              force *
              1.2;
          }
        }

        // ---------------------------------------
        // DRAW PARTICLE
        // ---------------------------------------

        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "rgba(201, 150, 46, 0.75)";

        ctx.fill();
      });

      // ---------------------------------------
      // PARTICLE TO PARTICLE CONNECTIONS
      // ---------------------------------------

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx =
            particles[i].x -
            particles[j].x;

          const dy =
            particles[i].y -
            particles[j].y;

          const distance = Math.sqrt(
            dx * dx + dy * dy
          );

          if (distance < 145) {
            const opacity =
              (1 - distance / 145) * 0.28;

            ctx.beginPath();

            ctx.moveTo(
              particles[i].x,
              particles[i].y
            );

            ctx.lineTo(
              particles[j].x,
              particles[j].y
            );

            ctx.strokeStyle =
              `rgba(201, 150, 46, ${opacity})`;

            ctx.lineWidth = 0.75;

            ctx.stroke();
          }
        }
      }

      // ---------------------------------------
      // CURSOR TO PARTICLE CONNECTIONS
      // ---------------------------------------

      if (mouse.x !== null && mouse.y !== null) {
        particles.forEach((particle) => {
          const dx =
            particle.x - mouse.x;

          const dy =
            particle.y - mouse.y;

          const distance = Math.sqrt(
            dx * dx + dy * dy
          );

          if (
            distance < mouse.radius &&
            distance > 0
          ) {
            const opacity =
              (1 - distance / mouse.radius) * 0.5;

            ctx.beginPath();

            ctx.moveTo(
              mouse.x,
              mouse.y
            );

            ctx.lineTo(
              particle.x,
              particle.y
            );

            ctx.strokeStyle =
              `rgba(201, 150, 46, ${opacity})`;

            ctx.lineWidth = 0.8;

            ctx.stroke();
          }
        });

        // ---------------------------------------
        // CURSOR GLOW
        // ---------------------------------------

        const gradient =
          ctx.createRadialGradient(
            mouse.x,
            mouse.y,
            0,
            mouse.x,
            mouse.y,
            35
          );

        gradient.addColorStop(
          0,
          "rgba(201, 150, 46, 0.25)"
        );

        gradient.addColorStop(
          1,
          "rgba(201, 150, 46, 0)"
        );

        ctx.beginPath();

        ctx.arc(
          mouse.x,
          mouse.y,
          35,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = gradient;

        ctx.fill();

        // Cursor central point
        ctx.beginPath();

        ctx.arc(
          mouse.x,
          mouse.y,
          2.2,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "rgba(201, 150, 46, 0.95)";

        ctx.fill();
      }

      animationFrame =
        requestAnimationFrame(animate);
    };

    resizeCanvas();

    window.addEventListener(
  "mousemove",
  handleMouseMove
);

window.addEventListener(
  "mouseleave",
  handleMouseLeave
);

window.addEventListener(
  "mouseleave",
  handleMouseLeave
);

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener(
        "resize",
        resizeCanvas
      );

     window.removeEventListener(
  "mousemove",
  handleMouseMove
);

window.removeEventListener(
  "mouseleave",
  handleMouseLeave
);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="network-background"
      aria-hidden="true"
    />
  );
}