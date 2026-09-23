import { useRef, useState, useCallback } from 'react';
import './GlassCard.css';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = 'green',
  enableTilt = true,
  onClick,
  style = {}
}) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!hover || !enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = (x / rect.width - 0.5);
    const py = (y / rect.height - 0.5);

    const rotX = -py * 7;
    const rotY = px * 7;

    setTransformStyle(`perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1
    });
  }, [hover, enableTilt]);

  const handleMouseLeave = () => {
    if (!hover || !enableTilt) return;
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${glow ? `glass-card-glow-${glow}` : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: transformStyle,
        ...style
      }}
    >
      <div
        className="glass-card-glare"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(0, 230, 138, 0.12) 0%, transparent 60%)`,
          opacity: glarePos.opacity
        }}
      />
      <div className="glass-card-inner">
        {children}
      </div>
    </div>
  );
}
