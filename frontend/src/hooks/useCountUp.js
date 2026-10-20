import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp Hook
 * Animates a numerical counter smoothly from 0 to target value using requestAnimationFrame.
 *
 * @param {number} target - The final target numeric value
 * @param {number} duration - Animation duration in ms (default: 800ms)
 * @param {boolean} isPercentage - Whether the number represents a percentage (one decimal place)
 * @returns {number|string} Current animated value
 */
export function useCountUp(target = 0, duration = 800, isPercentage = false) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetNum = Number(target) || 0;
  const startRef = useRef(0);
  const rafId = useRef(null);

  useEffect(() => {
    // If user prefers reduced motion, jump directly to target
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || duration <= 0) {
      setDisplayValue(targetNum);
      return;
    }

    startRef.current = performance.now();
    const startValue = 0;
    const diff = targetNum - startValue;

    const animate = (currentTime) => {
      const elapsed = currentTime - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out quad curve: progress * (2 - progress)
      const easeProgress = progress * (2 - progress);
      const current = startValue + diff * easeProgress;

      if (progress < 1) {
        setDisplayValue(isPercentage ? parseFloat(current.toFixed(1)) : Math.round(current));
        rafId.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetNum);
      }
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [targetNum, duration, isPercentage]);

  return displayValue;
}

export default useCountUp;
