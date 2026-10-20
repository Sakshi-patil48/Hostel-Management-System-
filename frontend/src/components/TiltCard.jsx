import React, { useState, useRef, useEffect } from 'react';

/**
 * TiltCard Component
 * Provides subtle, hardware-accelerated 3D perspective tilt on hover.
 * Gracefully respects prefers-reduced-motion.
 */
export default function TiltCard({
  children,
  className = '',
  onClick,
  maxTilt = 5,
  style = {},
  ...props
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, isHovered: false });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleMouseMove = (e) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalised coordinate range from -1 to 1
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    setTilt({
      rotateX: -normY * maxTilt,
      rotateY: normX * maxTilt,
      isHovered: true,
    });
  };

  const handleMouseEnter = () => {
    setTilt((prev) => ({ ...prev, isHovered: true }));
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false });
  };

  const transformStyle = reducedMotion
    ? undefined
    : tilt.isHovered
    ? `perspective(800px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translateY(-4px) translateZ(8px)`
    : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) translateZ(0)';

  return (
    <div
      ref={cardRef}
      className={`tilt-card-3d-wrapper ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: transformStyle,
        transition: tilt.isHovered
          ? 'transform 0.12s ease-out, box-shadow 0.22s ease-out'
          : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease-out',
        willChange: tilt.isHovered ? 'transform' : 'auto',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
