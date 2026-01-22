import { createContext, useContext, useState, ReactNode } from "react";

// Define o formato do Contexto
interface SidebarContextProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

// Criando o Contexto com valor inicial
const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

// Provider que vai envolver a aplicação
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Hook customizado para usar o contexto facilmente
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar deve ser usado dentro de um SidebarProvider");
  }
  return context;
}
