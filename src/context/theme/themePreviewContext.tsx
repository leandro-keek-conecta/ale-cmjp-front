// CustomizationContext.tsx
import { createContext, useState } from 'react';
import type { ReactNode } from "react";

// 1. Definimos o que será guardado
interface CustomizationData {
  background: string;
  kicker: string;
  title: string;
  highlight: string;
  subtitle: string;
  fontFamily: string;
}

interface CustomizationContextType {
  settings: CustomizationData;
  setSettings: (data: CustomizationData) => void;
}

export const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export const CustomizationProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<CustomizationData>({
    background: "#f5f7fb",
    kicker: "Monitorando a voz da cidade",
    title: "Opinião em ",
    highlight: "tempo real",
    subtitle: "Veja o que as pessoas estão falando...",
    fontFamily: "Work Sans"
  });

  return (
    <CustomizationContext.Provider value={{ settings, setSettings }}>
      {children}
    </CustomizationContext.Provider>
  );
};