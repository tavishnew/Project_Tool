import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 150);
  };

  return (
    <div
      className={cn(
        "transition-opacity duration-150 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        isExiting && "opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}