import type User from "./IUserType";

export type ThemeConfig = {
  background?: string;
  fontFamily?: string;
  highlightTone?: string;
  inputBackground?: string;
  inputBorderColor?: string;
  inputTransparent?: boolean;
  // adicione outros tokens globais se o front usar
};

export type HeroConfig = {
  showHero?: boolean;
  copy?: {
    kicker?: string;
    title?: string;
    highlight?: string;
    subtitle?: string;
  };
  slide?: {
    badge?: string;
    mapTitle?: string;
    mapSubtitle?: string;
    slides?: Array<{
      title?: string;
      description?: string;
      image?: string;
    }>;
  };
  cards?: {
    count?: number;
    items?: Array<{
      metric: string;
      title: string;
      subtitle?: string;
    }>;
  };
  clima?: {
    metric?: string;
    title?: string;
    subtitle?: string;
  };
};

export default interface Projeto {
  id: number;
  slug: string;
  name: string;
  cliente?: string;
  descricaoCurta?: string;
  logoUrl?: string;
  corHex?: string;
  ativo: boolean;
  themeConfig?: ThemeConfig;
  heroConfig?: HeroConfig;
  users?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjetoBasicFormValues {
  slug: string;
  name: string;
  cliente?: string;
  descricaoCurta?: string;
  corHex?: string;
  logoUrl?: string;
  ativo: boolean;
  themeConfig?: ThemeConfig;
  heroConfig?: HeroConfig;
}
