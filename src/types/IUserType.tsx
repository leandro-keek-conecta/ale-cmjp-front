
import type Projeto from "./IProjetoType";
import type { Role } from "./IRoleType";

export type ProjetoAccessLevel =
  | "FULL_ACCESS"
  | "AUTOMATIONS_ONLY"
  | "DASH_ONLY";

export interface ProjetoUserPivot {
  userId: number;
  projetoId: number;
  assignedAt: string;
  projeto: Projeto;
  access?: ProjetoAccessLevel;
  hiddenTabs?: string[];
  allowedThemes?: string[];
  temasPermitidos?: string[];
}

export interface UserProjectAccessScope {
  projectId: number;
  name?: string;
  slug?: string;
  access?: ProjetoAccessLevel;
  hiddenTabs?: string[];
  allowedThemes?: string[];
  temasPermitidos?: string[];
}

export type UserProjectAccessById = Record<string, UserProjectAccessScope>;

export interface UserHiddenScreen {
  id?: number;
  userId?: number;
  projetoId?: number;
  screenName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default interface User {
  id?: number;
  email: string;
  password?: string;
  name?: string;
  profession?: string;
  role?: Role;
  projetoId?: number;
  projeto?: Projeto;
  projetos?: ProjetoUserPivot[];
  projectAccessById?: UserProjectAccessById;
  hiddenScreens?: UserHiddenScreen[];
}
