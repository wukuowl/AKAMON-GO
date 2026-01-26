import React, { useRef, useEffect, useState } from 'react';

interface ChromaKeyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const ChromaKeyImage: React.FC<ChromaKeyImageProps> = ({ src, alt, className, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous"; // Required for manipulating pixels from external URLs
    img.src = src;

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw initial image
      ctx.drawImage(img, 0, 0);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Loop through pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green Screen Logic:
        // Detect if Green is the dominant color
        // Thresholds: Green must be fairly bright (>70) and significantly brighter than Red and Blue
        if (g > 70 && g > r * 1.2 && g > b * 1.2) {
          data[i + 3] = 0; // Set Alpha to 0 (Transparent)
        }
      }

      // Put processed image back
      ctx.putImageData(imageData, 0, 0);
    };
  }, [src]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className} 
      style={style}
      role="img"
      aria-label={alt}
    />
  );
};

export default ChromaKeyImage;