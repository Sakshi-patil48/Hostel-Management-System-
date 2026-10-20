import React, { useState, useEffect } from 'react';
import hostelBg from '../assets/gh-raisoni-hostel.png';

/**
 * CampusBackground Component
 * - Full viewport architectural background using authentic G H Raisoni Hostel photograph
 * - Preserves natural building proportions, details, and sharpness
 * - Subtle mouse-responsive 3D parallax effect with safe edge bleed
 * - Soft lavender-white translucent overlay for optimal glassmorphic card legibility
 * - Respects prefers-reduced-motion and responsive touch viewports
 */
export default function CampusBackground({ children, mousePos }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Parallax calculations (subtle shift opposite to mouse direction)
  const parallaxX = prefersReducedMotion ? 0 : (mousePos?.x || 0) * -6;
  const parallaxY = prefersReducedMotion ? 0 : (mousePos?.y || 0) * -4;

  return (
    <div className="campus-background-container">
      {/* 3D Architectural Scene Layer */}
      <div
        className="campus-image-layer"
        style={{
          transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
          transition: prefersReducedMotion ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.3, 1)',
        }}
      >
        <img
          src={hostelBg || '/assets/gh-raisoni-hostel.png'}
          alt="G H Raisoni College Hostel Building"
          className={`campus-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          draggable="false"
          loading="eager"
        />
      </div>

      {/* Subtle lavender-white luminous overlay for card legibility */}
      <div className="campus-lighting-overlay" />
      <div className="campus-vignette-overlay" />

      {/* Ambient soft floating particles */}
      <div className="ambient-particles" aria-hidden="true">
        <span className="particle particle-1" />
        <span className="particle particle-2" />
        <span className="particle particle-3" />
        <span className="particle particle-4" />
        <span className="particle particle-5" />
      </div>

      {/* Foreground Content (Login Card / Modal) */}
      <div className="campus-content-layer">
        {children}
      </div>
    </div>
  );
}
