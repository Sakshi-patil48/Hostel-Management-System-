import React from 'react';

/**
 * HostelIllustration Component
 * - 3D white hostel building with floating animation
 * - Dynamic breathing ground drop-shadow
 * - G H Raisoni Hostel branding in dark readable text (#25233A) with subtle violet badge (#8B7AE8)
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

      {/* Stylized Brand Title with G H Raisoni branding */}
      <div className="hostel-title-container">
        <div className="hostel-institution-badge">GHRCEM RESIDENTIAL CAMPUS</div>
        <h1 className="hostel-brand-title">G H RAISONI</h1>
        <span className="hostel-brand-subtitle">HOSTEL MANAGEMENT SYSTEM</span>
      </div>
    </div>
  );
}
