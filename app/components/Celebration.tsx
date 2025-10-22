"use client";
import { useEffect, useState } from "react";
import { Sparkles, Star, Zap, Trophy } from "lucide-react";

interface CelebrationProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  icon?: "sparkles" | "star" | "zap" | "trophy";
  onClose?: () => void;
  duration?: number;
}

export default function Celebration({
  isOpen,
  title,
  subtitle,
  icon = "sparkles",
  onClose,
  duration = 3000,
}: CelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!show) return null;

  const iconMap = {
    sparkles: Sparkles,
    star: Star,
    zap: Zap,
    trophy: Trophy,
  };

  const IconComponent = iconMap[icon];

  return (
    <>
      {/* Confetti Canvas */}
      <Confetti isActive={show} />

      {/* Celebration Content */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
        <div
          className={`
            transform transition-all duration-500 ease-out
            ${
              show
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0"
            }
            pointer-events-auto
          `}
        >
          <div className="flex flex-col items-center justify-center">
            {/* Icon with animation */}
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-2xl opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-6 shadow-2xl">
                <IconComponent className="h-16 w-16 text-white animate-bounce" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl sm:text-5xl font-black text-center mb-3 text-white drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              {title}
            </h2>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-lg sm:text-xl text-white/90 text-center drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                {subtitle}
              </p>
            )}

            {/* Decorative elements */}
            <div className="mt-8 flex gap-4 justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`
                    w-3 h-3 rounded-full
                    animate-bounce
                    ${
                      i % 3 === 0
                        ? "bg-blue-400 delay-0"
                        : i % 3 === 1
                          ? "bg-purple-400 delay-100"
                          : "bg-pink-400 delay-200"
                    }
                  `}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background blur overlay */}
      <div
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 pointer-events-none z-40
          ${show ? "opacity-100" : "opacity-0"}
        `}
      ></div>
    </>
  );
}

// Confetti Component
function Confetti({ isActive }: { isActive: boolean }) {
  useEffect(() => {
    if (!isActive) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "45";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      document.body.removeChild(canvas);
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create confetti particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotationVel: number;
      life: number;
      color: string;
      type: "circle" | "square" | "star";
    }> = [];

    const colors = [
      "#3b82f6", // blue
      "#a855f7", // purple
      "#ec4899", // pink
      "#fbbf24", // amber
      "#10b981", // emerald
      "#06b6d4", // cyan
    ];

    // Generate confetti particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 5 + 3,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationVel: (Math.random() - 0.5) * 0.3,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: (
          ["circle", "square", "star"][
            Math.floor(Math.random() * 3)
          ] as "circle" | "square" | "star"
        ),
      });
    }

    let animationId: number;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Physics
        p.vy += 0.2; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationVel;
        p.life -= 0.01;

        // Draw particle
        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          if (p.type === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === "square") {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else {
            // star
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
              const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
              const x = Math.cos(angle) * (p.size / 2);
              const y = Math.sin(angle) * (p.size / 2);
              if (j === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        } else {
          particles.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    };

    animationId = requestAnimationFrame(animate);

    // Cleanup on resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  }, [isActive]);

  return null;
}
