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
  colorClass,
  icon,
  numericValue,
  value,
  prefix = '',
  suffix = '',
  isPercentage = false,
  label,
  title,
  subText = '',
  subtitle,
  badgeNode = null,
  className = '',
}) {
  const actualColor = colorClass || color || 'purple';
  const actualLabel = label || title || '';
  const actualSubText = subText || subtitle || '';

  const rawValue = value !== undefined ? value : (numericValue !== undefined ? numericValue : 0);
  const isNumber = typeof rawValue === 'number';
  const animatedValue = useCountUp(isNumber ? rawValue : 0, 900, isPercentage);

  const formattedDisplay = isNumber
    ? (isPercentage ? animatedValue : animatedValue.toLocaleString('en-IN'))
    : rawValue;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))) {
      const IconComponent = icon;
      return <IconComponent size={22} />;
    }
    return null;
  };

  return (
    <TiltCard className={`metric-kpi-card ${actualColor} ${className}`}>
      <div className="card-inner-flex">
        <div className={`kpi-icon-box ${actualColor}`}>
          {renderIcon()}
        </div>
        <div className="kpi-data-block">
          <div className="kpi-top-row">
            <span className="kpi-number">
              {prefix}{formattedDisplay}{suffix}
            </span>
            {badgeNode}
          </div>
          <span className="kpi-label-text">{actualLabel}</span>
          {actualSubText && <span className="kpi-sub-text">{actualSubText}</span>}
        </div>
      </div>
    </TiltCard>
  );
}

export default MetricCard;
