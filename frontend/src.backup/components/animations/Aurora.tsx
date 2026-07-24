import React from 'react';

interface AuroraProps {
  colorStops?: [string, string, string];
  speed?: number;
  className?: string;
}

export const Aurora: React.FC<AuroraProps> = ({
  colorStops = ['#1E3A5F', '#3DDC97', '#2E86AB'],
  speed = 15,
  className = '',
}) => (
  <div
    className={`absolute inset-0 opacity-20 ${className}`}
    style={{
      background: `linear-gradient(-45deg, ${colorStops[0]}, ${colorStops[1]}, ${colorStops[2]}, ${colorStops[0]})`,
      backgroundSize: '400% 400%',
      animation: `aurora ${speed}s ease infinite`,
    }}
  />
);
