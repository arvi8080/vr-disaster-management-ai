import { createContext, useContext, useState } from "react";
const C = createContext(null);
export function TrainingProvider({ children }) {
  const [session, setSession] = useState(null);
  return <C.Provider value={{ session, setSession }}>{children}</C.Provider>;
}
export const useTraining = () => useContext(C);
