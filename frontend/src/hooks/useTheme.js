import { useThemeContext } from '../context/ThemeContext';

/**
 * Custom hook to access application theme mode and switcher
 * @returns {import('../context/ThemeContext').ThemeContextValue}
 */
export function useTheme() {
  return useThemeContext();
}

export default useTheme;
