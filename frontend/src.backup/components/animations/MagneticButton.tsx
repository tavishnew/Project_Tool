import React, { useRef, useState } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.3,
  className = "",
  onClick,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - (rect.left + rect.width / 2)) * strength,
      y: (e.clientY - (rect.top + rect.height / 2)) * strength,
    });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  const style = {
    transform: isHovered ? `translate(${pos.x}px, ${pos.y}px)` : "translate(0, 0)",
    transition: isHovered ? "transform 0.1s ease-out" : "transform 0.3s ease-out",
  };

  return (
    <button
      ref={ref}
      className={className}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); handleMouseLeave(); }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
