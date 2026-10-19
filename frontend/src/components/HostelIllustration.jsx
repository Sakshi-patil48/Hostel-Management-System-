import React from 'react';

/**
 * HostelIllustration Component
 * - 3D white hostel building with vibrant lime-green gable roof, chimney & grass
 * - Gentle floating 3D animation
 * - Dynamic ground drop-shadow
 * - Stylized "HOSTEL" title matching Screenshot 1 reference
 */
export default function HostelIllustration() {
  return (
    <div className="hostel-illustration-wrapper">
      <div className="hostel-illustration-container">
        {/* Floating 3D House Image */}
        <div className="floating-hostel-element">
          <img
            src="/assets/hostel_3d.png"
            alt="Hostel 3D Architectural Model"
            className="hostel-3d-graphic"
            draggable="false"
          />
        </div>

        {/* Dynamic breathing shadow beneath floating house */}
        <div className="hostel-ground-shadow" />
      </div>

      {/* Stylized Title matching Reference Screenshot */}
      <div className="hostel-title-container">
        <h1 className="hostel-brand-title">HOSTEL</h1>
        <span className="hostel-brand-subtitle">MANAGEMENT SYSTEM</span>
      </div>
    </div>
  );
}
