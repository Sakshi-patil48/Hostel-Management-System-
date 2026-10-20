import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable Search Bar Component with Clear button
 *
 * @param {Object} props
 * @param {string} props.value
 * @param {(val: string) => void} props.onChange
 * @param {string} [props.placeholder='Search...']
 * @param {string} [props.className='']
 */
export function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search...',
  className = '',
}) {
  return (
    <div className={`search-input-wrap ${className}`}>
      <Search size={16} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input-field"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="search-clear-btn"
          aria-label="Clear search"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary, #94A3B8)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
