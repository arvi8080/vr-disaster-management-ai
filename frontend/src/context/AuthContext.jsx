import { createContext, useContext, useMemo } from "react";
const C = createContext({ user: null, isAuthenticated: false, loading: true });
export function AuthProvider({ children, user = null, loading = true }) {
  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), loading }), [user, loading]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useAuth = () => useContext(C);
