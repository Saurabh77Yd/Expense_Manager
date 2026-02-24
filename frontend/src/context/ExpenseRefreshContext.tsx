import { createContext, useContext, useState, ReactNode } from "react";

interface RefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
}

const ExpenseRefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function ExpenseRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ExpenseRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </ExpenseRefreshContext.Provider>
  );
}

export function useExpenseRefresh() {
  const context = useContext(ExpenseRefreshContext);
  if (!context) {
    throw new Error("useExpenseRefresh must be used inside ExpenseRefreshProvider");
  }
  return context;
}