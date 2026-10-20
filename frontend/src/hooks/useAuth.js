import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication state and session methods
 * @returns {import('../context/AuthContext').AuthContextValue}
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
