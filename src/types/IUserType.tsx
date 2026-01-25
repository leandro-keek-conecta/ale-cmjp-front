
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
}

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
  hiddenScreens?: UserHiddenScreen[];
}
