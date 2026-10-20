import React from 'react';
import TiltCard from './TiltCard';
import { useCountUp } from '../../hooks/useCountUp';

/**
 * MetricCard Component
 * Encapsulates interactive 3D perspective tilt, smooth numerical count-up, icon box, and labels
 *
 * @param {Object} props
 * @param {'purple'|'blue'|'emerald'|'amber'|'rose'} [props.color='purple']
 * @param {React.ReactNode} props.icon
 * @param {number} props.numericValue - Raw numeric value to count up
 * @param {string} [props.prefix=''] - E.g. '₹ '
 * @param {string} [props.suffix=''] - E.g. '%'
 * @param {boolean} [props.isPercentage=false]
 * @param {string} props.label - E.g. 'Total Residents'
 * @param {string} [props.subText=''] - E.g. '9 Enrolled Active'
 * @param {React.ReactNode} [props.badgeNode] - Custom badge node or chip
 * @param {string} [props.className='']
 */
export function MetricCard({
  color = 'purple',
  icon,
  numericValue = 0,
  prefix = '',
  suffix = '',
  isPercentage = false,
  label,
  subText = '',
  badgeNode = null,
  className = '',
}) {
  const animatedValue = useCountUp(numericValue, 900, isPercentage);

  const formattedDisplay = isPercentage
    ? animatedValue
    : typeof animatedValue === 'number'
    ? animatedValue.toLocaleString('en-IN')
    : animatedValue;

  return (
    <TiltCard className={`metric-kpi-card ${color} ${className}`}>
      <div className="card-inner-flex">
        <div className={`kpi-icon-box ${color}`}>
          {icon}
        </div>
        <div className="kpi-data-block">
          <div className="kpi-top-row">
            <span className="kpi-number">
              {prefix}{formattedDisplay}{suffix}
            </span>
            {badgeNode}
          </div>
          <span className="kpi-label-text">{label}</span>
          {subText && <span className="kpi-sub-text">{subText}</span>}
        </div>
      </div>
    </TiltCard>
  );
}

export default MetricCard;
