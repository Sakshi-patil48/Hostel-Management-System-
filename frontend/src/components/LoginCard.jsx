import React, { useState, useRef, useEffect } from 'react';
import HostelIllustration from './HostelIllustration';
import LoginForm from './LoginForm';

/**
 * LoginCard Component
 * - Centered pastel pink glassmorphic panel matching Screenshot 1
 * - 3D interactive tilt effect on cursor tracking
 * - Smooth fade-in & scale-up mount animation
 * - Responsive two-column layout (stacks gracefully on mobile)
 */
export default function LoginCard({ mousePos }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized values: -1 to 1
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    // Subtle 3D tilt angles (max ~4.5 degrees)
    setTilt({
      rotateX: -normY * 4.5,
      rotateY: normX * 4.5,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const transformStyle = prefersReducedMotion
    ? 'none'
    : `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(0)`;

  return (
    <div className="login-card-anchor">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="login-card-3d-panel animate-mount"
        style={{
          transform: transformStyle,
          transition: isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease',
        }}
      >
        {/* Subtle glass reflection shimmer on top edge */}
        <div className="card-top-highlight" />

        {/* Two-Column Interior Grid */}
        <div className="card-grid-layout">
          {/* Left Column: 3D House Illustration & HOSTEL Brand */}
          <div className="card-left-column">
            <HostelIllustration />
          </div>

          {/* Vertical Divider Line with subtle soft pink groove */}
          <div className="card-column-divider" aria-hidden="true" />

          {/* Right Column: Username, Password, Show Password, Login Button */}
          <div className="card-right-column">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
