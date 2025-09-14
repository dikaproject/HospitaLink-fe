import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size = 80, 
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [value, size]);

  return (
    <canvas 
      ref={canvasRef}
      className={`rounded-lg ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default QRCodeDisplay;