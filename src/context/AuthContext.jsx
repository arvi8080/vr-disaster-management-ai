import { createContext, useContext, useMemo, useState } from "react";
const C = createContext(null);
export function AuthProvider({ children }) {
  const [user] = useState({ name: "Gaurav Thakur", role: "admin" });
  const value = useMemo(() => ({ user, isAuthenticated: true }), [user]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useAuth = () => useContext(C);
